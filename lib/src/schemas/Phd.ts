import z from "zod";

export const updatePhdGradeBodySchema = z.object({
    studentEmail: z.string().email(),
    courseGrades: z.array(z.string()).nonempty(),
});

export type UpdatePhdGradeBody = z.infer<typeof updatePhdGradeBodySchema>;

export const updatePhdCoursesBodySchema = z.object({
    studentEmail: z.string().email(),
    courseNames: z.array(z.string()).nonempty(),
    courseUnits: z.array(z.number()).nonempty(),
});

export type UpdatePhdCoursesBody = z.infer<typeof updatePhdCoursesBodySchema>;

export const getQualifyingExamFormParamsSchema = z.object({
    email: z.string().email(),
});

export type GetQualifyingExamFormParams = z.infer<typeof getQualifyingExamFormParamsSchema>;

export const courseworkFormSchema = z.array(
    z.object({
        name: z.string(),
        email: z.string().email(),
        courses: z.array(
            z.object({
                name: z.string(),
                units: z.number().nullable(),
                grade: z.string().nullable(),
            })
        ),
    })
);

export type CourseworkFormData = z.infer<typeof courseworkFormSchema>;
