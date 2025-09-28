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
  const addRes = await request(app)
    .post(`/api/practice-plans/${planRes.body._id}/access`)
    .set('Authorization', Authorization)
    .send({ userId: collaborator._id });
  const accessId = addRes.body.access.find((a: any) => a.user === collaborator._id.toString())._id;
  return { plan: planRes.body, accessId, Authorization };
}

describe('DELETE /api/practice-plans/:id/access/:accessId', () => {
  it('removes access entry and returns 200 with list', async () => {
    const { plan, accessId, Authorization } = await createPlanWithAccess();
    const delRes = await request(app)
      .delete(`/api/practice-plans/${plan._id}/access/${accessId}`)
      .set('Authorization', Authorization);
    expect(delRes.status).toBe(200);
    const stillThere = delRes.body.access.find((a: any) => a._id === accessId);
    expect(stillThere).toBeUndefined();
  });

  it('returns 404 for unknown plan', async () => {
    const { Authorization } = await authHeader();
    const res = await request(app)
      .delete('/api/practice-plans/6521e55f5f5f5f5f5f5f5f5f/access/6521e55f5f5f5f5f5f5f5f5e')
      .set('Authorization', Authorization);
    expect(res.status).toBe(404);
  });
});
