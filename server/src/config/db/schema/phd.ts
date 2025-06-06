import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { phd, users } from "./admin.ts";

export const phdCourses = pgTable("phd_courses", {
    id: serial("id").primaryKey(),
    studentEmail: text("student_email")
        .notNull()
        .references(() => phd.email, { onDelete: "cascade" }),
    courseNames: text("course_names")
        .array()
        .default(sql`'{}'::text[]`),
    courseGrades: text("course_grades")
        .array()
        .default(sql`'{}'::text[]`),
    courseUnits: integer("course_units")
        .array()
        .default(sql`'{}'::integer[]`),
    courseIds: text("course_ids")
        .array()
        .default(sql`'{}'::text[]`),
});

export const phdSemesters = pgTable("phd_semesters", {
    id: serial("id").primaryKey(),
    year: text("year").notNull(),
    semesterNumber: integer("semester_number").notNull(), // 1 or 2
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const phdQualifyingExams = pgTable("phd_qualifying_exams", {
    id: serial("id").primaryKey(),
    semesterId: integer("semester_id")
        .notNull()
        .references(() => phdSemesters.id, { onDelete: "cascade" }),
    examName: text("exam_name").notNull(),
    examStartDate: timestamp("exam_start_date").default(sql`NULL`),
    examEndDate: timestamp("exam_end_date").default(sql`NULL`),
    vivaDate: timestamp("viva_date").default(sql`NULL`),
    deadline: timestamp("deadline").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const phdSubAreas = pgTable("phd_sub_areas", {
    id: serial("id").primaryKey(),
    subarea: text("sub_area").notNull(),
});

export const phdExaminer = pgTable("phd_examiner", {
    id: serial("id").primaryKey(),
    subAreaId: integer("sub_area_id")
        .notNull()
        .references(() => phdSubAreas.id, { onDelete: "cascade" }),
    studentEmail: text("student_email").references(() => phd.email, {
        onDelete: "cascade",
    }),
    suggestedExaminer: text("suggested_examiner")
        .array()
        .default(sql`'{}'::text[]`),
    examiner: text("examiner").references(() => users.email, {
        onDelete: "cascade",
    }),
});
