// T022 Integration test override exercise duration (structural)
// No server totals; ensure durationOverride persists and validation triggers on >1000.

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../setup';
import { authHeader } from '../utils/auth';
import Exercise from '../../models/exercise';

async function createExercise(userId: string, name = 'Shooting Drill') {
  return Exercise.create({ name, persons: 4, time_min: 8, user: userId });
}

describe('Practice Plans Integration 05: override exercise duration', () => {
  it('sets and updates durationOverride on exercise item', async () => {
    const { Authorization, user } = await authHeader();
    const planRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Override Duration Plan' });
    expect(planRes.status).toBe(201);
    const planId = planRes.body._id;
    const sections = planRes.body.sections;

    const exercise = await createExercise(user.id);

    // Add group + exercise item with initial override 15
    const targetSection = sections[0];
    const group = {
      id: new mongoose.Types.ObjectId().toString(),
      name: 'Group 1',
      items: [
        {
          id: new mongoose.Types.ObjectId().toString(),
          kind: 'exercise',
          exerciseId: exercise._id,
          durationOverride: 15,
        },
      ],
    };
    const firstPatchSections = sections.map((s: any) =>
      s.id === targetSection.id ? { ...s, groups: [...s.groups, group] } : s
    );

    const patch1 = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: firstPatchSections });
    expect(patch1.status).toBe(200);
    const updatedSection1 = patch1.body.sections.find((s: any) => s.id === targetSection.id);
    const storedItem1 = updatedSection1.groups[updatedSection1.groups.length - 1].items[0];
    expect(storedItem1.durationOverride).toBe(15);

    // Update override to 25
    const modifiedSections = patch1.body.sections.map((s: any) => {
      if (s.id !== targetSection.id) return s;
      const g = s.groups[s.groups.length - 1];
      const newG = {
        ...g,
        items: g.items.map((it: any) => it.id === storedItem1.id ? { ...it, durationOverride: 25 } : it),
      };
      return { ...s, groups: [...s.groups.slice(0, -1), newG] };
    });

    const patch2 = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: modifiedSections });
    expect(patch2.status).toBe(200);
    const updatedSection2 = patch2.body.sections.find((s: any) => s.id === targetSection.id);
    const storedItem2 = updatedSection2.groups[updatedSection2.groups.length - 1].items[0];
    expect(storedItem2.durationOverride).toBe(25);
  });

  it('rejects override above 1000', async () => {
    const { Authorization, user } = await authHeader();
    const planRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Override Invalid Plan' });
    expect(planRes.status).toBe(201);
    const planId = planRes.body._id;
    const sections = planRes.body.sections;

    const exercise = await createExercise(user.id, 'Invalid Drill');

    const targetSection = sections[0];
    const badGroup = {
      id: new mongoose.Types.ObjectId().toString(),
      name: 'Bad Group',
      items: [
        { id: new mongoose.Types.ObjectId().toString(), kind: 'exercise', exerciseId: exercise._id, durationOverride: 1500 },
      ],
    };
    const patchedSections = sections.map((s: any) => s.id === targetSection.id ? { ...s, groups: [...s.groups, badGroup] } : s);

    const patchRes = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: patchedSections });
    expect(patchRes.status).toBe(400);
    expect(patchRes.body.errors.some((e: string) => e.includes('exceedsMax'))).toBe(true);
  });
});
