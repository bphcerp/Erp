import express from "express";
import createApplicationRouter from "./createApplication.ts";
import getSubmittedApplicationsRouter from "./getSubmittedApplications.ts";
import finalizeApplicationRouter from "./finalizeApplication.ts";
import getPendingApplicationsRouter from "./getPendingApplications.ts";
import viewApplicationDetailsRouter from "./viewApplicationDetails.ts";

const router = express.Router();

router.use("/createApplication", createApplicationRouter);
router.use("/getSubmittedApplications", getSubmittedApplicationsRouter);
router.use("/finalizeApplication", finalizeApplicationRouter);
router.use("/getPending", getPendingApplicationsRouter);
router.use("/viewApplicationDetails", viewApplicationDetailsRouter);

export default router;
