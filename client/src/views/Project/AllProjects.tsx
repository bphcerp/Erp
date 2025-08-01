import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "@/lib/axios-instance";
import { useAuth } from "@/hooks/Auth";
import ProjectTable, { Project } from "../../components/project/ProjectTable";
import ProjectFilter from "../../components/project/ProjectFilter";
import { useProjectFilter } from "../../components/project/useProjectFilter";

export default function AllProjects() {
  const { authState, checkAccess } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { filterState, setFilterState, filterProjects } = useProjectFilter();

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get("/project/list-all")
      .then(res => {
        setProjects(res.data as Project[]);
      })
      .catch(() => setError("Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  const filteredProjects = filterProjects(projects);

  if (!authState) return <Navigate to="/" replace />;
  if (!checkAccess("project:view-all")) return <Navigate to="/404" replace />;

  return (
    <div className="w-full h-screen overflow-y-auto bg-background-faded">
      <div className="flex flex-col items-center gap-6 p-8">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-3xl font-normal">All Projects</h2>
        <ProjectFilter 
          filterState={filterState}
          onFilterChange={setFilterState}
        />
      </div>
      <ProjectTable
        projects={filteredProjects}
        loading={loading}
        error={error}
        onRowClick={project => navigate(`/project/details/${project.id}`)}
      />
      </div>
    </div>
  );
} 