import { Router } from "express";

import { cardControllers } from "@/controllers";
import { asyncWrapper, validate, verifyUploadAttachmentMiddleware } from "@/middlewares";
import { cardValidator } from "@/utils";

const router = Router();

router.post("/", validate(cardValidator.createCard, "CREATE"), asyncWrapper(cardControllers.createCard));
router.get("/:id", validate(cardValidator.getCardById, "READ"), asyncWrapper(cardControllers.getCardById));
router.patch("/:id", validate(cardValidator.updateCard, "UPDATE"), asyncWrapper(cardControllers.updateCard));
router.patch("/:id/archive", validate(cardValidator.archiveCard, "DELETE"), asyncWrapper(cardControllers.archiveCard));
router.patch("/move", asyncWrapper(cardControllers.moveCard));
router.post(
  "/:cardId/attachment",
  validate(cardValidator.addAttachment, "UPLOAD"),
  // .single("file") 限制處理單一檔案，但若無檔案不會報錯
  verifyUploadAttachmentMiddleware.single("file"),
  asyncWrapper(cardControllers.addAttachment),
);
// router.get("/:cardId/attachment/:attahmentId", asyncWrapper(cardControllers.getAttachment));
// router.delete("/:cardId/attachment/:attahmentId", asyncWrapper(cardControllers.deleteAttachment));

export default router;
