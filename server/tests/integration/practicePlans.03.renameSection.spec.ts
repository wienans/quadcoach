// T020 Integration test rename section & set targetDuration
// Creates a plan, renames first section and sets targetDuration, then validates.
// Also checks validation rejection for exceedsMax duration.

import request from 'supertest';
import { app } from '../setup';
import { authHeader } from '../utils/auth';

describe('Practice Plans Integration 03: rename section & targetDuration', () => {
  it('renames a section and sets targetDuration', async () => {
    const { Authorization } = await authHeader();
    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Section Rename Plan' });
    expect(createRes.status).toBe(201);
    const planId = createRes.body._id;
    const originalFirst = createRes.body.sections[0];

    const patchRes = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({
        sections: [
          { ...originalFirst, name: 'Warmup', targetDuration: 45 },
          ...createRes.body.sections.slice(1),
        ],
      });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.sections[0].name).toBe('Warmup');
    expect(patchRes.body.sections[0].targetDuration).toBe(45);
  });

  it('rejects setting targetDuration above 1000 with validation error', async () => {
    const { Authorization } = await authHeader();
    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Exceeds Max Plan' });
    expect(createRes.status).toBe(201);
    const planId = createRes.body._id;
    const first = createRes.body.sections[0];

    const patchRes = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({
        sections: [
          { ...first, targetDuration: 1001 },
          ...createRes.body.sections.slice(1),
        ],
      });
    expect(patchRes.status).toBe(400);
    expect(patchRes.body).toHaveProperty('errors');
    expect(Array.isArray(patchRes.body.errors)).toBe(true);
    expect(patchRes.body.errors.some((e: string) => e.includes('exceedsMax'))).toBe(true);
  });
});
