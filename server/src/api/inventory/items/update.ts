import db from "@/config/db/index.ts";
import { inventoryItems } from "@/config/db/schema/inventory.ts";
import { checkAccess } from "@/middleware/auth.ts";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { inventoryItemSchema } from "node_modules/lib/src/schemas/Inventory.ts";

const router = Router();

router.patch(
    "/:id",
    checkAccess(),
    asyncHandler(async (req, res) => {
        const parsed = inventoryItemSchema.partial().parse(req.body);
        const updatedItem = await db
            .update(inventoryItems)
            .set(parsed)
            .where(eq(inventoryItems.id, req.params.id))
            .returning();
        res.status(200).json(updatedItem);
    })
);

export default router;
