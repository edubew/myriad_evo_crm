import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/ui/Modal/Modal";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import "./EventModal.scss";

const EVENT_TYPES = [
  { value: "meeting", label: "Meeting", color: "#8B2A2A" },
  { value: "deadline", label: "Deadline", color: "#B34A30" },
  { value: "follow_up", label: "Follow-up", color: "#A87830" },
  { value: "task", label: "Task", color: "#4A8C6A" },
];

const defaultForm = {
  title: "",
  description: "",
  start_time: "",
  end_time: "",
  all_day: false,
  location: "",
  event_type: "meeting",
};

function EventModal({ isOpen, onClose, onSave, onDelete, event }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const isEditing = !!event?.id;
  const isProjectLink = event?.source === "project";

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        description: event.description || "",
        start_time: event.start
          ? new Date(event.start).toISOString().slice(0, 16)
          : "",
        end_time: event.end
          ? new Date(event.end).toISOString().slice(0, 16)
          : "",
        all_day: event.allDay || false,
        location: event.location || "",
        event_type: event.event_type || "meeting",
      });
    } else {
      setForm(defaultForm);
    }
    setErrors([]);
  }, [event, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setErrors([]);
    setLoading(true);
    try {
      await onSave(form, event?.id);
      onClose();
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Something went wrong"]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this event?")) return;
    setLoading(true);
    try {
      await onDelete(event.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Project deadline — read only view
  if (isProjectLink) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Project Deadline">
        <div className="event-modal">
          <div className="event-modal__project-link">
            <div className="event-modal__project-link-icon">◈</div>
            <div className="event-modal__project-link-info">
              <p className="event-modal__project-link-title">{event.title}</p>
              <p className="event-modal__project-link-note">
                This deadline is managed by a project. Edit or remove it from
                the project page.
              </p>
            </div>
          </div>
          <div className="event-modal__actions">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                navigate(`/projects/${event.source_id}`);
              }}
            >
              Go to Project
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Event" : "New Event"}
    >
      <div className="event-modal">
        {errors.length > 0 && (
          <div className="event-modal__errors">
            {errors.map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}

        <div className="event-modal__field">
          <label className="event-modal__label">Event Type</label>
          <div className="event-modal__type-grid">
            {EVENT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`event-modal__type-btn ${
                  form.event_type === type.value
                    ? "event-modal__type-btn--active"
                    : ""
                }`}
                style={
                  form.event_type === type.value
                    ? {
                        borderColor: type.color,
                        backgroundColor: `${type.color}18`,
                      }
                    : {}
                }
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    event_type: type.value,
                  }))
                }
              >
                <span
                  className="event-modal__type-dot"
                  style={{ background: type.color }}
                />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Title"
          name="title"
          placeholder="Event title"
          value={form.title}
          onChange={handleChange}
        />

        <div className="event-modal__field">
          <label className="event-modal__checkbox">
            <input
              type="checkbox"
              name="all_day"
              checked={form.all_day}
              onChange={handleChange}
            />
            <span>All day event</span>
          </label>
        </div>

        <div className="event-modal__row">
          <div className="event-modal__field">
            <label className="event-modal__label">
              {form.all_day ? "Start Date" : "Start"}
            </label>
            <input
              className="event-modal__datetime"
              type={form.all_day ? "date" : "datetime-local"}
              name="start_time"
              value={
                form.all_day ? form.start_time?.slice(0, 10) : form.start_time
              }
              onChange={handleChange}
            />
          </div>
          <div className="event-modal__field">
            <label className="event-modal__label">
              {form.all_day ? "End Date" : "End"}
            </label>
            <input
              className="event-modal__datetime"
              type={form.all_day ? "date" : "datetime-local"}
              name="end_time"
              value={form.all_day ? form.end_time?.slice(0, 10) : form.end_time}
              onChange={handleChange}
            />
          </div>
        </div>

        <Input
          label="Location or link"
          name="location"
          placeholder="Office, Zoom link, etc."
          value={form.location}
          onChange={handleChange}
        />

        <div className="event-modal__field">
          <label className="event-modal__label">Notes</label>
          <textarea
            className="event-modal__textarea"
            name="description"
            placeholder="Add notes or agenda..."
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="event-modal__actions">
          {isEditing && (
            <Button variant="danger" onClick={handleDelete} loading={loading}>
              Delete
            </Button>
          )}
          <div className="event-modal__actions-right">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
              {isEditing ? "Save changes" : "Create event"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default EventModal;
