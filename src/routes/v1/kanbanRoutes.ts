import { Router } from "express";

import { kanbanControllers } from "@/controllers";
import { asyncWrapper } from "@/middlewares";

const router = Router();

router.post("/", asyncWrapper(kanbanControllers.createKanban));

export default router;
