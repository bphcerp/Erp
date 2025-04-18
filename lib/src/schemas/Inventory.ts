import z from "zod";

export const inventoryFundingSourceEnum = z.enum(["Institute", "Project"]);
export const inventoryStatusEnum = z.enum([
    "Working",
    "Not Working",
    "Under Repair",
]);
export const inventoryCategoryTypeEnum = z.enum(["Vendor", "Inventory"]);

export const staffSchema = z.object({
    email: z.string().email(),
    name: z.string().nullable(),
    department: z.string().nullable(),
    phone: z.string().nullable(),
    designation: z.string().nullable(),
});

export const facultySchema = z.object({
    psrn: z.string().nullable(),
    email: z.string().email(),
    name: z.string().nullable(),
    department: z.string().nullable(),
    designation: z.string().nullable(),
    room: z.string().nullable(),
    phone: z.string().nullable(),
    authorId: z.string().nullable(),
});

export const inventoryItemSchema = z.object({
    id: z.string().uuid(),
    serialNumber: z.number().int(),
    labId: z.string().uuid(),
    transferId: z.string().uuid(),
    itemCategoryId: z.string().uuid(),
    itemName: z.string().trim().nonempty(),
    specifications: z.string().nullable(),
    quantity: z.number().int(),
    noOfLicenses: z.number().int().nullable(),
    natureOfLicense: z.string().nullable(),
    yearOfLease: z.number().int().nullable(),
    poAmount: z.number().transform((val) => val.toFixed(2)),
    poNumber: z.string().nullable(),
    poDate: z.string().nullable(),
    labInchargeAtPurchase: z.string().nullable(),
    labTechnicianAtPurchase: z.string().nullable(),
    equipmentID: z.string().trim().nonempty(),
    fundingSource: inventoryFundingSourceEnum.nullable(),
    dateOfInstallation: z.string().nullable(),
    vendorId: z.string().uuid().nullable(),
    warrantyFrom: z.string().nullable(),
    warrantyTo: z.string().nullable(),
    amcFrom: z.string().nullable(),
    amcTo: z.string().nullable(),
    currentLocation: z.string().trim().nonempty(),
    softcopyOfPO: z.string().nullable(),
    softcopyOfInvoice: z.string().nullable(),
    softcopyOfNFA: z.string().nullable(),
    softcopyOfAMC: z.string().nullable(),
    status: inventoryStatusEnum.nullable(),
    equipmentPhoto: z.string().nullable(),
    remarks: z.string().nullable(),
});

export const multipleEntrySchema = z.array(
    inventoryItemSchema.omit({ id: true, transferId: true })
);

export const laboratorySchema = z.object({
    id: z.string().uuid(),
    name: z.string().trim().nonempty(),
    location: z.string().nullable(),
    code: z.string().length(4),
    technicianInChargeEmail: z.string().email().nullable(),
    facultyInChargeEmail: z.string().email().nullable(),
});

export const vendorSchema = z.object({
    id: z.string().uuid(),
    vendorId: z.number().int(),
    name: z.string().trim().nonempty(),
    address: z.string().nullable(),
    pocName: z.string().trim().nonempty(),
    phoneNumber: z.string().trim().nonempty(),
    email: z.string().email(),
});

export const categorySchema = z.object({
    id: z.string().uuid(),
    name: z.string().trim().nonempty(),
    code: z.string().trim().nonempty(),
    type: inventoryCategoryTypeEnum,
});

export const vendorCategorySchema = z.object({
    vendorId: z.string().uuid(),
    categoryId: z.string().uuid(),
});
