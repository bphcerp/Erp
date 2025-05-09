import express from "express";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import { checkAccess } from "@/middleware/auth.ts";
import { HttpError, HttpCode } from "@/config/errors.ts";
import db from "@/config/db/index.ts";
import { phdCourses } from "@/config/db/schema/phd.ts";
import { eq } from "drizzle-orm";
import assert from "assert";
import { phdSchemas } from "lib";
import { phd } from "@/config/db/schema/admin.ts";

const router = express.Router();

export default router.post(
    "/",
    checkAccess(),
    asyncHandler(async (req, res, next) => {
        assert(req.user);

        const parsed = phdSchemas.updatePhdGradeBodySchema.parse(req.body);

        const phdStudent = await db
            .select()
            .from(phd)
            .where(eq(phd.email, parsed.studentEmail))
            .limit(1);

        if (phdStudent.length === 0) {
            return next(
                new HttpError(HttpCode.NOT_FOUND, "PhD student not found")
            );
        }

        if (phdStudent[0].notionalSupervisorEmail !== req.user.email) {
            return next(
                new HttpError(
                    HttpCode.FORBIDDEN,
                    "You are not the notional supervisor of this student"
                )
            );
        }

        const existingCourses = await db
            .select()
            .from(phdCourses)
            .where(eq(phdCourses.studentEmail, parsed.studentEmail))
            .limit(1);

        if (existingCourses.length === 0) {
            return next(
                new HttpError(HttpCode.NOT_FOUND, "PhD course record not found")
            );
        }

        const courseRecord = existingCourses[0];
        const currentCourseIds = courseRecord.courseIds ?? [];
        const currentGrades =
            courseRecord.courseGrades ??
            (Array(currentCourseIds.length).fill("-") as string[]);

        const updatedGrades = [...currentGrades];

        parsed.courses.forEach((courseUpdate) => {
            const index = currentCourseIds.indexOf(courseUpdate.courseId);
            if (index !== -1) {
                updatedGrades[index] = courseUpdate.grade ?? "-";
            }
        });

        const updated = await db
            .update(phdCourses)
            .set({
                courseGrades: updatedGrades,
            })
            .where(eq(phdCourses.studentEmail, parsed.studentEmail))
            .returning();

        if (updated.length === 0) {
            return next(
                new HttpError(HttpCode.NOT_FOUND, "PhD course record not found")
            );
        }

        res.json({ success: true, phdCourses: updated[0] });
    })
);
