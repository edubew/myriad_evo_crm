import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../modules/projects/useProjects";
import ProjectModal from "../../modules/projects/ProjectModal";
import Button from "../../components/ui/Button/Button";
import Badge from "../../components/ui/Badge/Badge";
import EmptyState from "../../components/ui/EmptyState/EmptyState";
import "./Projects.scss";

const STATUS_COLORS = {
  active: "#34D399",
  on_hold: "#FBBF24",
  completed: "#6C63FF",
  cancelled: "#F87171",
};

function Projects() {
  const navigate = useNavigate();
  const { projects, loading, fetchProjects, createProject, updateProject } =
    useProjects();

  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSave = async (data, id) => {
    if (id) {
      await updateProject(id, data);
    } else {
      await createProject(data);
    }
  };

  return (
    <div className="projects-page">
      <div className="projects-page__header">
        <div>
          <h1 className="projects-page__title">Projects</h1>
          <p className="projects-page__subtitle">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditProject(null);
            setModalOpen(true);
          }}
        >
          + New Project
        </Button>
      </div>

      {loading ? (
        <div className="projects-page__loading">Loading projects...</div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="◈"
          title="No projects yet"
          description="Create your first project to start tracking work."
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              + New Project
            </Button>
          }
        />
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              {/* Color bar */}
              <div
                className="project-card__bar"
                style={{ background: project.color }}
              />

              <div className="project-card__body">
                <div className="project-card__header">
                  <h3 className="project-card__title">{project.title}</h3>
                  <Badge
                    label={project.status.replace("_", " ")}
                    color={STATUS_COLORS[project.status]}
                  />
                </div>

                {project.description && (
                  <p className="project-card__description">
                    {project.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="project-card__progress">
                  <div className="project-card__progress-bar">
                    <div
                      className="project-card__progress-fill"
                      style={{
                        width: `${project.completion_percentage}%`,
                        background: project.color,
                      }}
                    />
                  </div>
                  <span className="project-card__progress-label">
                    {project.completion_percentage}%
                  </span>
                </div>

                {/* Task counts */}
                <div className="project-card__counts">
                  {Object.entries(project.task_counts || {}).map(
                    ([status, count]) => (
                      <span key={status} className="project-card__count">
                        {count} {status.replace("_", " ")}
                      </span>
                    ),
                  )}
                </div>

                <div className="project-card__footer">
                  {project.end_date && (
                    <span className="project-card__date">
                      Due{" "}
                      {new Date(project.end_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  <button
                    className="project-card__edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditProject(project);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditProject(null);
        }}
        onSave={handleSave}
        project={editProject}
      />
    </div>
  );
}

export default Projects;
