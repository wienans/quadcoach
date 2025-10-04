// Practice Plan controller (implements T035–T040 + T054 access helper + T055 error util)
import { Request, Response } from "express";
import mongoose from "mongoose";
import { ISection, PracticePlan } from "../models/practicePlan";
import { PracticePlanAccess } from "../models/practicePlanAccess";
import {
  isNonEmptyName,
  validateNonNegativeDurations,
} from "./helpers/practicePlanValidation";

// @ts-ignore augment Request for user info inserted by auth middleware
interface AuthedRequest extends Request {
  UserInfo?: { id?: string };
}

interface AccessContext {
  plan: any | null;
  isOwner: boolean;
  hasEdit: boolean;
  hasAnyAccess: boolean;
}

async function loadAccessContext(
  planId: string,
  userId: string
): Promise<AccessContext> {
  const plan = await PracticePlan.findById(planId);
  if (!plan)
    return { plan: null, isOwner: false, hasEdit: false, hasAnyAccess: false };
  const isOwner = plan.user.toString() === userId;
  if (isOwner)
    return { plan, isOwner: true, hasEdit: true, hasAnyAccess: true };
  const access = await PracticePlanAccess.findOne({
    practicePlan: plan._id,
    user: userId,
  });
  if (!access)
    return { plan, isOwner: false, hasEdit: false, hasAnyAccess: false };
  return {
    plan,
    isOwner: false,
    hasEdit: access.access === "edit",
    hasAnyAccess: true,
  };
}

function sendValidation(res: Response, message: string, errors: string[]) {
  return res.status(400).json({ message, errors });
}

export const createPracticePlan = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { name, description, tags, sections } = req.body || {};
    if (!isNonEmptyName(name))
      return res.status(400).json({ message: "Name required" });

    const plan = await PracticePlan.create({
      name: name.trim(),
      description,
      tags: tags || [],
      sections,
      user: userId,
    });
    return res.status(201).json(plan);
  } catch (e: any) {
    return res.status(500).json({ message: "Create failed", error: e.message });
  }
};

export const getPracticePlan = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const id = req.params.id;
    const ctx = await loadAccessContext(id, userId);
    if (!ctx.plan || !ctx.hasAnyAccess)
      return res.status(404).json({ message: "Not found" });
    return res.json(ctx.plan);
  } catch (e: any) {
    return res.status(500).json({ message: "Get failed", error: e.message });
  }
};

export const patchPracticePlan = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const id = req.params.id;
    const ctx = await loadAccessContext(id, userId);
    if (!ctx.plan || !(ctx.isOwner || ctx.hasEdit))
      return res.status(404).json({ message: "Not found" });

    const updates: any = {};
    if (req.body.name !== undefined) {
      if (!isNonEmptyName(req.body.name))
        return res.status(400).json({ message: "Invalid name" });
      updates.name = req.body.name.trim();
    }
    if (req.body.description !== undefined)
      updates.description = req.body.description;
    if (req.body.tags !== undefined) updates.tags = req.body.tags;
    if (req.body.sections !== undefined) {
      const durationErrors = validateNonNegativeDurations(req.body);
      if (durationErrors.length)
        return sendValidation(
          res,
          "Duration validation failed",
          durationErrors
        );
      updates.sections = req.body.sections;
    }
    updates.updatedAt = new Date();
    const updated = await PracticePlan.findByIdAndUpdate(
      ctx.plan._id,
      updates,
      { new: true }
    );
    return res.json(updated);
  } catch (e: any) {
    return res.status(500).json({ message: "Patch failed", error: e.message });
  }
};

export const deletePracticePlan = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const id = req.params.id;
    const ctx = await loadAccessContext(id, userId);
    if (!ctx.plan || !ctx.isOwner)
      return res.status(404).json({ message: "Not found" });
    await PracticePlan.deleteOne({ _id: ctx.plan._id });
    await PracticePlanAccess.deleteMany({ practicePlan: ctx.plan._id });
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ message: "Delete failed", error: e.message });
  }
};

export const addAccess = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const id = req.params.id;
    const targetUser = req.body.userId;
    if (!targetUser)
      return res.status(400).json({ message: "userId required" });
    const ctx = await loadAccessContext(id, userId);
    if (!ctx.plan || !ctx.isOwner)
      return res.status(404).json({ message: "Not found" });

    await PracticePlanAccess.updateOne(
      { user: targetUser, practicePlan: ctx.plan._id },
      { $set: { access: "edit" } },
      { upsert: true }
    );
    const accessList = await PracticePlanAccess.find({
      practicePlan: ctx.plan._id,
    });
    return res.json({ access: accessList });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: "Add access failed", error: e.message });
  }
};

export const removeAccess = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const id = req.params.id;
    const accessId = req.params.accessId;
    const ctx = await loadAccessContext(id, userId);
    if (!ctx.plan || !ctx.isOwner)
      return res.status(404).json({ message: "Not found" });

    await PracticePlanAccess.deleteOne({
      _id: accessId,
      practicePlan: ctx.plan._id,
    });
    const accessList = await PracticePlanAccess.find({
      practicePlan: ctx.plan._id,
    });
    return res.json({ access: accessList });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: "Remove access failed", error: e.message });
  }
};
