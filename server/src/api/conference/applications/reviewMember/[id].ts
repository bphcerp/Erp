import { HttpCode, HttpError } from "@/config/errors.ts";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import express from "express";
import { authUtils, conferenceSchemas, permissions } from "lib";
import { getApplicationById } from "@/lib/conference/index.ts";
import db from "@/config/db/index.ts";
import {
    conferenceApprovalApplications,
    conferenceMemberReviews,
    conferenceStatusLog,
} from "@/config/db/schema/conference.ts";
import { eq } from "drizzle-orm";
import { getUsersWithPermission } from "@/lib/common/index.ts";
import { checkAccess, dequerify } from "@/middleware/auth.ts";

const router = express.Router();

router.post(
    "/:id",
    checkAccess(),
    asyncHandler(async (req, res, next) => {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0)
            return next(new HttpError(HttpCode.BAD_REQUEST, "Invalid id"));

        const { status, comments } =
            conferenceSchemas.reviewApplicationBodySchema.parse(req.body);

        const isHoD = authUtils.checkAccess(
            "conference:application:review-application-hod",
            req.user!.permissions
        );

        const isConvener = authUtils.checkAccess(
            "conference:application:review-application-convener",
            req.user!.permissions
        );

        if (isHoD || isConvener)
            return next(
                new HttpError(
                    HttpCode.FORBIDDEN,
                    "You are not allowed to review this application yet"
                )
            );

        const application = await getApplicationById(id);
        if (!application)
            return next(
                new HttpError(HttpCode.NOT_FOUND, "Application not found")
            );

        const applicationStateIndex = conferenceSchemas.states.indexOf(
            application.state
        );
        if (applicationStateIndex !== 1)
            return next(
                new HttpError(
                    HttpCode.BAD_REQUEST,
                    applicationStateIndex < 1
                        ? "Application is not ready to be reviewed yet"
                        : "Application is already reviewed by DRC Members"
                )
            );

        const otherReviewers = new Set(
            (
                await db.query.conferenceMemberReviews.findMany({
                    where: (r) => eq(r.applicationId, id),
                })
            ).map((u) => u.reviewerEmail)
        );
        otherReviewers.add(req.user!.email);
        const allReviewers = new Set(
            (
                await getUsersWithPermission(
                    permissions[dequerify(req.baseUrl)]
                )
            ).map((u) => u.email)
        );

        await db.transaction(async (tx) => {
            if (allReviewers.difference(otherReviewers).size === 0) {
                // If all DRC Members have reviewed the application, move state to DRC member
                await tx
                    .update(conferenceApprovalApplications)
                    .set({
                        state: conferenceSchemas.states[
                            applicationStateIndex + 1
                        ],
                    })
                    .where(eq(conferenceApprovalApplications.id, id));
            }

            await tx.insert(conferenceMemberReviews).values([
                {
                    applicationId: application.id,
                    reviewerEmail: req.user!.email,
                    status: status,
                    comments: comments,
                },
            ]);
            await tx.insert(conferenceStatusLog).values({
                applicationId: application.id,
                userEmail: req.user!.email,
                action: `Member ${status ? "approved" : "rejected"}`,
                comments,
            });
        });

        res.status(200).send();
    })
);

export default router;
