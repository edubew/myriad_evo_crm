import { useState, useEffect } from "react";
import Modal from "../../components/ui/Modal/Modal";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import "./ClientModal.scss";

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "prospect", label: "Prospect" },
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Consulting",
  "Media",
  "Other",
];

const defaultForm = {
  company_name: "",
  industry: "",
  website: "",
  email: "",
  phone: "",
  status: "active",
  notes: "",
};

function ClientModal({ isOpen, onClose, onSave, client }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const isEditing = !!client?.id;

  useEffect(() => {
    if (client) {
      setForm({
        company_name: client.company_name || "",
        industry: client.industry || "",
        website: client.website || "",
        email: client.email || "",
        phone: client.phone || "",
        status: client.status || "active",
        notes: client.notes || "",
      });
    } else {
      setForm(defaultForm);
    }
    setErrors([]);
  }, [client, isOpen]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setErrors([]);
    setLoading(true);
    try {
      await onSave(form, client?.id);
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
      title={isEditing ? "Edit Client" : "New Client"}
      size="lg"
    >
      <div className="client-modal">
        {errors.length > 0 && (
          <div className="client-modal__errors">
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}

        <div className="client-modal__row">
          <Input
            label="Company Name"
            name="company_name"
            placeholder="Acme Corporation"
            value={form.company_name}
            onChange={handleChange}
          />
          <div className="client-modal__field">
            <label className="client-modal__label">Industry</label>
            <select
              className="client-modal__select"
              name="industry"
              value={form.industry}
              onChange={handleChange}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="client-modal__row">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="contact@company.com"
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

        <div className="client-modal__row">
          <Input
            label="Website"
            name="website"
            placeholder="https://company.com"
            value={form.website}
            onChange={handleChange}
          />
          <div className="client-modal__field">
            <label className="client-modal__label">Status</label>
            <select
              className="client-modal__select"
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

        <div className="client-modal__field">
          <label className="client-modal__label">Notes</label>
          <textarea
            className="client-modal__textarea"
            name="notes"
            placeholder="Any notes about this client..."
            value={form.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="client-modal__actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {isEditing ? "Save changes" : "Create client"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ClientModal;
