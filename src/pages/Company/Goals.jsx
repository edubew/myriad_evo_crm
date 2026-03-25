import { useState, useEffect } from "react";
import { companyService } from "../../services/companyService";
import Button from "../../components/ui/Button/Button";
import Modal from "../../components/ui/Modal/Modal";
import Input from "../../components/ui/Input/Input";
import EmptyState from "../../components/ui/EmptyState/EmptyState";
import "./Goals.scss";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const currentYear = new Date().getFullYear();
const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

const defaultForm = {
  title: "",
  description: "",
  target_date: "",
  progress: 0,
  status: "active",
  quarter: currentQuarter,
  year: currentYear,
};

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [filter, setFilter] = useState({
    quarter: currentQuarter,
    year: currentYear,
  });

  useEffect(() => {
    loadGoals();
  }, [filter]);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await companyService.getGoals(filter);
      setGoals(data);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setErrors([]);
    setModalOpen(true);
  };

  const openEdit = (goal) => {
    setEditing(goal);
    setForm({
      title: goal.title || "",
      description: goal.description || "",
      target_date: goal.target_date || "",
      progress: goal.progress ?? 0,
      status: goal.status || "active",
      quarter: goal.quarter || currentQuarter,
      year: goal.year || currentYear,
    });
    setErrors([]);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors([]);
    try {
      if (editing) {
        const updated = await companyService.updateGoal(editing.id, form);
        setGoals((prev) =>
          prev.map((g) => (g.id === editing.id ? updated : g)),
        );
      } else {
        const newGoal = await companyService.createGoal(form);
        setGoals((prev) => [newGoal, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Something went wrong"]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this goal?")) return;
    await companyService.deleteGoal(editing.id);
    setGoals((prev) => prev.filter((g) => g.id !== editing.id));
    setModalOpen(false);
  };

  const completedCount = goals.filter((g) => g.status === "completed").length;
  const avgProgress = goals.length
    ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
    : 0;

  return (
    <div className="goals-page">
      <div className="goals-page__header">
        <div>
          <h1 className="goals-page__title">Goals</h1>
          <p className="goals-page__subtitle">
            {filter.quarter} {filter.year} — {goals.length} goals, {avgProgress}
            % average progress
          </p>
        </div>
        <div className="goals-page__header-right">
          <select
            className="goals-page__quarter-select"
            value={filter.quarter}
            onChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                quarter: e.target.value,
              }))
            }
          >
            {QUARTERS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
          <select
            className="goals-page__quarter-select"
            value={filter.year}
            onChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                year: parseInt(e.target.value),
              }))
            }
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Button variant="primary" onClick={openCreate}>
            + New Goal
          </Button>
        </div>
      </div>

      {goals.length > 0 && (
        <div className="goals-page__stats">
          <div className="goal-stat">
            <div className="goal-stat__value">{goals.length}</div>
            <div className="goal-stat__label">Total Goals</div>
          </div>
          <div className="goal-stat">
            <div className="goal-stat__value">{completedCount}</div>
            <div className="goal-stat__label">Completed</div>
          </div>
          <div className="goal-stat">
            <div className="goal-stat__value">{avgProgress}%</div>
            <div className="goal-stat__label">Avg Progress</div>
          </div>
          <div className="goal-stat">
            <div className="goal-stat__value">
              {goals.length - completedCount}
            </div>
            <div className="goal-stat__label">In Progress</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="goals-page__loading">Loading goals...</div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon="◎"
          title="No goals yet"
          description={`Set your ${filter.quarter} ${filter.year} objectives to track company progress.`}
          action={
            <Button variant="primary" onClick={openCreate}>
              + New Goal
            </Button>
          }
        />
      ) : (
        <div className="goals-list">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`goal-card goal-card--${goal.status}`}
              onClick={() => openEdit(goal)}
            >
              <div className="goal-card__left">
                <div className="goal-card__circle">
                  <svg viewBox="0 0 36 36" className="goal-card__svg">
                    <path
                      className="goal-card__svg-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="goal-card__svg-fill"
                      strokeDasharray={`${goal.progress}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="goal-card__pct">{goal.progress}%</span>
                </div>
              </div>

              <div className="goal-card__body">
                <div className="goal-card__top">
                  <h3 className="goal-card__title">{goal.title}</h3>
                  <span
                    className={`goal-card__status goal-card__status--${goal.status}`}
                  >
                    {goal.status}
                  </span>
                </div>
                {goal.description && (
                  <p className="goal-card__description">{goal.description}</p>
                )}
                <div className="goal-card__progress">
                  <div className="goal-card__progress-bar">
                    <div
                      className="goal-card__progress-fill"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
                {goal.target_date && (
                  <p className="goal-card__date">
                    Target:{" "}
                    {new Date(goal.target_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Goal" : "New Goal"}
        size="lg"
      >
        <div className="goal-form">
          {errors.length > 0 && (
            <div className="goal-form__errors">
              {errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}

          <Input
            label="Goal Title"
            name="title"
            placeholder="Launch new product by end of quarter"
            value={form.title}
            onChange={handleChange}
          />

          <div className="goal-form__field">
            <label className="goal-form__label">Description</label>
            <textarea
              className="goal-form__textarea"
              name="description"
              placeholder="What does success look like?"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="goal-form__field">
            <label className="goal-form__label">
              Progress — {form.progress}%
            </label>
            <input
              className="goal-form__range"
              type="range"
              name="progress"
              min="0"
              max="100"
              step="5"
              value={form.progress}
              onChange={handleChange}
            />
          </div>

          <div className="goal-form__row">
            <div className="goal-form__field">
              <label className="goal-form__label">Quarter</label>
              <select
                className="goal-form__select"
                name="quarter"
                value={form.quarter}
                onChange={handleChange}
              >
                {QUARTERS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
            <div className="goal-form__field">
              <label className="goal-form__label">Year</label>
              <select
                className="goal-form__select"
                name="year"
                value={form.year}
                onChange={handleChange}
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="goal-form__field">
              <label className="goal-form__label">Status</label>
              <select
                className="goal-form__select"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="goal-form__field">
            <label className="goal-form__label">Target Date</label>
            <input
              className="goal-form__date"
              type="date"
              name="target_date"
              value={form.target_date}
              onChange={handleChange}
            />
          </div>

          <div className="goal-form__actions">
            {editing && (
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <div className="goal-form__actions-right">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>
                {editing ? "Save changes" : "Create goal"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Goals;
