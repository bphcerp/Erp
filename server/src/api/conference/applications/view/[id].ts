import { HttpCode, HttpError } from "@/config/errors.ts";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import express from "express";
import { authUtils } from "lib";
import { checkAccess } from "@/middleware/auth.ts";
import { getApplicationWithFileUrls } from "@/lib/conference/index.ts";
import db from "@/config/db/index.ts";

const router = express.Router();

router.get(
    "/:id",
    checkAccess(),
    asyncHandler(async (req, res, next) => {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0)
            return next(new HttpError(HttpCode.BAD_REQUEST, "Invalid id"));

        const isMember = authUtils.checkAccess(
            "conference:application:review-application-member",
            req.user!.permissions
        );
        const isHoD = authUtils.checkAccess(
            "conference:application:review-application-hod",
            req.user!.permissions
        );
        const isConvener = authUtils.checkAccess(
            "conference:application:review-application-convener",
            req.user!.permissions
        );

        const application = await getApplicationWithFileUrls(id);

        if (!application)
            return next(
                new HttpError(HttpCode.NOT_FOUND, "Application not found")
            );

        const reviews = await db.query.conferenceMemberReviews.findMany({
            where: (review, { eq }) => eq(review.applicationId, application.id),
            orderBy: (cols, { desc }) => desc(cols.createdAt),
        });
        const isReviewed = reviews.filter(
            (r) => r.reviewerEmail === req.user?.email
        ).length;

        if (
            !(application.userEmail === req.user!.email) &&
            isMember &&
            (application.state !== "DRC Member" || isReviewed)
        )
            return next(
                new HttpError(
                    HttpCode.FORBIDDEN,
                    "You are not allowed to view this application"
                )
            );

        const current = await db.query.conferenceGlobal.findFirst({
            where: (conferenceGlobal, { eq }) =>
                eq(conferenceGlobal.key, "directFlow"),
        });

        const isDirect = isConvener
            ? ((current && current.value === "true") ?? false)
            : undefined;

        const response = {
            application: {
                ...application,
                createdAt: application.createdAt.toLocaleString(),
            },
            reviews:
                (isConvener && application.state === "DRC Convener") ||
                (isHoD && application.state === "HoD")
                    ? reviews.map((x) => {
                          return {
                              status: x.status,
                              comments: x.comments,
                              createdAt: x.createdAt,
                          };
                      })
                    : application.userEmail === req.user!.email &&
                        application.state === "Faculty" &&
                        reviews[0]
                      ? [
                            {
                                comments: reviews[0].comments,
                                status: reviews[0].status,
                                createdAt: reviews[0].createdAt,
                            },
                        ]
                      : [],
            isDirect,
        };

        res.status(200).send(response);
    })
);

export default router;
