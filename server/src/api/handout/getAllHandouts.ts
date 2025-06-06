import db from "@/config/db/index.ts";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import express from "express";
import { checkAccess } from "@/middleware/auth.ts";
const router = express.Router();

router.get(
    "/",
    checkAccess(),
    asyncHandler(async (_req, res, _next) => {
        const handouts = (
            await db.query.courseHandoutRequests.findMany({
                with: {
                    ic: {
                        with: {
                            faculty: true,
                        },
                    },
                    reviewer: {
                        with: {
                            faculty: true,
                        },
                    },
                },
            })
        ).map((handout) => {
            return {
                ...handout,
                reviewerName: handout.reviewer?.faculty?.name ?? "N/A",
                professorName: handout.ic?.faculty?.name ?? "N/A",
            };
        });

        res.status(200).json({ success: true, handouts });
    })
);

export default router;
