import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../../services/projectService";
import KanbanBoard from "../../modules/projects/KanbanBoard";
import ProjectModal from "../../modules/projects/ProjectModal";
import Button from "../../components/ui/Button/Button";
import Badge from "../../components/ui/Badge/Badge";
import "./ProjectDetail.scss";

const STATUS_COLORS = {
  active: "#34D399",
  on_hold: "#FBBF24",
  completed: "#6C63FF",
  cancelled: "#F87171",
};

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProject(id);
      setProject(data);
      setTasks(data.tasks || []);
    } catch {
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (data, projectId) => {
    const updated = await projectService.updateProject(projectId, data);
    setProject((prev) => ({ ...prev, ...updated }));
  };

  const handleCreateTask = async (data) => {
    const newTask = await projectService.createTask(id, data);
    setTasks((prev) => [...prev, newTask]);
  };

  const handleUpdateTask = async (taskId, data) => {
    const updated = await projectService.updateTask(id, taskId, data);
    setTasks((prev) =>
      prev.map((t) =>
        String(t.id) === String(taskId) ? { ...t, ...updated } : t,
      ),
    );
  };

  const handleDeleteTask = async (taskId) => {
    await projectService.deleteTask(id, taskId);
    setTasks((prev) => prev.filter((t) => String(t.id) !== String(taskId)));
  };

  if (loading) {
    return <div className="project-detail__loading">Loading project...</div>;
  }

  if (!project) return null;

  return (
    <div className="project-detail">
      <button
        className="project-detail__back"
        onClick={() => navigate("/projects")}
      >
        ← Back to Projects
      </button>

      <div className="project-detail__header">
        <div className="project-detail__header-left">
          <div
            className="project-detail__color-dot"
            style={{ background: project.color }}
          />
          <div>
            <div className="project-detail__title-row">
              <h1 className="project-detail__title">{project.title}</h1>
              <Badge
                label={project.status.replace("_", " ")}
                color={STATUS_COLORS[project.status]}
              />
            </div>
            {project.description && (
              <p className="project-detail__description">
                {project.description}
              </p>
            )}
          </div>
        </div>
        <div className="project-detail__header-right">
          <div className="project-detail__stats">
            <div className="project-detail__stat">
              <span className="project-detail__stat-value">
                {project.completion_percentage}%
              </span>
              <span className="project-detail__stat-label">Complete</span>
            </div>
            <div className="project-detail__stat">
              <span className="project-detail__stat-value">{tasks.length}</span>
              <span className="project-detail__stat-label">Tasks</span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Edit Project
          </Button>
        </div>
      </div>

      <div className="project-detail__progress">
        <div className="project-detail__progress-bar">
          <div
            className="project-detail__progress-fill"
            style={{
              width: `${project.completion_percentage}%`,
              background: project.color,
            }}
          />
        </div>
      </div>

      <KanbanBoard
        project={project}
        tasks={tasks}
        onTaskCreate={handleCreateTask}
        onTaskUpdate={handleUpdateTask}
        onTaskDelete={handleDeleteTask}
      />

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProject}
        project={project}
      />
    </div>
  );
}

export default ProjectDetail;
