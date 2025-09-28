// T012 Contract test DELETE /api/practice-plans/:id
import request from 'supertest';
import { app } from '../setup';
import { authHeader } from '../utils/auth';

async function createPlan() {
  const { Authorization } = await authHeader();
  const res = await request(app)
    .post('/api/practice-plans')
    .set('Authorization', Authorization)
    .send({ name: 'Delete Plan' });
  return { plan: res.body, Authorization };
}

describe('DELETE /api/practice-plans/:id', () => {
  it('deletes existing plan and returns 204', async () => {
    const { plan, Authorization } = await createPlan();
    const res = await request(app)
      .delete(`/api/practice-plans/${plan._id}`)
      .set('Authorization', Authorization);
    expect(res.status).toBe(204);
    // confirm gone
    const getRes = await request(app)
      .get(`/api/practice-plans/${plan._id}`)
      .set('Authorization', Authorization);
    expect(getRes.status).toBe(404);
  });

  it('returns 404 for unknown id', async () => {
    const { Authorization } = await authHeader();
    const res = await request(app)
      .delete('/api/practice-plans/6521e55f5f5f5f5f5f5f5f5f')
      .set('Authorization', Authorization);
    expect(res.status).toBe(404);
  });
});
