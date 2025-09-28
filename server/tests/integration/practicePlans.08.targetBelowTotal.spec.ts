// T025 Integration test targetDuration below sums (no server enforcement)
// We simulate a section whose targetDuration is set lower than sum of item durations.
// Since server has no aggregate logic, it simply accepts the patch; test asserts acceptance.

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../setup';
import { authHeader } from '../utils/auth';

function computeSectionItemSum(section: any): number {
  return section.groups.reduce((acc: number, g: any) =>
    acc + g.items.reduce((a: number, it: any) => a + (it.kind === 'break' ? it.duration || 0 : (it.durationOverride || 0)), 0), 0);
}

describe('Practice Plans Integration 08: target below totals allowed', () => {
  it('accepts patch where targetDuration < sum of item durations', async () => {
    const { Authorization } = await authHeader();
    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Target Below Totals Plan' });
    expect(createRes.status).toBe(201);

    const firstSection = createRes.body.sections[0];
    const enriched = {
      ...firstSection,
      groups: [
        ...firstSection.groups,
        { id: new mongoose.Types.ObjectId().toString(), name: 'G1', items: [ { id: new mongoose.Types.ObjectId().toString(), kind: 'break', name: 'B1', duration: 10 } ] },
        { id: new mongoose.Types.ObjectId().toString(), name: 'G2', items: [ { id: new mongoose.Types.ObjectId().toString(), kind: 'break', name: 'B2', duration: 12 } ] },
      ],
    };
    const sections1 = [enriched, ...createRes.body.sections.slice(1)];
    const patch1 = await request(app)
      .patch(`/api/practice-plans/${createRes.body._id}`)
      .set('Authorization', Authorization)
      .send({ sections: sections1 });
    expect(patch1.status).toBe(200);

    const updatedFirst = patch1.body.sections[0];
    const total = computeSectionItemSum(updatedFirst);
    expect(total).toBe(22);

    // Now set targetDuration below 22, e.g., 5
    const lowered = { ...updatedFirst, targetDuration: 5 };
    const sections2 = [lowered, ...patch1.body.sections.slice(1)];
    const patch2 = await request(app)
      .patch(`/api/practice-plans/${createRes.body._id}`)
      .set('Authorization', Authorization)
      .send({ sections: sections2 });
    expect(patch2.status).toBe(200);
    expect(patch2.body.sections[0].targetDuration).toBe(5);
  });
});
