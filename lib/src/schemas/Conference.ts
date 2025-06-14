import { Field } from "multer";
import z from "zod";
import { fileFieldResponse } from "./Form.ts";

export const states = [
    "Faculty",
    "DRC Member",
    "DRC Convener",
    "HoD",
    "Completed",
] as const;

const modesOfEvent = ["online", "offline"] as const;

export const upsertApplicationBodySchema = z.object({
    purpose: z.string().nonempty(),
    contentTitle: z.string().nonempty(),
    eventName: z.string().nonempty(),
    venue: z.string().nonempty(),
    dateFrom: z.coerce.date(),
    dateTo: z.coerce.date(),
    organizedBy: z.string().nonempty(),
    modeOfEvent: z.enum(modesOfEvent, {
        message: "Should either be 'online' or 'offline'",
    }),
    description: z.string().nonempty(),
    reimbursements: z.preprocess(
        (val) => {
            if (typeof val === "string") {
                try {
                    return JSON.parse(val);
                } catch {
                    return undefined;
                }
            }
            return val;
        },
        z
            .array(
                z.object({
                    key: z
                        .string()
                        .min(1, "Field name is required")
                        .max(50, "Field name is too long"),
                    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, {
                        message:
                            "Amount must be a number with at most 2 decimal places",
                    }),
                })
            )
            .max(10, "Maximum of 10 fields allowed")
            .refine(
                (arr) => {
                    const keys = arr.map((f) => f.key.trim().toLowerCase());
                    return new Set(keys).size === keys.length;
                },
                { message: "Field names must be unique" }
            )
    ),
});

export const flowBodySchema = z.object({
    directFlow: z.boolean(),
});

export type FlowBody = z.infer<typeof flowBodySchema>;

export const reviewApplicationBodySchema = z.discriminatedUnion("status", [
    z.object({
        status: z.literal(true),
        comments: z.string().optional(),
    }),
    z.object({
        status: z.literal(false),
        comments: z.string().trim().nonempty(),
    }),
]);

export type ReviewApplicationBody = z.infer<typeof reviewApplicationBodySchema>;

export const textFieldNames = [
    "purpose",
    "contentTitle",
    "eventName",
    "venue",
    "organizedBy",
    "modeOfEvent",
    "description",
] as const;

export const dateFieldNames = ["dateFrom", "dateTo"] as const;

export const fileFieldNames = [
    "letterOfInvitation",
    "firstPageOfPaper",
    "reviewersComments",
    "detailsOfEvent",
    "otherDocuments",
] as const;

export const multerFileFields: Readonly<Field[]> = (
    fileFieldNames as Readonly<string[]>
).map((x) => {
    return { name: x, maxCount: 1 };
});

export const fieldTypes = z.enum(["text", "number", "date", "file"]);

export type submittedApplicationsResponse = {
    applications: {
        id: number;
        state: (typeof states)[number];
        createdAt: string;
    }[];
};

export type pendingApplicationsResponse = {
    applications: {
        id: number;
        state: (typeof states)[number];
        createdAt: string;
        userEmail: string;
        userName: string | null;
    }[];
    isDirect?: boolean;
};

export type ViewApplicationResponse = {
    application: {
        id: number;
        createdAt: string;
        userEmail: string;
        state: (typeof states)[number];
        purpose: string;
        contentTitle: string;
        eventName: string;
        venue: string;
        dateFrom: string;
        dateTo: string;
        organizedBy: string;
        modeOfEvent: (typeof modesOfEvent)[number];
        description: string;
        reimbursements: {
            key: string;
            amount: string;
        }[];
        letterOfInvitation?: fileFieldResponse;
        firstPageOfPaper?: fileFieldResponse;
        reviewersComments?: fileFieldResponse;
        detailsOfEvent?: fileFieldResponse;
        otherDocuments?: fileFieldResponse;
    };
    reviews: {
        status: boolean;
        comments: string | null;
        createdAt: string;
    }[];
    isDirect?: boolean;
};

export const fieldsToFrontend = {
    purpose: "Purpose",
    contentTitle: "Title of the Paper / Talk / Poster",
    eventName: "Name of the Journal / Conference / Workshop / Laboratory",
    venue: "Venue",
    organizedBy: "Organized by",
    modeOfEvent: "Mode of event",
    description: "Brief Description or Justification of the purpose",
    reimbursements: "Reimbursements",
    letterOfInvitation: "Letter of Invitation / Acceptance of the paper",
    firstPageOfPaper: "First page of paper",
    reviewersComments: "Reviewers Comments",
    detailsOfEvent: "Details of the conference / Journal",
    otherDocuments: "Any other documents",
};
