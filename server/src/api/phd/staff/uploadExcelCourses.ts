import express from "express";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import { checkAccess } from "@/middleware/auth.ts";
import { HttpError, HttpCode } from "@/config/errors.ts";
import db from "@/config/db/index.ts";
import { phdCoursesNew } from "@/config/db/schema/phd.ts";
import { z } from "zod";
import { eq } from "drizzle-orm";

const router = express.Router();

const courseDataSchema = z.object({
  erpId: z.string(),
  campusId: z.string(),
  name: z.string().nullable().optional(),
  courseType: z.enum([
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
  ]),
  instructor: z.string().nullable().optional(),
  supervisor: z.string().nullable().optional(),
  coSupervisor: z.string().nullable().optional(),
  topicOfResearchPractice: z.string().nullable().optional(),
  topicOfResearchProject: z.string().nullable().optional(),
  topicOfCourseWork: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  midSemMarks: z.number().nullable().optional(),
  midSemGrade: z.string().nullable().optional(),
  endSemMarks: z.number().nullable().optional(),
  endSemGrade: z.string().nullable().optional(),
});

const uploadRequestSchema = z.object({
  data: z.array(courseDataSchema),
  courseType: z.enum([
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
  ]),
  replaceExisting: z.boolean().optional(),
});

router.post('/', checkAccess("phd:staff:upload-excel-courses"), asyncHandler(async(req, res) => {
  const parsedRequest = uploadRequestSchema.safeParse(req.body);
  
  if (!parsedRequest.success) {
    throw new HttpError(HttpCode.BAD_REQUEST, "Invalid input data", parsedRequest.error.message);
  }
  
  const { data, courseType, replaceExisting } = parsedRequest.data;
  
  if (data.length === 0) {
    throw new HttpError(HttpCode.BAD_REQUEST, "No data to upload");
  }
  
  try {
    const result = await db.transaction(async (tx) => {
      if (replaceExisting) {
        await tx.delete(phdCoursesNew).where(eq(phdCoursesNew.courseType, courseType));
      }
      
      const insertedRows = [];
      
      for (const row of data) {
        try {
          if (!row.erpId || !row.campusId) {
            console.warn("Skipping row with missing required data:", row);
            continue;
          }
          
          const insertValues = {
            erpId: row.erpId,
            campusId: row.campusId,
            name: row.name || "",
            courseType: row.courseType,
            instructor: row.instructor || null,
            supervisor: row.supervisor || null,
            coSupervisor: row.coSupervisor || null,
            topicOfResearchPractice: row.topicOfResearchPractice || null,
            topicOfResearchProject: row.topicOfResearchProject || null,
            topicOfCourseWork: row.topicOfCourseWork || null,
            title: row.title || null,
            midSemMarks: row.midSemMarks || null,
            midSemGrade: row.midSemGrade || null,
            endSemMarks: row.endSemMarks || null,
            endSemGrade: row.endSemGrade || null,
          };
          
          const insertedRow = await tx.insert(phdCoursesNew)
            .values(insertValues)
            .onConflictDoUpdate({
              target: [phdCoursesNew.erpId, phdCoursesNew.courseType],
              set: {
                campusId: row.campusId,
                name: row.name || "",
                instructor: row.instructor || null,
                supervisor: row.supervisor || null,
                coSupervisor: row.coSupervisor || null,
                topicOfResearchPractice: row.topicOfResearchPractice || null,
                topicOfResearchProject: row.topicOfResearchProject || null,
                topicOfCourseWork: row.topicOfCourseWork || null,
                title: row.title || null,
                midSemMarks: row.midSemMarks || null,
                midSemGrade: row.midSemGrade || null,
                endSemMarks: row.endSemMarks || null,
                endSemGrade: row.endSemGrade || null,
              }
            })
            .returning();
          
          insertedRows.push(insertedRow[0]);
        } catch (error) {
          console.error(`Failed to insert row with ERP ID ${row.erpId}:`, error);
        }
      }
      
      return insertedRows;
    });
    
    res.status(HttpCode.OK).json({
      success: true,
      message: `Processed ${data.length} rows, inserted/updated ${result.length} records`,
      processedCount: data.length,
      insertedCount: result.length
    });
  } catch (error) {
    console.error("Error processing data:", error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(HttpCode.INTERNAL_SERVER_ERROR, "Failed to process data", (error as Error)?.message);
  }
}));

export default router;
