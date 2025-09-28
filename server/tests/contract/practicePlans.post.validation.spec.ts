// T015 Validation test: reject empty name on create (POST /api/practice-plans)
import request from 'supertest';
import { app } from '../setup';
import { authHeader } from '../utils/auth';

describe('POST /api/practice-plans validation (empty name)', () => {
  it('returns 400 when name is empty', async () => {
    const { Authorization } = await authHeader();
    const res = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Name/i);
  });
});
