import { relations } from "drizzle-orm";
import {
    textFields,
    fileFields,
    textFieldStatus,
    fileFieldStatus,
    files,
} from "./form.ts";
import { users } from "./admin.ts";

export const usersFormsRelations = relations(users, ({ many, one }) => ({
    textFieldStatus: one(textFieldStatus, {
        fields: [users.email],
        references: [textFieldStatus.userEmail],
        relationName: "textFieldStatus",
    }),
    fileFieldStatus: one(fileFieldStatus, {
        fields: [users.email],
        references: [fileFieldStatus.userEmail],
        relationName: "fileFieldStatus",
    }),
    files: many(files, {
        relationName: "files",
    }),
}));

export const textFieldsFormsRelations = relations(textFields, ({ many }) => ({
    textFields: many(textFieldStatus, {
        relationName: "textFields",
    }),
}));

export const fileFieldsFormsRelations = relations(fileFields, ({ many }) => ({
    fileFieldStatus: many(fileFieldStatus, {
        relationName: "fileFields",
    }),
    file: many(files, {
        relationName: "fileField",
    }),
}));

export const textFieldStatusFormsRelations = relations(
    textFieldStatus,
    ({ one }) => ({
        textFieldStatus: one(users, {
            fields: [textFieldStatus.userEmail],
            references: [users.email],
            relationName: "textFieldStatus",
        }),
        textFields: one(textFields, {
            fields: [textFieldStatus.textField],
            references: [textFields.id],
            relationName: "textFields",
        }),
    })
);

export const fileFieldStatusFormsRelations = relations(
    fileFieldStatus,
    ({ one }) => ({
        fileFieldStatus: one(users, {
            fields: [fileFieldStatus.userEmail],
            references: [users.email],
            relationName: "fileFieldStatus",
        }),
        fileFields: one(fileFields, {
            fields: [fileFieldStatus.fileField],
            references: [fileFields.id],
            relationName: "fileFields",
        }),
    })
);

export const filesFormsRelations = relations(files, ({ one }) => ({
    files: one(users, {
        fields: [files.uploaded_by],
        references: [users.email],
        relationName: "files",
    }),
    fileField: one(fileFields, {
        fields: [files.id],
        references: [fileFields.file],
        relationName: "fileField",
    }),
}));
