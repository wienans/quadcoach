// T021 Integration test add groups/items/break & totals structural validation
// Currently server does not compute or store aggregate totals, so this test
// focuses on successfully appending groups/items with valid durations and
// ensuring validation rejects out-of-bounds durations.

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../setup';
import { authHeader } from '../utils/auth';
import Exercise from '../../models/exercise';

// Helper to create an exercise to reference in exercise items
async function createExercise(userId: string) {
  const ex = await Exercise.create({
    name: 'Layup Drill',
    persons: 6, // required field in schema
    time_min: 10,
    user: userId,
  });
  return ex;
}

describe('Practice Plans Integration 04: groups/items totals structural', () => {
  it('adds a new group with break and exercise items', async () => {
    const { Authorization, user } = await authHeader();

    // Create base plan
    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Groups & Items Plan' });
    expect(createRes.status).toBe(201);
    const planId = createRes.body._id;
    const sections = createRes.body.sections;
    expect(sections.length).toBe(3);

    const targetSection = sections[1]; // Use the 'Main' section by index

    // Create exercise to reference
    const exercise = await createExercise(user.id);

    const newGroup = {
      id: new mongoose.Types.ObjectId().toString(),
      name: 'Group A',
      items: [
        {
          id: new mongoose.Types.ObjectId().toString(),
          kind: 'break',
            name: 'Water Break',
            duration: 5,
        },
        {
          id: new mongoose.Types.ObjectId().toString(),
          kind: 'exercise',
          exerciseId: exercise._id,
          durationOverride: 12,
        },
      ],
    };

    const patchedSections = sections.map((s: any) =>
      s.id === targetSection.id
        ? { ...s, groups: [...s.groups, newGroup] }
        : s
    );

    const patchRes = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: patchedSections });

    expect(patchRes.status).toBe(200);
    const updated = patchRes.body;
    const updatedSection = updated.sections.find((s: any) => s.id === targetSection.id);
    expect(updatedSection).toBeTruthy();
    expect(updatedSection.groups.length).toBe(targetSection.groups.length + 1);
    const appended = updatedSection.groups[updatedSection.groups.length - 1];
    expect(appended.name).toBe('Group A');
    expect(appended.items.length).toBe(2);
    const breakItem = appended.items.find((i: any) => i.kind === 'break');
    const exItem = appended.items.find((i: any) => i.kind === 'exercise');
    expect(breakItem).toBeTruthy();
    expect(breakItem.duration).toBe(5);
    expect(exItem).toBeTruthy();
    expect(exItem.exerciseId).toBe(exercise._id.toString());
    expect(exItem.durationOverride).toBe(12);
  });

  it('rejects out-of-bounds break duration ( > 1000 )', async () => {
    const { Authorization, user } = await authHeader();
    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Groups & Items Plan Max Fail' });
    expect(createRes.status).toBe(201);
    const planId = createRes.body._id;
    const sections = createRes.body.sections;

    const exercise = await createExercise(user.id);

    const targetSection = sections[0];
    const invalidGroup = {
      id: new mongoose.Types.ObjectId().toString(),
      name: 'Invalid Group',
      items: [
        {
          id: new mongoose.Types.ObjectId().toString(),
          kind: 'break',
          name: 'Too Long',
          duration: 1005,
        },
        {
          id: new mongoose.Types.ObjectId().toString(),
          kind: 'exercise',
          exerciseId: exercise._id,
          durationOverride: 15,
        },
      ],
    };

    const patchedSections = sections.map((s: any) =>
      s.id === targetSection.id ? { ...s, groups: [...s.groups, invalidGroup] } : s
    );

    const patchRes = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: patchedSections });

    expect(patchRes.status).toBe(400);
    expect(patchRes.body).toHaveProperty('errors');
    expect(patchRes.body.errors.some((e: string) => e.includes('exceedsMax'))).toBe(true);
  });
});
