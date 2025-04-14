import { HttpCode, HttpError } from "@/config/errors.ts";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import express from "express";
import { authUtils, conferenceSchemas } from "lib";
import { getApplicationById } from "@/lib/conference/index.ts";
import db from "@/config/db/index.ts";
import {
    conferenceApprovalApplications,
    conferenceMemberReviews,
} from "@/config/db/schema/conference.ts";
import { eq } from "drizzle-orm";

const router = express.Router();

router.post(
    "/:id",
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

        if (isHoD)
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
        if (applicationStateIndex !== 2)
            return next(
                new HttpError(
                    HttpCode.BAD_REQUEST,
                    applicationStateIndex < 2
                        ? "Application is not ready to be reviewed yet"
                        : "Application is already reviewed by DRC Convener"
                )
            );

        await db.transaction(async (tx) => {
            await tx
                .update(conferenceApprovalApplications)
                .set({
                    state: conferenceSchemas.states[
                        applicationStateIndex + (status ? 1 : -2)
                    ],
                })
                .where(eq(conferenceApprovalApplications.id, id));

            tx.delete(conferenceMemberReviews).where(
                eq(conferenceMemberReviews.applicationId, id)
            );

            tx.insert(conferenceMemberReviews).values([
                {
                    applicationId: application.id,
                    reviewerEmail: req.user!.email,
                    status: status,
                    comments: comments,
                },
            ]);
        });
        res.status(200).send();
    })
);

export default router;
