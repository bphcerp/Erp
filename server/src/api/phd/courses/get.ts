import express from "express";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import { checkAccess } from "@/middleware/auth.ts";
import db from "@/config/db/index.ts";
import { eq } from "drizzle-orm";
import assert from "assert";
import { phdCoursesNew } from "@/config/db/schema/phd.ts";

const router = express.Router();

import { z } from "zod";

export const courseTypeEnumZ = z.enum([
    "seminar",
    "independent_study",
    "teaching_practice_1",
    "practice_lecture_series_1",
    "thesis",
    "research_project_1",
    "research_project_2",
    "research_practice",
    "reading_course_2",
    "study_in_advanced_topics",
    "dissertations",
]);

export const phdCourseSchema = z.object({
    erpId: z.string().min(1),
    campusId: z.string().min(1),
    name: z.string().min(1),
    courseType: courseTypeEnumZ,

    instructor: z.string().optional(),

    topicOfResearchPractice: z.string().optional(),
    topicOfCourseWork: z.string().optional(),
    title: z.string().optional(),

    supervisor: z.string().optional(),
    coSupervisor: z.string().optional(),

    midSemMarks: z.number().nullable().optional(),
    midSemGrade: z.string().optional(),
    endSemMarks: z.number().nullable().optional(),
    endSemGrade: z.string().optional(),
});

export type PhdCourse = z.infer<typeof phdCourseSchema>;

router.get(
    "/",
    checkAccess("*"),
    asyncHandler(async (req, res) => {
        assert(req.query.erpId);
        const erpId = req.query.erpId as string;

        const courseDetails = await db
            .select({
                erpId: phdCoursesNew.erpId,
                campusId: phdCoursesNew.campusId,
                name: phdCoursesNew.name,
                courseType: phdCoursesNew.courseType,
                instructor: phdCoursesNew.instructor,
                topicOfResearchPractice: phdCoursesNew.topicOfResearchPractice,
                topicOfCourseWork: phdCoursesNew.topicOfCourseWork,
                title: phdCoursesNew.title,
                supervisor: phdCoursesNew.supervisor,
                coSupervisor: phdCoursesNew.coSupervisor,
                midSemMarks: phdCoursesNew.midSemMarks,
                midSemGrade: phdCoursesNew.midSemGrade,
                endSemMarks: phdCoursesNew.endSemMarks,
                endSemGrade: phdCoursesNew.endSemGrade,
            })
            .from(phdCoursesNew)
            .where(eq(phdCoursesNew.erpId, erpId));

        const parsed = phdCourseSchema.parse(courseDetails[0]);

        res.status(200).json(parsed);
    })
);

export default router;
