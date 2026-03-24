import { useState, useCallback } from "react";
import { projectService } from "../../services/projectService";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects(params);
      setProjects(data);
    } catch {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (data) => {
    const newProject = await projectService.createProject(data);
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = async (id, data) => {
    const updated = await projectService.updateProject(id, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProject = async (id) => {
    await projectService.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
