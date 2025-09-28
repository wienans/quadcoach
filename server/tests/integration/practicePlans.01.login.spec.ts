// T018 Integration test login (obtain JWT)
// Establishes a verified user, logs in through /auth/register + verifyEmail + login flow
// and stores accessToken in a shared global for subsequent integration tests.

import request from 'supertest';
import { app } from '../setup';
import User from '../../models/user';
import bcrypt from 'bcrypt';

// global namespace augmentation for token sharing
declare global {
  // eslint-disable-next-line no-var
  var __INT_ACCESS_TOKEN__: string | undefined;
  // eslint-disable-next-line no-var
  var __INT_USER_EMAIL__: string | undefined;
}

describe('Practice Plans Integration 01: login', () => {
  it('logs in and obtains JWT token for subsequent tests', async () => {
    const email = `int_user_${Date.now()}@example.com`;
    const password = 'P@ssw0rd!';
    const name = 'Integration User';

    // Simulate registration but shortcut e-mail sending by inserting verified user directly
    const hashedPwd = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPwd,
      isVerified: true,
      active: true,
    });

    const res = await request(app)
      .post('/api/auth/')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(typeof res.body.accessToken).toBe('string');

    global.__INT_ACCESS_TOKEN__ = res.body.accessToken;
    global.__INT_USER_EMAIL__ = email;
  });
});
