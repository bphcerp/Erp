import { useState } from "react";
import { Project } from "./ProjectTable";
import { ProjectFilterState } from "./ProjectFilter";

export function useProjectFilter() {
  const [filterState, setFilterState] = useState<ProjectFilterState>({
    sortOrder: "desc",
    amountFilter: "all",
    statusFilter: "all",
    yearRangeFilter: {
      min: null,
      max: null,
    },
  });

  const filterProjects = (projects: Project[]): Project[] => {
    return projects
      .filter((project) => {
        if (filterState.amountFilter === "all") return true;
        const amount = project.sanctionedAmount || 0;
        if (filterState.amountFilter === "high" && amount >= 1000000) return true;
        if (filterState.amountFilter === "medium" && amount >= 500000 && amount < 1000000) return true;
        if (filterState.amountFilter === "low" && amount < 500000) return true;
        return false;
      })
      .filter((project) => {
        if (filterState.statusFilter === "all") return true;
        
        const today = new Date();
        const startDate = project.startDate ? new Date(project.startDate) : null;
        const endDate = project.endDate ? new Date(project.endDate) : null;
        
        if (filterState.statusFilter === "ongoing") {
          if (!startDate) return false;
          if (startDate > today) return false;
          if (endDate && endDate < today) return false;
          return true;
        }
        
        if (filterState.statusFilter === "completed") {
          if (!endDate) return false;
          return endDate < today;
        }
        
        return true;
      })
      .filter((project) => {
        if (!project.startDate) return true;
        const projectYear = new Date(project.startDate).getFullYear();
        if (filterState.yearRangeFilter.min !== null && projectYear < filterState.yearRangeFilter.min) return false;
        if (filterState.yearRangeFilter.max !== null && projectYear > filterState.yearRangeFilter.max) return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        return filterState.sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  };

  return {
    filterState,
    setFilterState,
    filterProjects,
  };
} 