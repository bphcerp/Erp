import express from "express";
import createApplicationRouter from "./createApplication.ts";
import viewApplicationDetailsRouter from "./viewApplicationDetails.ts";

const router = express.Router();

router.use("/createApplication", createApplicationRouter);
router.use("/viewApplicationDetails", viewApplicationDetailsRouter);

export default router;
