// T028 Integration test concurrent edit last-save-wins
// Server uses simple last write wins (no version check). We simulate two clients:
// - Client A fetches original
// - Client B patches (rename plan)
// - Client A (stale) patches (set description)
// Expect final state = last patch's combination (description present, name reset if A didn't include B's change)

import request from 'supertest';
import { app } from '../setup';
import { authHeader } from '../utils/auth';

describe('Practice Plans Integration 11: concurrent save last-wins', () => {
  it('stale patch overwrites previous changes (demonstrating last write wins)', async () => {
    const { Authorization } = await authHeader();

    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Concurrent Plan', description: 'Initial' });
    expect(createRes.status).toBe(201);
    const planId = createRes.body._id;

    // Client A snapshot
    const clientAPlan = createRes.body;

    // Client B modifies name
    const clientBSections = clientAPlan.sections; // unchanged
    const patchB = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ name: 'Renamed By B', sections: clientBSections });
    expect(patchB.status).toBe(200);
    expect(patchB.body.name).toBe('Renamed By B');

    // Client A stale modifies description only (implicitly sends old name)
    const patchAStale = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ name: clientAPlan.name, description: 'Desc By A After B', sections: clientAPlan.sections });
    expect(patchAStale.status).toBe(200);

    // Final should reflect last write (A), overwriting name back to original
    const finalGet = await request(app)
      .get(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization);
    expect(finalGet.status).toBe(200);
    expect(finalGet.body.description).toBe('Desc By A After B');
    expect(finalGet.body.name).toBe('Concurrent Plan'); // reverted due to stale write
  });
});
