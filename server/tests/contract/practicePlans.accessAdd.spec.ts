// T013 Contract test POST /api/practice-plans/:id/access
import request from 'supertest';
import { app } from '../setup';
import { authHeader, createVerifiedUser, getAccessToken } from '../utils/auth';

async function createPlan() {
  const { Authorization, user } = await authHeader();
  const res = await request(app)
    .post('/api/practice-plans')
    .set('Authorization', Authorization)
    .send({ name: 'Access Plan' });
  return { plan: res.body, Authorization, owner: user };
}

describe('POST /api/practice-plans/:id/access', () => {
  it('adds access entry and returns 200 with list', async () => {
    const { plan, Authorization } = await createPlan();
    const { user: collaborator } = await createVerifiedUser({ email: 'collab@example.com' });
    const res = await request(app)
      .post(`/api/practice-plans/${plan._id}/access`)
      .set('Authorization', Authorization)
      .send({ userId: collaborator._id });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.access)).toBe(true);
    const entry = res.body.access.find((a: any) => a.user === collaborator._id.toString());
    expect(entry).toBeTruthy();
  });

  it('returns 404 for unknown plan', async () => {
    const { Authorization } = await authHeader();
    const { user: collaborator } = await createVerifiedUser({ email: 'collab2@example.com' });
    const res = await request(app)
      .post('/api/practice-plans/6521e55f5f5f5f5f5f5f5f5f/access')
      .set('Authorization', Authorization)
      .send({ userId: collaborator._id });
    expect(res.status).toBe(404);
  });
});
