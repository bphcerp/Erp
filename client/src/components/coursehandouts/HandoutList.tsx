import React from "react";
import HandoutRow from "./HandoutRow";
import HandoutRowWithDetails from "./HandoutRowDetails";

export interface HandoutItem {
  id: number;
  handoutName: string;
  professorName: string;
  status: string;
}

interface HandoutListProps {
  handouts: HandoutItem[];
  search: string;
  selectedStatuses: string[];
  onViewDetails?: (handout: HandoutItem) => void;
}

function HandoutList({
  handouts,
  search,
  selectedStatuses,
  onViewDetails,
}: HandoutListProps) {
  const filteredHandouts = handouts.filter((item) => {
    const matchesSearch =
      item.handoutName.toLowerCase().includes(search.toLowerCase()) ||
      item.professorName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatuses.includes(item.status);
    return matchesSearch && matchesStatus;
  });

  if (filteredHandouts.length === 0) {
    return (
      <div className="border-t border-b border-gray-200 p-4 text-center text-gray-500">
        No handouts found for the current filter/search.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y-2 border-t border-b border-gray-200">
      {filteredHandouts.map((item) =>
        onViewDetails ? (
          <HandoutRowWithDetails
            key={item.id}
            handoutName={item.handoutName}
            professorName={item.professorName}
            status={item.status}
            onViewDetails={() => onViewDetails(item)}
          />
        ) : (
          <HandoutRow
            key={item.id}
            handoutName={item.handoutName}
            professorName={item.professorName}
            status={item.status}
          />
        )
      )}
    </div>
  );
}

export default HandoutList;
