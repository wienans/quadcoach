import React from "react";
import {
  PracticePlanItem,
  PracticePlanItemBreak,
  PracticePlanItemExercise,
} from "../../../store/practicePlan/practicePlanSlice";

interface ItemListProps {
  items: PracticePlanItem[];
  onUpdateItem?: (id: string, changes: Partial<PracticePlanItem>) => void;
  onDeleteItem?: (id: string) => void;
}

const ItemList: React.FC<ItemListProps> = ({ items, onUpdateItem, onDeleteItem }) => {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((it) => {
        if (it.kind === "break") {
          const b = it as PracticePlanItemBreak;
          return (
            <li key={it._id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span>Break</span>
              <input
                value={b.description}
                onChange={(e) => onUpdateItem?.(b._id, { description: e.target.value })}
              />
              <input
                type="number"
                value={b.duration}
                onChange={(e) =>
                  onUpdateItem?.(b._id, { duration: Number(e.target.value) || 0 })
                }
                style={{ width: 60 }}
              />
              <button onClick={() => onDeleteItem?.(b._id)}>X</button>
            </li>
          );
        }
        const ex = it as PracticePlanItemExercise;
        return (
          <li key={it._id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span>Exercise</span>
            <code>{ex.exerciseId}</code>
            <input
              type="number"
              value={ex.duration || 0}
              onChange={(e) =>
                onUpdateItem?.(ex._id, {
                  duration: Number(e.target.value) || 0,
                })
              }
              style={{ width: 60 }}
            />
            <button onClick={() => onDeleteItem?.(ex._id)}>X</button>
          </li>
        );
      })}
    </ul>
  );
};

export default ItemList;
