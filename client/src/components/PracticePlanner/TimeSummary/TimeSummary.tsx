import React from "react";
import { useAppSelector } from "../../../store/hooks/useAppSelector";
import { selectPlanTotals } from "../../../store/practicePlan/practicePlanSlice";

interface TimeSummaryProps {
  highlightExceeded?: boolean;
}

const TimeSummary: React.FC<TimeSummaryProps> = ({ highlightExceeded = true }) => {
  const { totalDuration, sectionDurations } = useAppSelector(selectPlanTotals);
  return (
    <div style={{ padding: 8, background: "#f6f6f6", border: "1px solid #ddd" }}>
      <strong>Total:</strong> {totalDuration} min
      <div style={{ marginTop: 4 }}>
        {Object.entries(sectionDurations).map(([sectionId, dur]) => (
          <div key={sectionId}>
            Section {sectionId.slice(0, 6)}: {dur} min
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeSummary;
