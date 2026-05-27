import { Router } from "express";
import assignmentsRouter from "./assignments";
import uploadRouter from "./upload";

const router = Router();

router.use("/assignments", assignmentsRouter);
router.use("/upload", uploadRouter);

export default router;
