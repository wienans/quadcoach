// T017 Unauthorized access tests hitting each endpoint without JWT
import request from 'supertest';
import { app } from '../setup';

describe('Practice Plans unauthorized access', () => {
  const endpoints: Array<{ method: 'POST' | 'GET' | 'PATCH' | 'DELETE'; path: string; body?: any }> = [
    { method: 'POST', path: '/api/practice-plans', body: { name: 'x' } },
    { method: 'GET', path: '/api/practice-plans/123' },
    { method: 'PATCH', path: '/api/practice-plans/123', body: { name: 'y' } },
    { method: 'DELETE', path: '/api/practice-plans/123' },
    { method: 'POST', path: '/api/practice-plans/123/access', body: { userId: 'abc' } },
    { method: 'DELETE', path: '/api/practice-plans/123/access/456' },
  ];

  endpoints.forEach((ep) => {
    it(`${ep.method} ${ep.path} returns 401 without token`, async () => {
      const agent = request(app);
      let res;
      switch (ep.method) {
        case 'POST':
          res = await agent.post(ep.path).send(ep.body || {});
          break;
        case 'GET':
          res = await agent.get(ep.path);
          break;
        case 'PATCH':
          res = await agent.patch(ep.path).send(ep.body || {});
          break;
        case 'DELETE':
          res = await agent.delete(ep.path);
          break;
      }
      expect(res.status).toBe(401);
    });
  });
});
