// T009 Contract test POST /api/practice-plans
import request from 'supertest';
import { app } from '../setup';
import { authHeader, getDefaultSections } from '../utils/auth';

function expectPlanShape(body: any) {
  expect(body).toHaveProperty('_id');
  expect(body).toHaveProperty('name');
  expect(body).toHaveProperty('sections');
  expect(Array.isArray(body.sections)).toBe(true);
  expect(body.sections.length).toBe(3);
  expect(body.sections[0].groups.length).toBeGreaterThanOrEqual(1);
}

describe('POST /api/practice-plans', () => {
  it('creates a practice plan and returns 201 with structure', async () => {
    const { Authorization } = await authHeader();
    const sections = getDefaultSections();
    const res = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Morning Practice', description: 'Focus on drills', tags: ['drill'], sections });
    expect(res.status).toBe(201);
    expectPlanShape(res.body);
    expect(res.body.name).toBe('Morning Practice');
  });

  it('rejects empty name with 400', async () => {
    const { Authorization } = await authHeader();
    const res = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: '  ' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
