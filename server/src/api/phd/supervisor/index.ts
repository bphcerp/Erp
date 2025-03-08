import express from "express";
import getSupervisedStudents from "./getSupervisedStudents.ts";

const router = express.Router();
router.use("/getSupervisedStudents", getSupervisedStudents);
export default router;