import express from "express";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import { checkAccess } from "@/middleware/auth.ts";
import db from "@/config/db/index.ts";
import { phdSemesters, phdQualifyingExams } from "@/config/db/schema/phd.ts";
import { eq, gt } from "drizzle-orm";

const router = express.Router();

export default router.get(
    "/",
    checkAccess("phd"),
    asyncHandler(async (_req, res) => {
      const now = new Date();
      const exams = await db
        .select({
          id: phdQualifyingExams.id,
          examName: phdQualifyingExams.examName,
          deadline: phdQualifyingExams.deadline,
          semesterYear: phdSemesters.year,
          semesterNumber: phdSemesters.semesterNumber,
        })
        .from(phdQualifyingExams)
        .innerJoin(
          phdSemesters,
          eq(phdQualifyingExams.semesterId, phdSemesters.id)
        )
        .where(gt(phdQualifyingExams.deadline, now))
        .orderBy(phdQualifyingExams.deadline);
  
      // Format the response to match what the frontend expects
      const hasActiveDeadline = exams.length > 0;
      const exam = hasActiveDeadline ? {
        id: exams[0].id,
        examName: exams[0].examName,
        deadline: exams[0].deadline
      } : null;

      res.status(200).json({ 
        success: true, 
        hasActiveDeadline,
        exam
      });
    })
  );