// T011 Contract test PATCH /api/practice-plans/:id
import request from 'supertest';
import { app } from '../setup';
import { authHeader } from '../utils/auth';

async function createBasePlan() {
  const { Authorization } = await authHeader();
  const res = await request(app)
    .post('/api/practice-plans')
    .set('Authorization', Authorization)
    .send({ name: 'Patch Base' });
  return { plan: res.body, Authorization };
}

describe('PATCH /api/practice-plans/:id', () => {
  it('updates fields and returns 200 with updated doc', async () => {
    const { plan, Authorization } = await createBasePlan();
    const res = await request(app)
      .patch(`/api/practice-plans/${plan._id}`)
      .set('Authorization', Authorization)
      .send({ name: 'Updated Name', description: 'New Desc', tags: ['a', 'b'] });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.description).toBe('New Desc');
    expect(res.body.tags).toEqual(['a', 'b']);
  });

  it('returns 404 for unknown id', async () => {
    const { Authorization } = await authHeader();
    const res = await request(app)
      .patch('/api/practice-plans/6521e55f5f5f5f5f5f5f5f5f')
      .set('Authorization', Authorization)
      .send({ name: 'Will Not Work' });
    expect(res.status).toBe(404);
  });
});
