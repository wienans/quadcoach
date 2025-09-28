// T029 Integration test empty plan (sections=[])
// Server does not forbid empty sections array; we assert acceptance.

import request from 'supertest';
import { app } from '../setup';
import { authHeader } from '../utils/auth';

describe('Practice Plans Integration 12: empty plan', () => {
  it('persists empty sections array', async () => {
    const { Authorization } = await authHeader();
    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Empty Plan Test' });
    expect(createRes.status).toBe(201);
    expect(createRes.body.sections.length).toBeGreaterThan(0);

    const patchRes = await request(app)
      .patch(`/api/practice-plans/${createRes.body._id}`)
      .set('Authorization', Authorization)
      .send({ sections: [] });
    expect(patchRes.status).toBe(200);
    expect(Array.isArray(patchRes.body.sections)).toBe(true);
    expect(patchRes.body.sections.length).toBe(0);
  });
});
