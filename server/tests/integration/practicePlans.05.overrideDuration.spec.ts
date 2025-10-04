// T022 Integration test override exercise duration (structural)
// No server totals; ensure duration persists and validation triggers on >1000.

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../setup';
import { authHeader, getDefaultSections } from '../utils/auth';
import Exercise from '../../models/exercise';

async function createExercise(userId: string, name = 'Shooting Drill') {
  return Exercise.create({ name, persons: 4, time_min: 8, user: userId });
}

describe('Practice Plans Integration 05: override exercise duration', () => {
  it('sets and updates durationOverride on exercise item', async () => {
    const { Authorization, user } = await authHeader();
    const sections = getDefaultSections();
    const planRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Override Duration Plan', sections });
    expect(planRes.status).toBe(201);
    const planId = planRes.body._id;
    const returnedSections = planRes.body.sections;

    const exercise = await createExercise(user.id);

    const targetSection = returnedSections[0];
    const group = {
      name: 'Group 1',
      items: [
        {
          kind: 'exercise',
          exerciseId: exercise._id,
          duration: 15,
        },
      ],
    };
    const firstPatchSections = returnedSections.map((s: any) =>
      s._id === targetSection._id ? { ...s, groups: [...s.groups, group] } : s
    );

    const patch1 = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: firstPatchSections });
    expect(patch1.status).toBe(200);
    const updatedSection1 = patch1.body.sections.find((s: any) => s._id === targetSection._id);
    const storedItem1 = updatedSection1.groups[updatedSection1.groups.length - 1].items[0];
    expect(storedItem1.duration).toBe(15);

    const modifiedSections = patch1.body.sections.map((s: any) => {
      if (s._id !== targetSection._id) return s;
      const g = s.groups[s.groups.length - 1];
      const newG = {
        ...g,
        items: g.items.map((it: any) => it._id === storedItem1._id ? { ...it, duration: 25 } : it),
      };
      return { ...s, groups: [...s.groups.slice(0, -1), newG] };
    });

    const patch2 = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: modifiedSections });
    expect(patch2.status).toBe(200);
    const updatedSection2 = patch2.body.sections.find((s: any) => s._id === targetSection._id);
    const storedItem2 = updatedSection2.groups[updatedSection2.groups.length - 1].items[0];
    expect(storedItem2.duration).toBe(25);
  });

  it('rejects override above 1000', async () => {
    const { Authorization, user } = await authHeader();
    const sections = getDefaultSections();
    const planRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Override Invalid Plan', sections });
    expect(planRes.status).toBe(201);
    const planId = planRes.body._id;
    const returnedSections = planRes.body.sections;

    const exercise = await createExercise(user.id, 'Invalid Drill');

    const targetSection = returnedSections[0];
    const badGroup = {
      name: 'Bad Group',
      items: [
        { kind: 'exercise', exerciseId: exercise._id, duration: 1500 },
      ],
    };
    const patchedSections = returnedSections.map((s: any) => s._id === targetSection._id ? { ...s, groups: [...s.groups, badGroup] } : s);

    const patchRes = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: patchedSections });
    expect(patchRes.status).toBe(400);
    expect(patchRes.body.errors.some((e: string) => e.includes('exceedsMax'))).toBe(true);
  });
});
