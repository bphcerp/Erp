import express from "express";
import db from "@/config/db/index.ts";
import { faculty, phd, staff, userType } from "@/config/db/schema/admin.ts";
import { eq } from "drizzle-orm";
import { HttpError, HttpCode } from "@/config/errors.ts";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import { checkAccess } from "@/middleware/auth.ts";
import { adminSchemas } from "lib";

const router = express.Router();

router.post(
    "/",
    checkAccess(),
    asyncHandler(async (req, res, next) => {
        const parsed = adminSchemas.editDetailsBodySchema.parse(req.body);
        const toUpdate =
            parsed.type === userType.enumValues[0]
                ? faculty
                : parsed.type === userType.enumValues[1]
                  ? phd
                  : staff;
        try {
            const updated = await db
                .update(toUpdate)
                .set({
                    ...parsed,
                })
                .where(eq(toUpdate.email, parsed.email))
                .returning();
            if (updated.length === 0) throw new Error("User not found");
            res.status(200).json(updated[0]);
        } catch (e) {
            if ((e as { code: string })?.code === "23503") {
                return next(
                    new HttpError(
                        HttpCode.BAD_REQUEST,
                        "Invalid email address provided"
                    )
                );
            }
            throw e;
        }
    })
);

export default router;
