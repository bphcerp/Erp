import z from "zod";

export const assignICBodySchema = z.object({
    courseName: z.string().nonempty(),
    courseCode: z.string().nonempty(),
    icEmail: z.string().email(),
});

export type AssignICBody = z.infer<typeof assignICBodySchema>;

export const handoutStatuses = [
    "pending",
    "approved",
    "rejected",
    "notsubmitted",
] as const;

export const submitHandoutParamsSchema = z.object({
    id: z
        .string()
        .nonempty()
        .refine((val) => !isNaN(Number(val)), {
            message: "Invalid handout id",
        }),
});

export type SubmitHandoutParams = z.infer<typeof submitHandoutParamsSchema>;

export const assignReviewerBodySchema = z.object({
    id: z
        .string()
        .nonempty()
        .refine((val) => !isNaN(Number(val)), {
            message: "Invalid handout id",
        }),
    reviewerEmail: z.string().email(),
});

export type AssignReviewerBody = z.infer<typeof assignReviewerBodySchema>;
