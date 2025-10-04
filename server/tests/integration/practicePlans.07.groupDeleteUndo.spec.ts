// T024 Integration test delete & recreate group (undo simulation)
// We simulate deleting a group by sending a sections array without it, then
// recreate ("undo") by patching again with a deep-copied version (new ids).

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../setup';
import { authHeader, getDefaultSections } from '../utils/auth';

function cloneGroup(group: any) {
  const { _id, id, ...rest } = group;
  return {
    ...rest,
    items: group.items.map((it: any) => {
      const { _id: itemId, id: itemIdVirtual, ...itemRest } = it;
      return itemRest;
    }),
  };
}

describe('Practice Plans Integration 07: group delete & undo', () => {
  it('removes a group then restores equivalent with new ids', async () => {
    const { Authorization } = await authHeader();

    const sections = getDefaultSections();
    const createRes = await request(app)
      .post('/api/practice-plans')
      .set('Authorization', Authorization)
      .send({ name: 'Group Delete Undo Plan', sections });
    expect(createRes.status).toBe(201);
    const planId = createRes.body._id;

    const firstSection = createRes.body.sections[0];
    const g1 = {
      name: 'Group Keep',
      items: [],
    };
    const g2 = {
      name: 'Group Remove',
      items: [
        { kind: 'break', description: 'Pause', duration: 2 },
      ],
    };
    const enrichedFirst = { ...firstSection, groups: [...firstSection.groups, g1, g2] };
    const patch1Sections = [enrichedFirst, ...createRes.body.sections.slice(1)];
    const patch1 = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: patch1Sections });
    expect(patch1.status).toBe(200);
    const updatedFirst = patch1.body.sections[0];
    expect(updatedFirst.groups.length).toBe(enrichedFirst.groups.length);
    
    const storedG2 = updatedFirst.groups.find((g: any) => g.name === 'Group Remove');

    const withoutG2 = {
      ...updatedFirst,
      groups: updatedFirst.groups.filter((g: any) => g._id !== storedG2._id),
    };
    const patch2Sections = [withoutG2, ...patch1.body.sections.slice(1)];
    const patch2 = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: patch2Sections });
    expect(patch2.status).toBe(200);
    const afterDeleteFirst = patch2.body.sections[0];
    expect(afterDeleteFirst.groups.find((g: any) => g._id === storedG2._id)).toBeFalsy();

    const restored = cloneGroup(storedG2);
    const patch3Sections = [
      { ...afterDeleteFirst, groups: [...afterDeleteFirst.groups, restored] },
      ...patch2.body.sections.slice(1),
    ];
    const patch3 = await request(app)
      .patch(`/api/practice-plans/${planId}`)
      .set('Authorization', Authorization)
      .send({ sections: patch3Sections });
    expect(patch3.status).toBe(200);
    const finalFirst = patch3.body.sections[0];
    const restoredFound = finalFirst.groups.find((g: any) => g.name === 'Group Remove');
    expect(restoredFound).toBeTruthy();
    expect(restoredFound._id).not.toBe(storedG2._id);
  });
});
