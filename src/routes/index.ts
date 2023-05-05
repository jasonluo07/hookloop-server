import { Router } from "express";

import v1Routes from "./v1";

const router = Router();

router.get("/", (_req, res) => {
  console.log("Hello World!");
  res.send("Hello World!");
});
router.use("/api/v1", v1Routes);

// FIXME: Remove this route after demo
// eslint-disable-next-line import/first, import/order
import { asyncWrapper } from "@/middlewares";

// eslint-disable-next-line import/first
import errorDemo from "./errorDemo";

router.use("/errorDemo", asyncWrapper(errorDemo));
// FIXME: end

export default router;
