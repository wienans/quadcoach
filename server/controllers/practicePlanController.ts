// Practice Plan controller (implements T035–T040)
import { Request, Response } from 'express';
import { PracticePlan } from '../models/practicePlan';
import { PracticePlanAccess } from '../models/practicePlanAccess';
import { isNonEmptyName, validateNonNegativeDurations } from './helpers/practicePlanValidation';
import mongoose from 'mongoose';

// @ts-ignore augment Request for user info
interface AuthedRequest extends Request { UserInfo?: { id?: string } }

function ownerFilter(userId: string, id: string) {
  return { _id: id, user: userId };
}

export const createPracticePlan = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { name, description, tags } = req.body || {};
    if (!isNonEmptyName(name)) return res.status(400).json({ message: 'Name required' });

    // Default 3 sections (annotated to avoid never[] inference)
    interface TempSection { id: string; name: string; targetDuration: number; groups: any[] }
    const defaultSections: TempSection[] = [
      { id: new mongoose.Types.ObjectId().toString(), name: 'Warm Up', targetDuration: 0, groups: [] },
      { id: new mongoose.Types.ObjectId().toString(), name: 'Main', targetDuration: 0, groups: [] },
      { id: new mongoose.Types.ObjectId().toString(), name: 'Cooldown', targetDuration: 0, groups: [] },
    ];
    // Add initial group to first section
    defaultSections[0].groups.push({
      id: new mongoose.Types.ObjectId().toString(),
      name: 'All Players',
      items: [],
    });

    const plan = await PracticePlan.create({
      name: name.trim(),
      description,
      tags: tags || [],
      sections: defaultSections,
      user: userId,
    });
    return res.status(201).json(plan);
  } catch (e: any) {
    return res.status(500).json({ message: 'Create failed', error: e.message });
  }
};

export const getPracticePlan = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const id = req.params.id;
    const plan = await PracticePlan.findById(id);
    if (!plan) return res.status(404).json({ message: 'Not found' });
    if (plan.user.toString() !== userId) {
      const access = await PracticePlanAccess.findOne({ practicePlan: plan._id, user: userId });
      if (!access) return res.status(404).json({ message: 'Not found' }); // conceal existence
    }
    return res.json(plan);
  } catch (e: any) {
    return res.status(500).json({ message: 'Get failed', error: e.message });
  }
};

export const patchPracticePlan = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const id = req.params.id;
    const plan = await PracticePlan.findById(id);
    if (!plan) return res.status(404).json({ message: 'Not found' });
    let canEdit = plan.user.toString() === userId;
    if (!canEdit) {
      const access = await PracticePlanAccess.findOne({ practicePlan: plan._id, user: userId, access: 'edit' });
      if (!access) return res.status(404).json({ message: 'Not found' });
      canEdit = true;
    }
    const updates: any = {};
    if (req.body.name !== undefined) {
      if (!isNonEmptyName(req.body.name)) return res.status(400).json({ message: 'Invalid name' });
      updates.name = req.body.name.trim();
    }
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.tags !== undefined) updates.tags = req.body.tags;
    if (req.body.sections !== undefined) {
      const durationErrors = validateNonNegativeDurations(req.body);
      if (durationErrors.length) return res.status(400).json({ message: 'Duration validation failed', errors: durationErrors });
      updates.sections = req.body.sections;
    }
    updates.updatedAt = new Date();
    const updated = await PracticePlan.findByIdAndUpdate(plan._id, updates, { new: true });
    return res.json(updated);
  } catch (e: any) {
    return res.status(500).json({ message: 'Patch failed', error: e.message });
  }
};

export const deletePracticePlan = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const id = req.params.id;
    const plan = await PracticePlan.findById(id);
    if (!plan) return res.status(404).json({ message: 'Not found' });
    if (plan.user.toString() !== userId) return res.status(404).json({ message: 'Not found' }); // Only owner can delete
    await PracticePlan.deleteOne({ _id: plan._id });
    await PracticePlanAccess.deleteMany({ practicePlan: plan._id });
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ message: 'Delete failed', error: e.message });
  }
};

export const addAccess = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const id = req.params.id;
    const targetUser = req.body.userId;
    if (!targetUser) return res.status(400).json({ message: 'userId required' });

    const plan = await PracticePlan.findById(id);
    if (!plan) return res.status(404).json({ message: 'Not found' });
    if (plan.user.toString() !== userId) return res.status(404).json({ message: 'Not found' }); // Only owner grants access

    await PracticePlanAccess.updateOne(
      { user: targetUser, practicePlan: plan._id },
      { $set: { access: 'edit' } },
      { upsert: true }
    );
    const accessList = await PracticePlanAccess.find({ practicePlan: plan._id });
    return res.json({ access: accessList });
  } catch (e: any) {
    return res.status(500).json({ message: 'Add access failed', error: e.message });
  }
};

export const removeAccess = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.UserInfo?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const id = req.params.id;
    const accessId = req.params.accessId;

    const plan = await PracticePlan.findById(id);
    if (!plan) return res.status(404).json({ message: 'Not found' });
    if (plan.user.toString() !== userId) return res.status(404).json({ message: 'Not found' }); // Only owner revokes

    await PracticePlanAccess.deleteOne({ _id: accessId, practicePlan: plan._id });
    const accessList = await PracticePlanAccess.find({ practicePlan: plan._id });
    return res.json({ access: accessList });
  } catch (e: any) {
    return res.status(500).json({ message: 'Remove access failed', error: e.message });
  }
};
