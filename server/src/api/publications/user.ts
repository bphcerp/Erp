import db from "@/config/db/index.ts";
import { checkAccess } from "@/middleware/auth.ts";
import { asyncHandler } from "@/middleware/routeHandler.ts";
import express from "express";
import {
    authorPublicationsTable,
    publicationsTable,
} from "@/config/db/schema/publications.ts";
import { eq, inArray } from "drizzle-orm";
import type { publicationsSchemas } from "lib";

const router = express.Router();

router.get(
    "/",
    checkAccess("*"),
    asyncHandler(async (req, res) => {
        const { authorId } = req.query;

        if (!authorId || typeof authorId !== "string") {
            return res
                .status(400)
                .json({ error: "authorId is required in query" });
        }

        // Step 1: Get all citationIds where this author contributed
        const authoredCitationIds = await db
            .select({ citationId: authorPublicationsTable.citationId })
            .from(authorPublicationsTable)
            .where(eq(authorPublicationsTable.authorId, authorId));

        const citationIds = authoredCitationIds.map(
            (entry) => entry.citationId
        );

        if (citationIds.length === 0) {
            return res.status(200).json({ publications: [] });
        }

        // Step 2: Get full publication + co-author info for those citationIds
        const allData = await db
            .select({
                publication: publicationsTable,
                authorId: authorPublicationsTable.authorId,
                authorName: authorPublicationsTable.authorName,
            })
            .from(authorPublicationsTable)
            .innerJoin(
                publicationsTable,
                eq(
                    authorPublicationsTable.citationId,
                    publicationsTable.citationId
                )
            )
            .where(inArray(authorPublicationsTable.citationId, citationIds));

        // Step 3: Group by citationId
        const publicationsMap = new Map<
            string,
            publicationsSchemas.PublicationWithCoAuthors
        >();

        for (const row of allData as publicationsSchemas.PublicationRow[]) {
            const pub = row.publication;
            const coAuthor: publicationsSchemas.CoAuthor = {
                authorId: row.authorId,
                authorName: row.authorName,
            };

            if (!publicationsMap.has(pub.citationId)) {
                publicationsMap.set(pub.citationId, {
                    ...pub,
                    coAuthors: [coAuthor],
                });
            } else {
                publicationsMap.get(pub.citationId)!.coAuthors.push(coAuthor);
            }
        }

        const response = {
            publications: Array.from(publicationsMap.values()),
        };

        res.status(200).json(response);
    })
);

export default router;
