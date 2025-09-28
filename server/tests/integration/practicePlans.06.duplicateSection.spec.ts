// T023 Integration test duplicate section deep copy (client-style via patch)
// No dedicated endpoint; we simulate duplication by copying a section object
// assigning new id and new ids for nested groups/items.

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../setup';
import { authHeader } from '../utils/auth';

function deepDuplicateSection(section: any) {
  return {
    ...section,
    id: new mongoose.Types.ObjectId().toString(),
    groups: section.groups.map((g: any) => ({
      ...g,
      id: new mongoose.Types.ObjectId().toString(),
      items: g.items.map((it: any) => ({ ...it, id: new mongoose.Types.ObjectId().toString() })),
    })),
  };
}

describe('Practice Plans Integration 06: duplicate section', () => {
  it('duplicates a section with new identifiers for nested entities', async () => {
    const { Authorization } = await authHeader();
    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Duplicate Section Plan' });
    expect(createRes.status).toBe(201);
    const planId = createRes.body._id;

    // Add a group + item to first section so duplication has nested structure
    const firstSection = createRes.body.sections[0];
    const enrichedFirst = {
      ...firstSection,
      groups: [
        ...firstSection.groups,
        {
          id: new mongoose.Types.ObjectId().toString(),
          name: 'Group X',
          items: [
            {
              id: new mongoose.Types.ObjectId().toString(),
              kind: 'break',
              name: 'Short Break',
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

    // Duplicate the enriched first section and append
    const duplicated = deepDuplicateSection(updatedFirst);
    const secondPatchSections = [...patch1.body.sections, duplicated];

    const patch2 = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: secondPatchSections });
    expect(patch2.status).toBe(200);
    expect(patch2.body.sections.length).toBe(patch1.body.sections.length + 1);

    const last = patch2.body.sections[patch2.body.sections.length - 1];
    // Ensure IDs differ
    expect(last.id).not.toBe(updatedFirst.id);
    // Ensure nested group IDs differ from source
    const sourceGroupIds = updatedFirst.groups.map((g: any) => g.id).sort();
    const dupGroupIds = last.groups.map((g: any) => g.id).sort();
    expect(sourceGroupIds.some((id: string, idx: number) => id === dupGroupIds[idx])).toBe(false);
    // Ensure break item duplicated with new id but same properties
    const sourceBreak = updatedFirst.groups[updatedFirst.groups.length - 1].items[0];
    const dupBreak = last.groups[last.groups.length - 1].items[0];
    expect(sourceBreak.id).not.toBe(dupBreak.id);
    expect(dupBreak.kind).toBe('break');
    expect(dupBreak.duration).toBe(3);
  });
});
