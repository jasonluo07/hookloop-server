import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { Kanban } from "@/models";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse } from "@/utils";
import mongoDbHandler from "@/utils/mongoDbHandler";

export default {
  createKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { id, name, workspaceId } = req.body;
    if (!id) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "id",
        error: "kanban's id is required.",
      });
    } else if (id.indexOf(" ") > -1) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "id",
        error: "space is not allowed in id.",
      });
    } else if (!name) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "name",
        error: "kanban's name is required.",
      });
    } else if (!workspaceId) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "workspaceId",
        error: "workspaceId is required.",
      });
    } else {
      const existId = await Kanban.findOne({ id });

      if (existId) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
          field: "id",
          error: "id already exists, unique requirement.",
        });
      } else {
        const newKanban = await Kanban.create({
          id,
          name,
          workspace: workspaceId,
        });
        sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
          id: newKanban.id,
          name: newKanban.name,
          workspaceId: newKanban.workspace,
          cardLists: newKanban.cardLists,
          isArchived: newKanban.isArchived,
        });
      }
    }
  },
  getKanbanById: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "id",
        error: "Kanban's id is required.",
      });
    } else {
      mongoDbHandler.getDb("Kanban", Kanban, { id }, { _id: 0 }, res, next);
    }
  },
  renameKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!id) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "id",
        error: "Kanban's id is required.",
      });
    } else if (!name) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "name",
        error: "kanban's name is required.",
      });
    } else {
      mongoDbHandler.updateDb("Kanban", Kanban, { id }, { name }, { _id: 0 }, res, next);
    }
  },
  archiveKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { isArchived } = req.body;
    if (!id) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "id",
        error: "Kanban's id is required.",
      });
    } else if (Object.keys(req.body).indexOf("isArchived") < 0) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "isArchived",
        error: "isArchived is required.",
      });
    } else {
      mongoDbHandler.updateDb("Kanban", Kanban, { id }, { isArchived }, { _id: 0 }, res, next);
    }
  },
  pinKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { isPinned } = req.body;
    if (!id) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "id",
        error: "Kanban's id is required.",
      });
    } else if (Object.keys(req.body).indexOf("isPinned") < 0) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "isPinned",
        error: "isPinned is required.",
      });
    } else {
      mongoDbHandler.updateDb("Kanban", Kanban, { id }, { isPinned }, { _id: 0 }, res, next);
    }
  },
};
