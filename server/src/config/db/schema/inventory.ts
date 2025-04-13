import {
    pgTable,
    integer,
    text,
    decimal,
    date,
    timestamp,
    pgEnum,
    serial,
    char,
    type AnyPgColumn,
    primaryKey,
    uuid,
} from "drizzle-orm/pg-core";
import { users } from "./admin.ts";
import { relations } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid'

export const inventoryFundingSourceEnum = pgEnum("inventory_funding_source", [
    "Institute",
    "Project",
]);
export const inventoryStatusEnum = pgEnum("inventory_status", [
    "Working",
    "Not Working",
    "Under Repair",
]);
export const inventoryCategoryTypeEnum = pgEnum("inventory_category_type", [
    "Vendor",
    "Inventory",
]);

export const inventoryItems = pgTable("inventory_items", {
    id: uuid("id").primaryKey().default(uuidv4()),
    serialNumber: integer("serial_number").notNull(),
    labId: integer("lab_id").references(() => laboratories.id),
    transferId: integer("transfer_id").references(
        (): AnyPgColumn => inventoryItems.id
    ),
    itemCategoryId: integer("item_category_id").references(() => categories.id),
    itemName: text("item_name").notNull(),
    specifications: text("specifications"),
    quantity: integer("quantity").notNull(),
    noOfLicenses: integer("no_of_licenses"),
    natureOfLicense: text("nature_of_license"),
    yearOfLease: integer("year_of_lease"),
    poAmount: decimal("po_amount", { precision: 15, scale: 2 }).notNull(),
    poNumber: text("po_number"),
    poDate: date("po_date"),
    labInchargeAtPurchase: text("lab_incharge_at_purchase"),
    labTechnicianAtPurchase: text("lab_technician_at_purchase"),
    equipmentID: text("equipment_id").unique().notNull(),
    fundingSource: inventoryFundingSourceEnum("funding_source"),
    dateOfInstallation: date("date_of_installation"),
    vendorId: integer("vendor_id").references(() => vendors.id),
    warrantyFrom: date("warranty_from"),
    warrantyTo: date("warranty_to"),
    amcFrom: date("amc_from"),
    amcTo: date("amc_to"),
    currentLocation: text("current_location").notNull(),
    softcopyOfPO: text("softcopy_of_po"),
    softcopyOfInvoice: text("softcopy_of_invoice"),
    softcopyOfNFA: text("softcopy_of_nfa"),
    softcopyOfAMC: text("softcopy_of_amc"),
    status: inventoryStatusEnum("status"),
    equipmentPhoto: text("equipment_photo"),
    remarks: text("remarks"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const laboratories = pgTable("inventory_laboratories", {
    id: uuid("id").primaryKey().default(uuidv4()),
    name: text("name").unique().notNull(),
    location: text("location"),
    code: char("code", { length: 4 }).notNull(),
    technicianInChargeEmail: text("technician_in_charge_email").references(
        () => users.email
    ),
    facultyInChargeEmail: text("faculty_in_charge_email").references(
        () => users.email
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const vendors = pgTable("inventory_vendors", {
    id: uuid("id").primaryKey().default(uuidv4()),
    vendorId: integer("vendor_id").notNull(),
    name: text("name").notNull(),
    address: text("address"),
    pocName: text("poc_name").notNull(),
    phoneNumber: text("phone_number").notNull(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const categories = pgTable("inventory_categories", {
    id: uuid("id").primaryKey().default(uuidv4()),
    name: text("name").unique().notNull(),
    code: text("code").notNull(),
    type: inventoryCategoryTypeEnum("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const vendorCategories = pgTable(
    "vendor_categories",
    {
        vendorId: uuid("vendor_id").references(() => vendors.id),
        categoryId: uuid("category_id").references(() => categories.id),
    },
    (table) => [primaryKey({ columns: [table.vendorId, table.categoryId] })]
);

export const laboratoriesRelations = relations(laboratories, ({ one }) => ({
    technicianInCharge: one(users, {
        fields: [laboratories.technicianInChargeEmail],
        references: [users.email],
        relationName: "technicianInCharge",
    }),
    facultyInCharge: one(users, {
        fields: [laboratories.facultyInChargeEmail],
        references: [users.email],
        relationName: "facultyInCharge",
    }),
}));