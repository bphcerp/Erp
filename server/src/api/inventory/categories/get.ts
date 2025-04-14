import db from "@/config/db/index.ts";
import { inventoryCategories } from "@/config/db/schema/inventory.ts";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { inventoryCategoryTypeEnum } from "node_modules/lib/src/schemas/Inventory.ts";

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
    try {
        const { type } = req.query;
        if (!type) {
            res.status(400).json({ message: "Query parameter 'type' is required" });
            return
        }
        
        const parsedType = inventoryCategoryTypeEnum.parse(type)

        const result = await db.query.inventoryCategories.findMany({
            where: eq(inventoryCategories.type, parsedType),
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
        console.error(error);
    }
}));

export default router;
