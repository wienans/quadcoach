import React from "react";
import { PracticePlanSection } from "../../../store/practicePlan/practicePlanSlice";

interface SectionEditorProps {
  section: PracticePlanSection;
  onChangeName?: (name: string) => void;
  onChangeTarget?: (minutes: number) => void;
  children?: React.ReactNode; // groups
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onChangeName,
  onChangeTarget,
  children,
}) => {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          aria-label="section-name"
          value={section.name}
          onChange={(e) => onChangeName?.(e.target.value)}
        />
        <input
          aria-label="section-target"
            type="number"
          value={section.targetDuration}
          onChange={(e) => onChangeTarget?.(Number(e.target.value) || 0)}
          style={{ width: 70 }}
        />
        <span>min target</span>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default SectionEditor;
