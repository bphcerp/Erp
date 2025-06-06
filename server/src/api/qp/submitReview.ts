import express from "express";
import db from "@/config/db/index.ts";
import { qpReviewRequests } from "@/config/db/schema/qp.ts";
import { eq } from "drizzle-orm";
import { qpSchemas } from "lib";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const parsed = qpSchemas.submitQpReviewSchema.safeParse(req.body);

        if (!parsed.success) {
            console.log("Validation errors:", parsed.error.errors);
            return res.status(400).json({
                success: false,
                message: "Invalid request data",
                errors: parsed.error.errors,
            });
        }

        const { requestId, email, review } = parsed.data;

        const request = await db.query.qpReviewRequests.findFirst({
            where: eq(qpReviewRequests.id, requestId),
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Review request not found",
            });
        }

        const updateFields: Record<string, any> = {};

        if (request.reviewerEmail === email) {
            updateFields.review1 = review;
        }else {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to submit review",
            });
        }

        // Mark as reviewed if both reviews are complete
        if (
            (updateFields.review1 ?? request.review) 
        ) {
            updateFields.reviewed = "reviewed";
        }

        const updateResult = await db
            .update(qpReviewRequests)
            .set(updateFields)
            .where(eq(qpReviewRequests.id, requestId));

        if (updateResult.rowCount === 0) {
            throw new Error("Failed to update review record");
        }

        return res.status(200).json({
            success: true,
            message: "Review submitted successfully",
            data: { requestId, updatedFields: Object.keys(updateFields) },
        });
    } catch (error) {
        console.error("Review submission error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit review",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

export default router;
