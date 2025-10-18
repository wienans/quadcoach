// T023 Integration test duplicate section deep copy (client-style via patch)
// No dedicated endpoint; we simulate duplication by copying a section object
// assigning new id and new ids for nested groups/items.

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../setup';
import { authHeader, getDefaultSections } from '../utils/auth';

function deepDuplicateSection(section: any) {
  return {
    ...section,
    _id: new mongoose.Types.ObjectId().toString(),
    groups: section.groups.map((g: any) => ({
      ...g,
      _id: new mongoose.Types.ObjectId().toString(),
      items: g.items.map((it: any) => ({ ...it, _id: new mongoose.Types.ObjectId().toString() })),
    })),
  };
}

describe('Practice Plans Integration 06: duplicate section', () => {
  it('duplicates a section with new identifiers for nested entities', async () => {
    const { Authorization } = await authHeader();
    const sections = getDefaultSections();
    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Duplicate Section Plan', sections });
    expect(createRes.status).toBe(201);
    const planId = createRes.body._id;

    const firstSection = createRes.body.sections[0];
    const enrichedFirst = {
      ...firstSection,
      groups: [
        ...firstSection.groups,
        {
          _id: new mongoose.Types.ObjectId().toString(),
          name: 'Group X',
          items: [
            {
              _id: new mongoose.Types.ObjectId().toString(),
              kind: 'break',
              description: 'Short Break',
              duration: 3,
            },
          ],
        },
      ],
    };

    const enrichedSections = [enrichedFirst, ...createRes.body.sections.slice(1)];
    const patch1 = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: enrichedSections });
    expect(patch1.status).toBe(200);

    const updatedFirst = patch1.body.sections[0];
    expect(updatedFirst.groups.length).toBe(enrichedFirst.groups.length);

    const duplicated = deepDuplicateSection(updatedFirst);
    const secondPatchSections = [...patch1.body.sections, duplicated];

    const patch2 = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: secondPatchSections });
    expect(patch2.status).toBe(200);
    expect(patch2.body.sections.length).toBe(patch1.body.sections.length + 1);

    const last = patch2.body.sections[patch2.body.sections.length - 1];
    expect(last._id).not.toBe(updatedFirst._id);
    const sourceGroupIds = updatedFirst.groups.map((g: any) => g._id).sort();
    const dupGroupIds = last.groups.map((g: any) => g._id).sort();
    expect(sourceGroupIds.some((id: string, idx: number) => id === dupGroupIds[idx])).toBe(false);
    const sourceBreak = updatedFirst.groups[updatedFirst.groups.length - 1].items[0];
    const dupBreak = last.groups[last.groups.length - 1].items[0];
    expect(sourceBreak._id).not.toBe(dupBreak._id);
    expect(dupBreak.kind).toBe('break');
    expect(dupBreak.duration).toBe(3);
  });
});
