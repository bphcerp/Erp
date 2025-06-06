import express from "express";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import { checkAccess } from "@/middleware/auth.ts";
import db from "@/config/db/index.ts";
import { eq } from "drizzle-orm";
import { HttpError, HttpCode } from "@/config/errors.ts";
import { faculty } from "@/config/db/schema/admin.ts";

const router = express.Router();

router.get(
    "/",
    checkAccess(),
    asyncHandler(async (req, res, next) => {
        const userEmail = req.user!.email;

        const result = await db
            .select({
                authorId: faculty.authorId,
            })
            .from(faculty)
            .where(eq(faculty.email, userEmail));

        if (result.length === 0 || result[0].authorId === null) {
            return next(
                new HttpError(
                    HttpCode.NOT_FOUND,
                    "No Author ID found for this user."
                )
            );
        }

        res.status(200).json({ authorId: result[0].authorId });
    })
);

export default router;
