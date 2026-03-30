import { useState, useEffect } from "react";
import { financeService } from "../../services/financeService";
import Button from "../../components/ui/Button/Button";
import Modal from "../../components/ui/Modal/Modal";
import Input from "../../components/ui/Input/Input";
import EmptyState from "../../components/ui/EmptyState/EmptyState";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "./Revenue.scss";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const defaultEntry = {
  title: "",
  amount: "",
  source: "manual",
  status: "pending",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
  salary_pct: "",
  ops_pct: "",
  profit_pct: "",
};

function Revenue() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [allocation, setAlloc] = useState({
    salary_pct: 40,
    ops_pct: 25,
    profit_pct: 35,
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [allocModal, setAllocModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultEntry);
  const [allocForm, setAllocForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [filter, setFilter] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    loadData();
    loadAllocation();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await financeService.getRevenue(filter);
      setEntries(res.data);
      setSummary(res.summary);
    } finally {
      setLoading(false);
    }
  };

  const loadAllocation = async () => {
    try {
      const data = await financeService.getAllocation();
      setAlloc(data);
    } catch { /* empty */ }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...defaultEntry,
      salary_pct: allocation.salary_pct,
      ops_pct: allocation.ops_pct,
      profit_pct: allocation.profit_pct,
    });
    setErrors([]);
    setModalOpen(true);
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setForm({
      title: entry.title,
      amount: entry.amount,
      source: entry.source,
      status: entry.status,
      date: entry.date,
      notes: entry.notes || "",
      salary_pct: entry.salary_pct,
      ops_pct: entry.ops_pct,
      profit_pct: entry.profit_pct,
    });
    setErrors([]);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const pctTotal = () => {
    const s = parseFloat(form.salary_pct || 0);
    const o = parseFloat(form.ops_pct || 0);
    const p = parseFloat(form.profit_pct || 0);
    return Math.round((s + o + p) * 10) / 10;
  };

  const previewAmount = (pct) => {
    const amt = parseFloat(form.amount || 0);
    const p = parseFloat(pct || 0);
    return ((amt * p) / 100).toLocaleString();
  };

  const handleSave = async () => {
    setErrors([]);
    setSaving(true);
    try {
      if (editing) {
        const updated = await financeService.updateEntry(editing.id, form);
        setEntries((prev) =>
          prev.map((e) => (e.id === editing.id ? updated : e)),
        );
      } else {
        const created = await financeService.createEntry(form);
        setEntries((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Something went wrong"]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this entry?")) return;
    await financeService.deleteEntry(editing.id);
    setEntries((prev) => prev.filter((e) => e.id !== editing.id));
    setModalOpen(false);
    loadData();
  };

  const handleAllocSave = async () => {
    setSaving(true);
    try {
      const updated = await financeService.updateAllocation(allocForm);
      setAlloc(updated);
      setAllocModal(false);
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Percentages must add to 100"]);
    } finally {
      setSaving(false);
    }
  };

  const fmt = (val) =>
    `KES ${Math.round(parseFloat(val || 0)).toLocaleString()}`;

  const pctOf = (part, total) => {
    if (!total || !part) return "0%";
    return `${Math.round((part / total) * 100)}%`;
  };

  const allocTotal =
    parseFloat(allocForm.salary_pct || 0) +
    parseFloat(allocForm.ops_pct || 0) +
    parseFloat(allocForm.profit_pct || 0);

  return (
    <div className="revenue-page">
      {/* Header */}
      <div className="revenue-page__header">
        <div>
          <h1 className="revenue-page__title">Revenue</h1>
          <p className="revenue-page__subtitle">
            Track payments and allocate across buckets
          </p>
        </div>
        <div className="revenue-page__header-right">
          <button
            className="revenue-page__alloc-btn"
            onClick={() => {
              setAllocForm({ ...allocation });
              setErrors([]);
              setAllocModal(true);
            }}
          >
            ⚙ Allocation defaults
          </button>
          <Button variant="primary" onClick={openCreate}>
            + Add entry
          </Button>
        </div>
      </div>

      {/* Month filter */}
      <div className="revenue-page__filters">
        <select
          className="revenue-page__select"
          value={filter.month}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              month: parseInt(e.target.value),
            }))
          }
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          className="revenue-page__select"
          value={filter.year}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              year: parseInt(e.target.value),
            }))
          }
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="revenue-page__summary">
          <div className="rev-card rev-card--total">
            <div className="rev-card__label">Total received</div>
            <div className="rev-card__value">{fmt(summary.total_received)}</div>
            <div className="rev-card__sub">
              {summary.paid_count} paid · {summary.pending_count} pending
            </div>
          </div>
          <div className="rev-card rev-card--salary">
            <div className="rev-card__label">Salaries</div>
            <div className="rev-card__value">{fmt(summary.total_salary)}</div>
            <div className="rev-card__sub">
              {pctOf(summary.total_salary, summary.total_received)} of received
            </div>
          </div>
          <div className="rev-card rev-card--ops">
            <div className="rev-card__label">Operations</div>
            <div className="rev-card__value">{fmt(summary.total_ops)}</div>
            <div className="rev-card__sub">
              {pctOf(summary.total_ops, summary.total_received)} of received
            </div>
          </div>
          <div className="rev-card rev-card--profit">
            <div className="rev-card__label">Profit / savings</div>
            <div className="rev-card__value">{fmt(summary.total_profit)}</div>
            <div className="rev-card__sub">
              {pctOf(summary.total_profit, summary.total_received)} of received
            </div>
          </div>
        </div>
      )}

      {/* Allocation bar */}
      {summary && summary.total_received > 0 && (
        <div className="alloc-bar-card">
          <div className="alloc-bar-card__label">
            Revenue allocation — this period
          </div>
          <div className="alloc-bar-card__bar">
            <div
              className="alloc-bar-card__seg alloc-bar-card__seg--salary"
              style={{
                width: pctOf(summary.total_salary, summary.total_received),
              }}
            />
            <div
              className="alloc-bar-card__seg alloc-bar-card__seg--ops"
              style={{
                width: pctOf(summary.total_ops, summary.total_received),
              }}
            />
            <div
              className="alloc-bar-card__seg alloc-bar-card__seg--profit"
              style={{
                width: pctOf(summary.total_profit, summary.total_received),
              }}
            />
          </div>
          <div className="alloc-bar-card__legend">
            <span className="alloc-bar-card__legend-item alloc-bar-card__legend-item--salary">
              Salaries {pctOf(summary.total_salary, summary.total_received)}
            </span>
            <span className="alloc-bar-card__legend-item alloc-bar-card__legend-item--ops">
              Operations {pctOf(summary.total_ops, summary.total_received)}
            </span>
            <span className="alloc-bar-card__legend-item alloc-bar-card__legend-item--profit">
              Profit {pctOf(summary.total_profit, summary.total_received)}
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="revenue-page__grid">
        {/* Entries table */}
        <div className="rev-table-card">
          {loading ? (
            <div className="rev-table-card__loading">Loading entries...</div>
          ) : entries.length === 0 ? (
            <EmptyState
              icon="◇"
              title="No entries this period"
              description="Add a revenue entry to start tracking allocations."
              action={
                <Button variant="primary" onClick={openCreate}>
                  + Add entry
                </Button>
              }
            />
          ) : (
            <>
              <div className="rev-table-head">
                <span>Description</span>
                <span>Amount</span>
                <span>Salaries</span>
                <span>Operations</span>
                <span>Profit</span>
                <span>Source</span>
                <span>Status</span>
              </div>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rev-table-row"
                  onClick={() => openEdit(entry)}
                >
                  <div>
                    <div className="rev-table-row__title">{entry.title}</div>
                    <div className="rev-table-row__date">
                      {new Date(entry.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="rev-table-row__amount">
                    {fmt(entry.amount)}
                  </div>
                  <div className="rev-table-row__alloc">
                    {fmt(entry.salary_amount)}
                    <span className="rev-table-row__pct">
                      {entry.salary_pct}%
                    </span>
                  </div>
                  <div className="rev-table-row__alloc">
                    {fmt(entry.ops_amount)}
                    <span className="rev-table-row__pct">{entry.ops_pct}%</span>
                  </div>
                  <div className="rev-table-row__alloc rev-table-row__alloc--profit">
                    {fmt(entry.profit_amount)}
                    <span className="rev-table-row__pct">
                      {entry.profit_pct}%
                    </span>
                  </div>
                  <div>
                    <span className={`rev-badge rev-badge--${entry.source}`}>
                      {entry.source}
                    </span>
                  </div>
                  <div>
                    <span className={`rev-badge rev-badge--${entry.status}`}>
                      {entry.status}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Monthly trend chart */}
        {summary?.monthly_trend && (
          <div className="rev-chart-card">
            <div className="rev-chart-card__title">Monthly trend</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={summary.monthly_trend} barSize={18}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#8A7060" }}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(val) => fmt(val)}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {summary.monthly_trend.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.current ? "#A84040" : "#8B2A2A"}
                      opacity={entry.current ? 0.85 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Add/Edit entry modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Entry" : "New Revenue Entry"}
        size="lg"
      >
        <div className="rev-form">
          {errors.length > 0 && (
            <div className="rev-form__errors">
              {errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}

          <Input
            label="Description"
            name="title"
            placeholder="Brand identity project — Apex Tech"
            value={form.title}
            onChange={handleChange}
          />

          <div className="rev-form__row">
            <Input
              label="Amount (KES)"
              type="number"
              name="amount"
              placeholder="500000"
              value={form.amount}
              onChange={handleChange}
            />
            <div className="rev-form__field">
              <label className="rev-form__label">Date received</label>
              <input
                className="rev-form__input"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="rev-form__row">
            <div className="rev-form__field">
              <label className="rev-form__label">Source</label>
              <select
                className="rev-form__select"
                name="source"
                value={form.source}
                onChange={handleChange}
              >
                <option value="manual">Manual entry</option>
                <option value="deal">Closed deal</option>
              </select>
            </div>
            <div className="rev-form__field">
              <label className="rev-form__label">Status</label>
              <select
                className="rev-form__select"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Allocation split */}
          <div className="rev-form__alloc">
            <div className="rev-form__alloc-header">
              <span className="rev-form__label">Allocation split</span>
              <span
                className={`rev-form__alloc-total ${
                  pctTotal() === 100
                    ? "rev-form__alloc-total--ok"
                    : "rev-form__alloc-total--err"
                }`}
              >
                {pctTotal()}% {pctTotal() === 100 ? "✓" : "— must equal 100"}
              </span>
            </div>

            <div className="rev-form__alloc-rows">
              {[
                { key: "salary_pct", label: "Salaries", color: "#7A8A96" },
                { key: "ops_pct", label: "Operations", color: "#A87830" },
                { key: "profit_pct", label: "Profit", color: "#4A8C6A" },
              ].map((bucket) => (
                <div key={bucket.key} className="rev-form__alloc-row">
                  <div
                    className="rev-form__alloc-dot"
                    style={{ background: bucket.color }}
                  />
                  <span className="rev-form__alloc-label">{bucket.label}</span>
                  <input
                    className="rev-form__alloc-input"
                    type="number"
                    name={bucket.key}
                    min="0"
                    max="100"
                    value={form[bucket.key]}
                    onChange={handleChange}
                  />
                  <span className="rev-form__alloc-pct">%</span>
                  <span className="rev-form__alloc-preview">
                    = KES {previewAmount(form[bucket.key])}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rev-form__field">
            <label className="rev-form__label">Notes</label>
            <textarea
              className="rev-form__textarea"
              name="notes"
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <div className="rev-form__actions">
            {editing && (
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <div className="rev-form__actions-right">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
                disabled={pctTotal() !== 100}
              >
                {editing ? "Save changes" : "Add entry"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Allocation defaults modal */}
      <Modal
        isOpen={allocModal}
        onClose={() => setAllocModal(false)}
        title="Default allocation percentages"
      >
        <div className="rev-form">
          {errors.length > 0 && (
            <div className="rev-form__errors">
              {errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}

          <p className="rev-form__hint">
            These defaults apply to every new entry. You can override them per
            entry when needed.
          </p>

          <div className="rev-form__alloc-rows">
            {[
              { key: "salary_pct", label: "Salaries", color: "#7A8A96" },
              { key: "ops_pct", label: "Operations", color: "#A87830" },
              { key: "profit_pct", label: "Profit", color: "#4A8C6A" },
            ].map((bucket) => (
              <div key={bucket.key} className="rev-form__alloc-row">
                <div
                  className="rev-form__alloc-dot"
                  style={{ background: bucket.color }}
                />
                <span className="rev-form__alloc-label">{bucket.label}</span>
                <input
                  className="rev-form__alloc-input"
                  type="number"
                  name={bucket.key}
                  min="0"
                  max="100"
                  value={allocForm[bucket.key] || ""}
                  onChange={(e) =>
                    setAllocForm((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }))
                  }
                />
                <span className="rev-form__alloc-pct">%</span>
              </div>
            ))}
          </div>

          <div
            className={`rev-form__alloc-total-bar ${
              Math.round(allocTotal) === 100
                ? "rev-form__alloc-total-bar--ok"
                : "rev-form__alloc-total-bar--err"
            }`}
          >
            Total: {Math.round(allocTotal * 10) / 10}%
            {Math.round(allocTotal) === 100
              ? " ✓ Perfect"
              : ` — needs ${(100 - allocTotal).toFixed(1)}% more`}
          </div>

          <div className="rev-form__actions">
            <div className="rev-form__actions-right">
              <Button variant="ghost" onClick={() => setAllocModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAllocSave}
                loading={saving}
                disabled={Math.round(allocTotal) !== 100}
              >
                Save defaults
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Revenue;
