import express from "express";
import createRouter from "./create";
import getAllRouter from "./all";
import deleteRouter from "./delete";
const router = express.Router();

router.use("/create", createRouter);
router.use("/all", getAllRouter);
router.use("/delete", deleteRouter);

export default router;
