/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import Modal from "../../components/ui/Modal/Modal";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import Avatar from "../../components/ui/Avatar/Avatar";
import { companyService } from "../../services/companyService";
import "./TaskModal.scss";

const PRIORITIES = [
  { value: "low", label: "Low", color: "#4A8C6A" },
  { value: "medium", label: "Medium", color: "#7A8A96" },
  { value: "high", label: "High", color: "#A87830" },
  { value: "urgent", label: "Urgent", color: "#B34A30" },
];

const STATUSES = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
];

const defaultForm = {
  title: "",
  description: "",
  status: "backlog",
  priority: "medium",
  due_date: "",
  assignee_id: "",
};

function TaskModal({ isOpen, onClose, onSave, onDelete, task, defaultStatus }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  const isEditing = !!task?.id;

  useEffect(() => {
    loadTeam();
  }, []);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "backlog",
        priority: task.priority || "medium",
        due_date: task.due_date || "",
        assignee_id: task.assignee_id || "",
      });
    } else {
      setForm({
        ...defaultForm,
        status: defaultStatus || "backlog",
      });
    }
    setErrors([]);
  }, [task, isOpen, defaultStatus]);

  const loadTeam = async () => {
    try {
      const members = await companyService.getTeam();
      setTeamMembers(members);
    } catch { /* empty */ }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setErrors([]);
    setLoading(true);
    try {
      await onSave(form, task?.id);
      onClose();
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Something went wrong"]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    setLoading(true);
    try {
      await onDelete(task.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const selectedAssignee = teamMembers.find(
    (m) => String(m.id) === String(form.assignee_id),
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Task" : "New Task"}
    >
      <div className="task-modal">
        {errors.length > 0 && (
          <div className="task-modal__errors">
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}

        <Input
          label="Task Title"
          name="title"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={handleChange}
        />

        <div className="task-modal__field">
          <label className="task-modal__label">Description</label>
          <textarea
            className="task-modal__textarea"
            name="description"
            placeholder="Add more details..."
            value={form.description}
            onChange={handleChange}
            rows={2}
          />
        </div>

        <div className="task-modal__field">
          <label className="task-modal__label">Priority</label>
          <div className="task-modal__priority-grid">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                className={`task-modal__priority-btn ${
                  form.priority === p.value
                    ? "task-modal__priority-btn--active"
                    : ""
                }`}
                style={
                  form.priority === p.value
                    ? {
                        borderColor: p.color,
                        backgroundColor: `${p.color}15`,
                        color: p.color,
                      }
                    : {}
                }
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    priority: p.value,
                  }))
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="task-modal__row">
          <div className="task-modal__field">
            <label className="task-modal__label">Status</label>
            <select
              className="task-modal__select"
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
          <div className="task-modal__field">
            <label className="task-modal__label">Due Date</label>
            <input
              className="task-modal__date"
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="task-modal__field">
          <label className="task-modal__label">Assignee</label>
          {teamMembers.length === 0 ? (
            <p className="task-modal__no-team">
              Add team members in the Company → Team section to assign tasks.
            </p>
          ) : (
            <div className="task-modal__assignees">
              <button
                type="button"
                className={`task-modal__assignee-btn ${
                  !form.assignee_id ? "task-modal__assignee-btn--active" : ""
                }`}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    assignee_id: "",
                  }))
                }
              >
                <div className="task-modal__assignee-none">—</div>
                <span>Unassigned</span>
              </button>

              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  className={`task-modal__assignee-btn ${
                    String(form.assignee_id) === String(member.id)
                      ? "task-modal__assignee-btn--active"
                      : ""
                  }`}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      assignee_id: member.id,
                    }))
                  }
                >
                  <Avatar
                    src={member.avatar}
                    name={member.full_name}
                    size="xs"
                  />
                  <span>{member.first_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="task-modal__actions">
          {isEditing && (
            <Button variant="danger" onClick={handleDelete} loading={loading}>
              Delete
            </Button>
          )}
          <div className="task-modal__actions-right">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
              {isEditing ? "Save changes" : "Create task"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default TaskModal;
