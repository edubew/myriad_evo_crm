import { useState, useEffect } from "react";
import Modal from "../../components/ui/Modal/Modal";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import "./ProjectModal.scss";

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const COLORS = [
  "#6C63FF",
  "#F87171",
  "#34D399",
  "#FBBF24",
  "#60A5FA",
  "#F472B6",
  "#A78BFA",
  "#FB923C",
];

const defaultForm = {
  title: "",
  description: "",
  status: "active",
  color: "#6C63FF",
  start_date: "",
  end_date: "",
};

function ProjectModal({ isOpen, onClose, onSave, project }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const isEditing = !!project?.id;

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || "",
        description: project.description || "",
        status: project.status || "active",
        color: project.color || "#6C63FF",
        start_date: project.start_date || "",
        end_date: project.end_date || "",
      });
    } else {
      setForm(defaultForm);
    }
    setErrors([]);
  }, [project, isOpen]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setErrors([]);
    setLoading(true);
    try {
      await onSave(form, project?.id);
      onClose();
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Something went wrong"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Project" : "New Project"}
      size="lg"
    >
      <div className="project-modal">
        {errors.length > 0 && (
          <div className="project-modal__errors">
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}

        <Input
          label="Project Title"
          name="title"
          placeholder="Website Redesign"
          value={form.title}
          onChange={handleChange}
        />

        <div className="project-modal__field">
          <label className="project-modal__label">Description</label>
          <textarea
            className="project-modal__textarea"
            name="description"
            placeholder="What is this project about?"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="project-modal__field">
          <label className="project-modal__label">Color</label>
          <div className="project-modal__colors">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`project-modal__color-swatch ${
                  form.color === color
                    ? "project-modal__color-swatch--active"
                    : ""
                }`}
                style={{ background: color }}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    color,
                  }))
                }
              />
            ))}
          </div>
        </div>

        <div className="project-modal__row">
          <div className="project-modal__field">
            <label className="project-modal__label">Status</label>
            <select
              className="project-modal__select"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="project-modal__row">
          <div className="project-modal__field">
            <label className="project-modal__label">Start Date</label>
            <input
              className="project-modal__date"
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
            />
          </div>
          <div className="project-modal__field">
            <label className="project-modal__label">End Date</label>
            <input
              className="project-modal__date"
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="project-modal__actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {isEditing ? "Save changes" : "Create project"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ProjectModal;
