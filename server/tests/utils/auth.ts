import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/user';
import { app } from '../setup';

export async function createVerifiedUser(overrides: Partial<{ name: string; email: string; password: string; }> = {}) {
  const name = overrides.name || 'Test User';
  const email = overrides.email || `user_${Date.now()}@example.com`;
  const password = overrides.password || 'P@ssw0rd!';
  const hashedPwd = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPwd,
    isVerified: true,
    active: true,
  });
  return { user, password };
}

export async function getAccessToken(user: any) {
  if (!process.env.ACCESS_TOKEN_SECRET) throw new Error('ACCESS_TOKEN_SECRET missing');
  const token = jwt.sign({
    UserInfo: {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles || ['user']
    }
  }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  return token;
}

export async function authHeader() {
  const { user } = await createVerifiedUser({});
  const token = await getAccessToken(user);
  return { Authorization: `Bearer ${token}`, user };
}

export function getDefaultSections() {
  return [
    { name: 'Warm Up', targetDuration: 0, groups: [{ name: 'All Players', items: [] }] },
    { name: 'Main', targetDuration: 0, groups: [{ name: 'All Players', items: [] }] },
    { name: 'Cooldown', targetDuration: 0, groups: [{ name: 'All Players', items: [] }] },
  ];
}

export async function createPracticePlanWithDefaults(name: string, Authorization?: string) {
  if (!Authorization) {
    const { Authorization: auth } = await authHeader();
    Authorization = auth;
  }
  const sections = getDefaultSections();
  const res = await request(app)
    .post('/api/practice-plans')
    .set('Authorization', Authorization)
    .send({ name, sections });
  return { res, Authorization };
}

export { app };