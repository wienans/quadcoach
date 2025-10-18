// T027 Integration test grant access edit to second user
// Flow: owner creates plan -> owner grants access -> collaborator patches plan.

import request from 'supertest';
import { app } from '../setup';
import { createVerifiedUser, getAccessToken } from '../utils/auth';

async function authFor(user: any) {
  const token = await getAccessToken(user);
  return { Authorization: `Bearer ${token}` };
}

describe('Practice Plans Integration 10: grant access', () => {
  it('allows collaborator to patch after grant', async () => {
    const { user: owner } = await createVerifiedUser({ email: `owner_${Date.now()}@ex.com` });
    const { user: collaborator } = await createVerifiedUser({ email: `col_${Date.now()}@ex.com` });
    const ownerAuth = await authFor(owner);
    const collabAuth = await authFor(collaborator);

    // Owner creates plan
    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', ownerAuth.Authorization)
      .send({ name: 'Shared Plan' });
    expect(createRes.status).toBe(201);
    const planId = createRes.body._id;

    // Collaborator cannot patch yet (should 403 Forbidden)
    const deniedPatch = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', collabAuth.Authorization)
      .send({ name: 'Hacker Rename' });
    expect(deniedPatch.status).toBe(403);

    // Owner grants access
    const grantRes = await request(app)
      .post(`/api/practice-plans/${planId}/access`)
      .set('Authorization', ownerAuth.Authorization)
      .send({ userId: collaborator._id.toString(), access: 'edit' });
    expect(grantRes.status).toBe(201);
    expect(grantRes.body.user).toBe(collaborator._id.toString());
    expect(grantRes.body.access).toBe('edit');

    // Collaborator patches name
    const collabPatch = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', collabAuth.Authorization)
      .send({ name: 'Collaborator Rename' });
    expect(collabPatch.status).toBe(200);
    expect(collabPatch.body.name).toBe('Collaborator Rename');
  });
});
