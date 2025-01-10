import { REFRESH_TOKEN_COOKIE } from "@/config/environment";
import { AppError, HttpCode } from "@/config/errors";
import db from "@/config/db";
import { refreshTokens } from "@/config/db/schema/users";
import { asyncHandler } from "@/middleware/errorhandler";
import assert from "assert";
import { eq } from "drizzle-orm";
import express from "express";

const router = express.Router();

router.post(
    "/",
    asyncHandler(async (req, res, next) => {
        assert(req.user);
        const cookies = req.cookies as Record<string, string>;
        const refreshToken = cookies
            ? cookies[REFRESH_TOKEN_COOKIE]
            : undefined;
        if (!refreshToken)
            return next(
                new AppError({
                    httpCode: HttpCode.BAD_REQUEST,
                    description: "Refresh token not found",
                })
            );
        await db
            .delete(refreshTokens)
            .where(eq(refreshTokens.token, refreshToken));

        res.clearCookie(REFRESH_TOKEN_COOKIE);
        res.status(HttpCode.OK).end();
    })
);

export default router;
