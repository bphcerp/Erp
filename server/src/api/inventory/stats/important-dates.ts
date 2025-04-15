import db from "@/config/db/index.ts";
import { inventoryItems, laboratories } from "@/config/db/schema/inventory.ts";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import { and, eq, isNotNull, lte, or } from "drizzle-orm";
import { Router } from "express";

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
    try {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        const nextWeekString = nextWeek.toISOString()

        const items = await db
            .selectDistinctOn([inventoryItems.serialNumber, inventoryItems.labId], {
                id: inventoryItems.id,
                itemName: inventoryItems.itemName,
                equipmentID: inventoryItems.equipmentID,
                lab: {
                    name: laboratories.name
                },
                warrantyTo: inventoryItems.warrantyTo,
                amcTo: inventoryItems.amcTo
            })
            .from(inventoryItems)
            .leftJoin(laboratories, eq(inventoryItems.labId, laboratories.id))
            .where(
                or(
                    and(
                        isNotNull(inventoryItems.warrantyTo),
                        lte(inventoryItems.warrantyTo, nextWeekString)
                    ),
                    and(
                        isNotNull(inventoryItems.amcTo),
                        lte(inventoryItems.amcTo, nextWeekString)
                    )
                )
            )
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching important dates', error });
        console.error(error);
    }
}))

export default router