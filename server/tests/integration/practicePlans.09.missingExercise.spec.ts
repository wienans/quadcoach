// T026 Integration test missing exercise reference (stored as-is)
// Currently server does not resolve or validate exercise existence on patch.
// We ensure it accepts an arbitrary ObjectId as exerciseId.

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../setup';
import { authHeader, getDefaultSections } from '../utils/auth';

describe('Practice Plans Integration 09: missing exercise placeholder', () => {
  it('stores unknown exerciseId without rejection', async () => {
    const { Authorization } = await authHeader();
    const sections = getDefaultSections();
    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Missing Exercise Plan', sections });
    expect(createRes.status).toBe(201);
    const planId = createRes.body._id;
    const firstSection = createRes.body.sections[0];

    const fakeExerciseId = new mongoose.Types.ObjectId().toString();
    const newGroup = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'Group Missing',
      items: [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          kind: 'exercise',
          exerciseId: fakeExerciseId,
          duration: 7,
        },
      ],
    };

    const patchedSections = [
      { ...firstSection, groups: [...firstSection.groups, newGroup] },
      ...createRes.body.sections.slice(1),
    ];

    const patchRes = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: patchedSections });
    expect(patchRes.status).toBe(200);
    const updatedFirst = patchRes.body.sections[0];
    const storedGroup = updatedFirst.groups.find((g: any) => g.name === 'Group Missing');
    expect(storedGroup).toBeTruthy();
    const exItem = storedGroup.items[0];
    expect(exItem.exerciseId).toBe(fakeExerciseId);
  });
});
