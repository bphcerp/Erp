import { Request, Response, Router } from "express";
import db from "@/config/db/index.ts";
import { checkAccess } from "@/middleware/auth.ts";
import { asyncHandler } from "@/middleware/routeHandler.ts";

const router = Router();

router.get(
  "/",
  checkAccess("project:view-all"),
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query.projects.findMany({
      with: {
        pi: true,
        fundingAgency: true,
        coPIs: {
          with: {
            investigator: true,
          },
        },
      },
      columns: {
        id: true,
        title: true,
        fundingAgencyNature: true,
        sanctionedAmount: true,
        capexAmount: true,
        opexAmount: true,
        manpowerAmount: true,
        startDate: true,
        endDate: true,
        approvalDate: true,
        hasExtension: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const flatResult = result.map(project => ({
      ...project,
      piName: project.pi?.name,
      piEmail: project.pi?.email,
      fundingAgencyName: project.fundingAgency?.name,
      coPIs: project.coPIs?.map(copi => ({
        name: copi.investigator?.name,
        email: copi.investigator?.email,
        department: copi.investigator?.department,
        campus: copi.investigator?.campus,
        affiliation: copi.investigator?.affiliation,
      })) ?? [],
    }));
    res.json(flatResult);
  })
);

export default router; 