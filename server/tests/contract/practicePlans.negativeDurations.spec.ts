// T016 Validation test: reject negative targetDuration / item duration
import request from 'supertest';
import { app } from '../setup';
import { authHeader } from '../utils/auth';
import mongoose from 'mongoose';

async function basePlanWithIds() {
  const sections = [
    { id: new mongoose.Types.ObjectId().toString(), name: 'S1', targetDuration: 10, groups: [] },
  ];
  return sections;
}

describe('Practice Plans negative durations validation', () => {
  it('rejects negative section targetDuration on PATCH', async () => {
    const { Authorization } = await authHeader();
    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'NegDur Plan' });
    const plan = createRes.body;
    const sections = plan.sections;
    sections[0].targetDuration = -5; // inject invalid
    const patchRes = await request(app)
      .patch(`/api/practice-plans/${plan._id}`)
      .set('Authorization', Authorization)
      .send({ sections });
    expect(patchRes.status).toBe(400);
    expect(patchRes.body.errors.join(' ')).toMatch(/targetDuration/);
  });

  it('rejects negative break item duration', async () => {
    const { Authorization } = await authHeader();
    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Neg item Plan' });
    const plan = createRes.body;
    const sections = plan.sections;
    // Add group if missing
    if (!sections[0].groups.length) {
      sections[0].groups.push({ id: new mongoose.Types.ObjectId().toString(), name: 'Group A', items: [] });
    }
    sections[0].groups[0].items.push({ id: new mongoose.Types.ObjectId().toString(), kind: 'break', name: 'Water', duration: -3 });
    const patchRes = await request(app)
      .patch(`/api/practice-plans/${plan._id}`)
      .set('Authorization', Authorization)
      .send({ sections });
    expect(patchRes.status).toBe(400);
    expect(patchRes.body.errors.join(' ')).toMatch(/duration negative/);
  });
});
