// T017 Validation test: reject durations > 1000, allow exactly 1000
import request from 'supertest';
import { app } from '../setup';
import { authHeader } from '../utils/auth';
import mongoose from 'mongoose';

async function createBasePlan(name = 'MaxDur Base') {
  const { Authorization } = await authHeader();
  const res = await request(app)
    .post('/api/practice-plans')
    .set('Authorization', Authorization)
    .send({ name });
  return { plan: res.body, Authorization };
}

describe('Practice Plans max duration validation (>1000 rejected, 1000 allowed)', () => {
  it('rejects section targetDuration > 1000', async () => {
    const { plan, Authorization } = await createBasePlan('Section over max');
    const sections = plan.sections;
    sections[0].targetDuration = 1001;
    const patchRes = await request(app)
      .patch(`/api/practice-plans/${plan._id}`)
      .set('Authorization', Authorization)
      .send({ sections });
    expect(patchRes.status).toBe(400);
    expect(patchRes.body.errors.some((e: string) => e.includes('targetDuration') && e.includes('exceedsMax'))).toBe(true);
  });

  it('allows section targetDuration == 1000', async () => {
    const { plan, Authorization } = await createBasePlan('Section at max');
    const sections = plan.sections;
    sections[0].targetDuration = 1000;
    const patchRes = await request(app)
      .patch(`/api/practice-plans/${plan._id}`)
      .set('Authorization', Authorization)
      .send({ sections });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.sections[0].targetDuration).toBe(1000);
  });

  it('rejects break item duration > 1000', async () => {
    const { plan, Authorization } = await createBasePlan('Break over max');
    const sections = plan.sections;
    if (!sections[0].groups.length) {
      sections[0].groups.push({ id: new mongoose.Types.ObjectId().toString(), name: 'G1', items: [] });
    }
    sections[0].groups[0].items.push({ id: new mongoose.Types.ObjectId().toString(), kind: 'break', name: 'Water', duration: 1002 });
    const patchRes = await request(app)
      .patch(`/api/practice-plans/${plan._id}`)
      .set('Authorization', Authorization)
      .send({ sections });
    expect(patchRes.status).toBe(400);
    expect(patchRes.body.errors.some((e: string) => e.includes('duration') && e.includes('exceedsMax'))).toBe(true);
  });

  it('allows break item duration == 1000', async () => {
    const { plan, Authorization } = await createBasePlan('Break at max');
    const sections = plan.sections;
    if (!sections[0].groups.length) {
      sections[0].groups.push({ id: new mongoose.Types.ObjectId().toString(), name: 'G1', items: [] });
    }
    sections[0].groups[0].items.push({ id: new mongoose.Types.ObjectId().toString(), kind: 'break', name: 'Water', duration: 1000 });
    const patchRes = await request(app)
      .patch(`/api/practice-plans/${plan._id}`)
      .set('Authorization', Authorization)
      .send({ sections });
    expect(patchRes.status).toBe(200);
    const breakItem = patchRes.body.sections[0].groups[0].items.find((i: any) => i.kind === 'break');
    expect(breakItem.duration).toBe(1000);
  });

  it('rejects exercise durationOverride > 1000', async () => {
    const { plan, Authorization } = await createBasePlan('Override over max');
    const sections = plan.sections;
    if (!sections[0].groups.length) {
      sections[0].groups.push({ id: new mongoose.Types.ObjectId().toString(), name: 'G1', items: [] });
    }
    sections[0].groups[0].items.push({
      id: new mongoose.Types.ObjectId().toString(),
      kind: 'exercise',
      exerciseId: new mongoose.Types.ObjectId().toString(),
      name: 'Drill',
      durationOverride: 1500,
    });
    const patchRes = await request(app)
      .patch(`/api/practice-plans/${plan._id}`)
      .set('Authorization', Authorization)
      .send({ sections });
    expect(patchRes.status).toBe(400);
    expect(patchRes.body.errors.some((e: string) => e.includes('durationOverride') && e.includes('exceedsMax'))).toBe(true);
  });

  it('allows exercise durationOverride == 1000', async () => {
    const { plan, Authorization } = await createBasePlan('Override at max');
    const sections = plan.sections;
    if (!sections[0].groups.length) {
      sections[0].groups.push({ id: new mongoose.Types.ObjectId().toString(), name: 'G1', items: [] });
    }
    sections[0].groups[0].items.push({
      id: new mongoose.Types.ObjectId().toString(),
      kind: 'exercise',
      exerciseId: new mongoose.Types.ObjectId().toString(),
      name: 'Drill',
      durationOverride: 1000,
    });
    const patchRes = await request(app)
      .patch(`/api/practice-plans/${plan._id}`)
      .set('Authorization', Authorization)
      .send({ sections });
    expect(patchRes.status).toBe(200);
    const exItem = patchRes.body.sections[0].groups[0].items.find((i: any) => i.kind === 'exercise');
    expect(exItem.durationOverride).toBe(1000);
  });
});
