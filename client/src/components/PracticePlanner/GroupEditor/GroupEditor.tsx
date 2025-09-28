import React from "react";
import { PracticePlanGroup } from "../../../store/practicePlan/practicePlanSlice";

interface GroupEditorProps {
  group: PracticePlanGroup;
  onChangeName?: (name: string) => void;
  children?: React.ReactNode; // items
}

const GroupEditor: React.FC<GroupEditorProps> = ({ group, onChangeName, children }) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: 8, marginTop: 8 }}>
      <input
        aria-label="group-name"
        value={group.name}
        onChange={(e) => onChangeName?.(e.target.value)}
      />
      <div style={{ marginTop: 4 }}>{children}</div>
    </div>
  );
};

export default GroupEditor;
