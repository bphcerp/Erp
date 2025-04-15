import {
    pgTable,
    text,
    serial,
    timestamp,
    integer,
    real,
    pgEnum,
    primaryKey,
} from "drizzle-orm/pg-core";
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
    suggestedExaminer: text("suggested_examiner")
        .array()
        .default(sql`'{}'::text[]`),
    examiner: text("examiner").references(() => users.email, {
        onDelete: "restrict",
    }),
});

export const courseTypeEnum = pgEnum("course_type", [
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

export const phdCoursesNew = pgTable(
    "phd_courses_new",
    {
        erpId: text("erp_id").primaryKey(),
        campusId: text("campus_id").notNull(),
        name: text("name").notNull(),
        courseType: courseTypeEnum("course_type").notNull(),

        topicOfResearchPractice: text("topic_of_research_practice"),
        topicOfResearchProject: text("topic_of_research_project"),
        topicOfCourseWork: text("topic_of_course_work"),
        title: text("title"),

        instructor: text("instructor"),
        supervisor: text("supervisor"),
        coSupervisor: text("co_supervisor"),

        midSemMarks: real("mid_sem_marks"),
        midSemGrade: text("mid_sem_grade"),
        endSemMarks: real("end_sem_marks"),
        endSemGrade: text("end_sem_grade"),
    },
    (table) => [primaryKey({ columns: [table.erpId, table.courseType] })]
);
