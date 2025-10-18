// T014 Contract test DELETE /api/practice-plans/:id/access/:accessId
import request from 'supertest';
import { app } from '../setup';
import { authHeader, createVerifiedUser } from '../utils/auth';

async function createPlanWithAccess() {
  const { Authorization } = await authHeader();
  const { user: collaborator } = await createVerifiedUser({ email: 'collabdel@example.com' });
  const planRes = await request(app)
    .post('/api/practice-plans')
    .set('Authorization', Authorization)
    .send({ name: 'Access Delete Plan' });
  await request(app)
    .post(`/api/practice-plans/${planRes.body._id}/access`)
    .set('Authorization', Authorization)
    .send({ userId: collaborator._id, access: 'view' });
  return { plan: planRes.body, userId: collaborator._id, Authorization };
}

describe('DELETE /api/practice-plans/:id/access', () => {
  it('removes access entry and returns 200 with message', async () => {
    const { plan, userId, Authorization } = await createPlanWithAccess();
    const delRes = await request(app)
      .delete(`/api/practice-plans/${plan._id}/access`)
      .set('Authorization', Authorization)
      .send({ userId });
    expect(delRes.status).toBe(200);
    expect(delRes.body.message).toBe('Access removed successfully');
    // Verify removal via GET /:id/access
    const listRes = await request(app)
      .get(`/api/practice-plans/${plan._id}/access`)
      .set('Authorization', Authorization);
    expect(listRes.status).toBe(200);
    expect(listRes.body.find((a: any) => a.user.toString() === userId.toString())).toBeUndefined();
  });

  it('returns 404 for unknown plan', async () => {
    const { Authorization } = await authHeader();
    const res = await request(app)
      .delete('/api/practice-plans/6521e55f5f5f5f5f5f5f5f5f/access')
      .set('Authorization', Authorization)
      .send({ userId: '6521e55f5f5f5f5f5f5f5f5e' });
    expect(res.status).toBe(404);
  });
});
