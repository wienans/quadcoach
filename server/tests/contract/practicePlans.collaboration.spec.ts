// Collaboration tests: owner grants edit; collaborator can read & patch but not delete or manage access
import request from 'supertest';
import { app } from '../setup';
import { authHeader, createVerifiedUser, getAccessToken } from '../utils/auth';

async function createPlanAndCollaborator() {
  const { Authorization: ownerAuth, user: owner } = await authHeader();
  const { user: collaborator } = await createVerifiedUser({ email: 'collab_read_edit@example.com' });
  // Owner creates plan
  const planRes = await request(app)
    .post('/api/practice-plans')
    .set('Authorization', ownerAuth)
    .send({ name: 'Collab Plan' });
  // Owner grants access
  await request(app)
    .post(`/api/practice-plans/${planRes.body._id}/access`)
    .set('Authorization', ownerAuth)
    .send({ userId: collaborator._id, access: 'edit' });
  // Build collaborator auth header
  const collabToken = await getAccessToken(collaborator);
  const collabAuth = `Bearer ${collabToken}`;
  return { plan: planRes.body, ownerAuth, collabAuth };
}

describe('Practice Plan collaboration access', () => {
  it('collaborator can GET plan', async () => {
    const { plan, collabAuth } = await createPlanAndCollaborator();
    const res = await request(app)
      .get(`/api/practice-plans/${plan._id}`)
      .set('Authorization', collabAuth);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(plan._id);
  });

  it('collaborator can PATCH plan', async () => {
    const { plan, collabAuth } = await createPlanAndCollaborator();
    const res = await request(app)
      .patch(`/api/practice-plans/${plan._id}`)
      .set('Authorization', collabAuth)
      .send({ description: 'Collaborator Edit' });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Collaborator Edit');
  });

  it('collaborator cannot DELETE plan (403 Forbidden)', async () => {
    const { plan, collabAuth } = await createPlanAndCollaborator();
    const res = await request(app)
      .delete(`/api/practice-plans/${plan._id}`)
      .set('Authorization', collabAuth);
    expect(res.status).toBe(403);
  });

  it('collaborator cannot add additional access (403 Forbidden)', async () => {
    const { plan, collabAuth } = await createPlanAndCollaborator();
    const { user: another } = await createVerifiedUser({ email: 'another@example.com' });
    const res = await request(app)
      .post(`/api/practice-plans/${plan._id}/access`)
      .set('Authorization', collabAuth)
      .send({ userId: another._id, access: 'view' });
    expect(res.status).toBe(403);
  });
});
