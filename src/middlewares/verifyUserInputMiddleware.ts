import { NextFunction, Request, Response } from "express";
import validator from "validator";

import { ApiResults, StatusCode } from "@/types";
import { validatePassword } from "@/utils";

import { forwardCustomError } from "./errorMiddleware";

const verifyUserInputMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  /**
   * 針對使用者 input 做檢查，但不包含：DB相關 或 加密相關
   * (1) 確認 req.body 所有必填項目是否有值: name, email, password
   * (2) 確認 email, password 是否符合規範
   */
  const { name, email, password } = req.body;

  if (validator.isEmpty(name || "")) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "name",
      error: "Name is required!",
    });
    return;
  }
  if (!validatePassword(password || "")) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "password",
      error: "Invalid Password! Password must be 8-20 characters and contain only letters and numbers.",
    });
    return;
  }
  if (!validator.isEmail(email || "")) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "email",
      error: "Invalid Email!",
    });
    return;
  }

  next();
};

export default verifyUserInputMiddleware;
