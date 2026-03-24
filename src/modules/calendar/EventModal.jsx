import React, { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal/Modal";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import Badge from "../../components/ui/Badge/Badge";
import "./EventModal.scss";

const EVENT_TYPES = [
  { value: "meeting", label: "Meeting", color: "#6C63FF" },
  { value: "deadline", label: "Deadline", color: "#F87171" },
  { value: "follow_up", label: "Follow-up", color: "#FBBF24" },
  { value: "task", label: "Task", color: "#34D399" },
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
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const isEditing = !!event?.id;

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

  // const selectedType = EVENT_TYPES.find((t) => t.value === form.event_type);

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
                        backgroundColor: `${type.color}15`,
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
                ></span>
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
