import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { Kanban, Tag } from "@/models";
import WorkspaceMember from "@/models/workspaceMemberModel";
import Workspace from "@/models/workspaceModel";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse } from "@/utils";
import mongoDbHandler from "@/utils/mongoDbHandler";

export default {
  createKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { key, name, workspaceId } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "key",
        error: "kanban's key is required.",
      });
    } else if (!key.match(/^[0-9a-z-]+$/g)) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "key",
        error: "Key value only allows lowercase English, numbers and `-` symbols.",
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
      const existId = await Kanban.findOne({ key });

      if (existId) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
          field: "key",
          error: "key already exists, unique requirement.",
        });
      } else {
        const newKanban = await Kanban.create({
          key,
          name,
          workspaceId,
        });

        // 找到 kanban 建立在哪個 workspace
        const targetWorkspace = await Workspace.findOne({ _id: workspaceId });
        // 如果 workspace 存在就把新建立的 kanban id 寫入資料庫
        if (targetWorkspace) {
          // eslint-disable-next-line no-underscore-dangle
          const kanbans = targetWorkspace?.kanbans.concat([newKanban._id]);
          targetWorkspace.kanbans = kanbans;
          await targetWorkspace.save();
        }

        sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
          key: newKanban.key,
          name: newKanban.name,
          workspaceId: newKanban.workspaceId,
          listOrder: newKanban.listOrder,
          isArchived: newKanban.isArchived,
        });
      }
    }
  },
  getKanbanByKey: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else {
      // mongoDbHandler.getDb(res, next, "Kanban", Kanban, { _id: key }, { _id: 0 });
      const kanban = await Kanban.findOne({ _id: key, isArchived: false }).populate("listOrder");
      if (!kanban) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_TO_GET_DATA, {
          field: "kanban",
          error: "kanban not found or archived.",
        });
      } else {
        sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, kanban);
      }
    }
  },
  modifyKanbanKey: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { newKey } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (newKey.indexOf(" ") > -1) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "space is not allowed in key.",
      });
    } else {
      const updateResult = await Kanban.updateOne({ key }, { key: newKey });
      if (!updateResult.matchedCount) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
          error: `Kanban not found.`,
        });
      } else {
        const target = await Kanban.findOne({ key: newKey }, { _id: 0 });
        if (!target) {
          forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
        } else {
          sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
            target,
          });
        }
      }
    }
  },
  renameKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { name } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (!name) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "name",
        error: "kanban's name is required.",
      });
    } else {
      mongoDbHandler.updateDb(res, next, "Kanban", Kanban, { key }, { name }, { _id: 0 });
    }
  },
  archiveKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { isArchived } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (Object.keys(req.body).indexOf("isArchived") < 0) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "isArchived",
        error: "isArchived is required.",
      });
    } else {
      mongoDbHandler.updateDb(res, next, "Kanban", Kanban, { key }, { isArchived }, { _id: 0 });
    }
  },
  pinKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { isPinned } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (Object.keys(req.body).indexOf("isPinned") < 0) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "isPinned",
        error: "isPinned is required.",
      });
    } else {
      mongoDbHandler.updateDb(res, next, "Kanban", Kanban, { key }, { isPinned }, { _id: 0 });
    }
  },
  getKanbanMembers: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const kanbanData = await Kanban.findOne({ key });
    if (!kanbanData) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
        error: `Kanban not found.`,
      });
    } else {
      const workspaceData = await WorkspaceMember.find({ workspaceId: kanbanData.workspaceId }).populate([
        "workspace",
        "user",
      ]);
      if (!workspaceData) {
        forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
      } else {
        const membersData = workspaceData.map((item) => ({
          userId: item.userId,
          username: item.user?.username,
          role: item.role,
        }));
        res.json(membersData);
      }
    }
  },
  getTags: async (req: Request, res: Response, _: NextFunction) => {
    const { kanbanId } = req.params;
    const allTags = await Tag.find({ kanbanId, isArchived: false });
    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, allTags);
  },
  createTag: async (req: Request, res: Response, next: NextFunction) => {
    const { kanbanId } = req.params;
    const { name, color, icon } = req.body;
    const newTag = await Tag.create({ kanbanId, name, color, icon });
    if (!newTag) {
      forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
    }
    const allTags = await Tag.find({ kanbanId, isArchived: false });
    sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, allTags);
  },
  getTagById: async (req: Request, res: Response, next: NextFunction) => {
    const { kanbanId, tagId } = req.params;
    mongoDbHandler.getDb(res, next, "Tag", Tag, { kanbanId, _id: tagId }, {});
  },
  updateTagById: async (req: Request, res: Response, next: NextFunction) => {
    const { kanbanId, tagId } = req.params;
    const { name, color, icon } = req.body;
    const newTag = await Tag.findOneAndUpdate({ kanbanId, _id: tagId }, { name, color, icon });
    if (!newTag) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "tagId",
        error: "Tag not found.",
      });
    }
    const allTags = await Tag.find({ kanbanId, isArchived: false });
    sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, allTags);
  },
  archiveTag: async (req: Request, res: Response, next: NextFunction) => {
    const { kanbanId, tagId } = req.params;
    const newTag = await Tag.findOneAndUpdate({ kanbanId, _id: tagId }, { isArchived: true });
    if (!newTag) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "tagId",
        error: "Tag not found.",
      });
    }
    const allTags = await Tag.find({ kanbanId, isArchived: false });
    sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, allTags);
  },
};
