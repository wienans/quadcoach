// T019 Integration test create defaults (3 sections + group)
// Uses token from previous login test to create a default practice plan.

import request from 'supertest';
import { app } from '../setup';
import { authHeader, getDefaultSections } from '../utils/auth';

describe('Practice Plans Integration 02: create defaults', () => {
  it('creates plan with default 3 sections and initial group', async () => {
    const { Authorization } = await authHeader();
    const sections = getDefaultSections();
    const res = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Integration Plan', description: 'Initial defaults', sections });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('sections');
    expect(Array.isArray(res.body.sections)).toBe(true);
    expect(res.body.sections.length).toBe(3);
    res.body.sections.forEach((s: any) => {
      expect(s).toHaveProperty('groups');
      expect(Array.isArray(s.groups)).toBe(true);
    });
    expect(res.body.sections[0].groups.length).toBeGreaterThanOrEqual(1);
  });
});
