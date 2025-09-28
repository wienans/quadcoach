// T010 Contract test GET /api/practice-plans/:id
import request from 'supertest';
import { app } from '../setup';
import { authHeader } from '../utils/auth';

async function createPlan() {
  const { Authorization } = await authHeader();
  const res = await request(app)
    .post('/api/practice-plans')
    .set('Authorization', Authorization)
    .send({ name: 'Plan Get Test' });
  return { plan: res.body, Authorization };
}

describe('GET /api/practice-plans/:id', () => {
  it('returns 200 and practice plan when found', async () => {
    const { plan, Authorization } = await createPlan();
    const res = await request(app)
      .get(`/api/practice-plans/${plan._id}`)
      .set('Authorization', Authorization);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(plan._id);
    expect(res.body.name).toBe('Plan Get Test');
  });

  it('returns 404 when practice plan not found', async () => {
    const { Authorization } = await authHeader();
    const res = await request(app)
      .get('/api/practice-plans/6521e55f5f5f5f5f5f5f5f5f') // unlikely ObjectId
      .set('Authorization', Authorization);
    expect(res.status).toBe(404);
  });
});
