import { useState, useEffect } from "react";
import Modal from "../../components/ui/Modal/Modal";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import "./LeadModal.scss";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "disqualified", label: "Disqualified" },
];

const SOURCES = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social Media" },
  { value: "cold_outreach", label: "Cold Outreach" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
];

const defaultForm = {
  company_name: "",
  contact_name: "",
  email: "",
  phone: "",
  source: "other",
  status: "new",
  notes: "",
};

function LeadModal({ isOpen, onClose, onSave, onDelete, lead }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const isEditing = !!lead?.id;

  useEffect(() => {
    if (lead) {
      setForm({
        company_name: lead.company_name || "",
        contact_name: lead.contact_name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        source: lead.source || "other",
        status: lead.status || "new",
        notes: lead.notes || "",
      });
    } else {
      setForm(defaultForm);
    }
    setErrors([]);
  }, [lead, isOpen]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setErrors([]);
    setLoading(true);
    try {
      await onSave(form, lead?.id);
      onClose();
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Something went wrong"]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this lead?")) return;
    setLoading(true);
    try {
      await onDelete(lead.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Lead" : "New Lead"}
      size="lg"
    >
      <div className="lead-modal">
        {errors.length > 0 && (
          <div className="lead-modal__errors">
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}

        <div className="lead-modal__row">
          <Input
            label="Company Name"
            name="company_name"
            placeholder="Acme Corporation"
            value={form.company_name}
            onChange={handleChange}
          />
          <Input
            label="Contact Name"
            name="contact_name"
            placeholder="Jane Smith"
            value={form.contact_name}
            onChange={handleChange}
          />
        </div>

        <div className="lead-modal__row">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="jane@acme.com"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            label="Phone"
            name="phone"
            placeholder="+254 700 000 000"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="lead-modal__row">
          <div className="lead-modal__field">
            <label className="lead-modal__label">Source</label>
            <select
              className="lead-modal__select"
              name="source"
              value={form.source}
              onChange={handleChange}
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="lead-modal__field">
            <label className="lead-modal__label">Status</label>
            <select
              className="lead-modal__select"
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

        <div className="lead-modal__field">
          <label className="lead-modal__label">Notes</label>
          <textarea
            className="lead-modal__textarea"
            name="notes"
            placeholder="Key details about this lead..."
            value={form.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="lead-modal__actions">
          {isEditing && (
            <Button variant="danger" onClick={handleDelete} loading={loading}>
              Delete
            </Button>
          )}
          <div className="lead-modal__actions-right">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
              {isEditing ? "Save changes" : "Add lead"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default LeadModal;
