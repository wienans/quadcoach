// T017 Unauthorized access tests hitting each endpoint without JWT
import request from 'supertest';
import { app } from '../setup';

describe('Practice Plans unauthorized access', () => {
  // Mutation endpoints that require authentication
  const protectedEndpoints: Array<{ method: 'POST' | 'PATCH' | 'DELETE'; path: string; body?: any }> = [
    { method: 'POST', path: '/api/practice-plans', body: { name: 'x' } },
    { method: 'PATCH', path: '/api/practice-plans/123', body: { name: 'y' } },
    { method: 'DELETE', path: '/api/practice-plans/123' },
    { method: 'POST', path: '/api/practice-plans/123/access', body: { userId: 'abc' } },
    { method: 'DELETE', path: '/api/practice-plans/123/access', body: { userId: '456' } },
  ];

  protectedEndpoints.forEach((ep) => {
    it(`${ep.method} ${ep.path} returns 401 without token`, async () => {
      const agent = request(app);
      let res;
      switch (ep.method) {
        case 'POST':
          res = await agent.post(ep.path).send(ep.body || {});
          break;
        case 'PATCH':
          res = await agent.patch(ep.path).send(ep.body || {});
          break;
        case 'DELETE':
          res = await agent.delete(ep.path).send(ep.body || {});
          break;
      }
      expect(res.status).toBe(401);
    });
  });

  // GET endpoints now allow unauthenticated access to public items
  it('GET /api/practice-plans/123 returns 400 for invalid ID without token', async () => {
    const res = await request(app).get('/api/practice-plans/123');
    // Invalid ID format returns 400, not 401, since GET is now publicly accessible
    expect(res.status).toBe(400);
  });
});
