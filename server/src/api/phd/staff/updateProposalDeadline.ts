import express from "express";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import { checkAccess } from "@/middleware/auth.ts";
import { HttpError, HttpCode } from "@/config/errors.ts";
import db from "@/config/db/index.ts";
import { phdSemesters, phdQualifyingExams } from "@/config/db/schema/phd.ts";
import { eq, and, gt } from "drizzle-orm";
import assert from "assert";
import { phdSchemas } from "lib";

const router = express.Router();

export default router.post(
    "/",
    checkAccess(),
    asyncHandler(async (req, res) => {
        assert(req.body);
        const parsed = phdSchemas.updateProposalDeadlineSchema.parse(req.body);
        const { semesterId, deadline } = parsed;

        // Verify semester exists   
        const semester = await db
            .select()
            .from(phdSemesters)
            .where(eq(phdSemesters.id, semesterId))
            .limit(1);

        if (semester.length === 0) {
            throw new HttpError(HttpCode.NOT_FOUND, "Semester not found");
        }

        // Define the proposal exam name
        const examName = "Thesis Proposal";

        // Check for existing active proposal deadlines
        const existingActiveProposals = await db
            .select()
            .from(phdQualifyingExams)
            .where(
                and(
                    eq(phdQualifyingExams.semesterId, semesterId),
                    eq(phdQualifyingExams.examName, examName),
                    gt(phdQualifyingExams.deadline, new Date()) // deadline not passed
                )
            );

        if (existingActiveProposals.length > 0) {
            throw new HttpError(
                HttpCode.BAD_REQUEST, 
                "An active proposal deadline already exists for this semester. Please cancel the existing deadline first."
            );
        }

        const newProposal = await db
            .insert(phdQualifyingExams)
            .values({
                semesterId,
                examName,
                deadline: new Date(deadline),
            })
            .returning();

        res.status(201).json({
            success: true,
            message: "Proposal deadline created successfully",
            proposal: newProposal[0],
        });
    })
);