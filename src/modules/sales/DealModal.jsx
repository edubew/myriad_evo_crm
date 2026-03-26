import { useState, useEffect } from "react";
import Modal from "../../components/ui/Modal/Modal";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import "./DealModal.scss";

const STAGES = [
  { value: "lead", label: "Lead" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
];

const defaultForm = {
  title: "",
  value: "",
  probability: 50,
  expected_close: "",
  status: "lead",
  notes: "",
};

function DealModal({ isOpen, onClose, onSave, onDelete, deal, defaultStatus }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const isEditing = !!deal?.id;

  useEffect(() => {
    if (deal) {
      setForm({
        title: deal.title || "",
        value: deal.value || "",
        probability: deal.probability ?? 50,
        expected_close: deal.expected_close || "",
        status: deal.status || "lead",
        notes: deal.notes || "",
      });
    } else {
      setForm({
        ...defaultForm,
        status: defaultStatus || "lead",
      });
    }
    setErrors([]);
  }, [deal, isOpen, defaultStatus]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setErrors([]);
    setLoading(true);
    try {
      await onSave(form, deal?.id);
      onClose();
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Something went wrong"]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this deal?")) return;
    setLoading(true);
    try {
      await onDelete(deal.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const weightedValue =
    form.value && form.probability
      ? ((parseFloat(form.value) * parseInt(form.probability)) / 100).toFixed(2)
      : "0.00";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Deal" : "New Deal"}
      size="lg"
    >
      <div className="deal-modal">
        {errors.length > 0 && (
          <div className="deal-modal__errors">
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}

        <Input
          label="Deal Title"
          name="title"
          placeholder="Website redesign for Acme Corp"
          value={form.title}
          onChange={handleChange}
        />

        <div className="deal-modal__row">
          <Input
            label="Deal Value (KES)"
            type="number"
            name="value"
            placeholder="150000"
            value={form.value}
            onChange={handleChange}
          />
          <div className="deal-modal__field">
            <label className="deal-modal__label">
              Probability — {form.probability}%
            </label>
            <input
              className="deal-modal__range"
              type="range"
              name="probability"
              min="0"
              max="100"
              step="5"
              value={form.probability}
              onChange={handleChange}
            />
            <div className="deal-modal__weighted">
              Weighted value: KES {parseFloat(weightedValue).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="deal-modal__row">
          <div className="deal-modal__field">
            <label className="deal-modal__label">Stage</label>
            <select
              className="deal-modal__select"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="deal-modal__field">
            <label className="deal-modal__label">Expected Close</label>
            <input
              className="deal-modal__date"
              type="date"
              name="expected_close"
              value={form.expected_close}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="deal-modal__field">
          <label className="deal-modal__label">Notes</label>
          <textarea
            className="deal-modal__textarea"
            name="notes"
            placeholder="Key details about this deal..."
            value={form.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="deal-modal__actions">
          {isEditing && (
            <Button variant="danger" onClick={handleDelete} loading={loading}>
              Delete
            </Button>
          )}
          <div className="deal-modal__actions-right">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
              {isEditing ? "Save changes" : "Create deal"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default DealModal;
