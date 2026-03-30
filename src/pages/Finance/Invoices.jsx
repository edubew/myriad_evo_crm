import { useState, useEffect } from "react";
import { financeService } from "../../services/financeService";
import Button from "../../components/ui/Button/Button";
import Modal from "../../components/ui/Modal/Modal";
import Input from "../../components/ui/Input/Input";
import Badge from "../../components/ui/Badge/Badge";
import EmptyState from "../../components/ui/EmptyState/EmptyState";
import "./Invoices.scss";

const STATUS_COLORS = {
  draft: "#7A8A96",
  sent: "#A87830",
  paid: "#4A8C6A",
  overdue: "#B34A30",
  cancelled: "#C8A882",
};

const defaultForm = {
  title: "",
  amount: "",
  tax_rate: 0,
  status: "draft",
  issued_date: new Date().toISOString().slice(0, 10),
  due_date: "",
  notes: "",
  client_id: "",
};

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [statusFilter, setStatus] = useState("");

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await financeService.getInvoices(params);
      setInvoices(res.data);
      setSummary(res.summary);
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

  const openEdit = (invoice) => {
    setEditing(invoice);
    setForm({
      title: invoice.title,
      amount: invoice.amount,
      tax_rate: invoice.tax_rate,
      status: invoice.status,
      issued_date: invoice.issued_date || "",
      due_date: invoice.due_date || "",
      notes: invoice.notes || "",
      client_id: invoice.client_id || "",
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
        const updated = await financeService.updateInvoice(editing.id, form);
        setInvoices((prev) =>
          prev.map((i) => (i.id === editing.id ? updated : i)),
        );
      } else {
        const created = await financeService.createInvoice(form);
        setInvoices((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      loadInvoices();
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Something went wrong"]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this invoice?")) return;
    await financeService.deleteInvoice(editing.id);
    setInvoices((prev) => prev.filter((i) => i.id !== editing.id));
    setModalOpen(false);
    loadInvoices();
  };

  const handleMarkPaid = async (invoice, e) => {
    e.stopPropagation();
    const updated = await financeService.updateInvoice(invoice.id, {
      status: "paid",
    });
    setInvoices((prev) => prev.map((i) => (i.id === invoice.id ? updated : i)));
    loadInvoices();
  };

  const fmt = (val) =>
    `KES ${Math.round(parseFloat(val || 0)).toLocaleString()}`;

  const taxPreview = () => {
    const amt = parseFloat(form.amount || 0);
    const tax = parseFloat(form.tax_rate || 0);
    const taxAmt = (amt * tax) / 100;
    return {
      tax: taxAmt.toLocaleString(),
      total: (amt + taxAmt).toLocaleString(),
    };
  };

  const dueLabel = (invoice) => {
    if (invoice.status === "paid") return null;
    if (invoice.overdue) return { label: "Overdue", red: true };
    if (!invoice.days_until_due && invoice.days_until_due !== 0) return null;
    if (invoice.days_until_due === 0) return { label: "Due today", red: true };
    if (invoice.days_until_due < 0) return { label: "Overdue", red: true };
    if (invoice.days_until_due <= 7)
      return { label: `${invoice.days_until_due}d left`, red: false };
    return null;
  };

  const preview = taxPreview();

  return (
    <div className="invoices-page">
      <div className="invoices-page__header">
        <div>
          <h1 className="invoices-page__title">Invoices</h1>
          <p className="invoices-page__subtitle">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + New Invoice
        </Button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="invoices-page__summary">
          <div className="inv-card inv-card--total">
            <div className="inv-card__label">Total invoiced</div>
            <div className="inv-card__value">{fmt(summary.total_invoiced)}</div>
            <div className="inv-card__sub">All time</div>
          </div>
          <div className="inv-card inv-card--paid">
            <div className="inv-card__label">Collected</div>
            <div className="inv-card__value">{fmt(summary.total_paid)}</div>
            <div className="inv-card__sub">Paid invoices</div>
          </div>
          <div className="inv-card inv-card--pending">
            <div className="inv-card__label">Outstanding</div>
            <div className="inv-card__value">{fmt(summary.total_pending)}</div>
            <div className="inv-card__sub">Awaiting payment</div>
          </div>
          <div className="inv-card inv-card--overdue">
            <div className="inv-card__label">Overdue</div>
            <div className="inv-card__value">{summary.overdue_count}</div>
            <div className="inv-card__sub">
              {summary.overdue_count > 0 ? "Follow up needed" : "All on time"}
            </div>
          </div>
        </div>
      )}

      {/* Status filters */}
      <div className="invoices-page__filters">
        {["", "draft", "sent", "paid", "overdue"].map((s) => (
          <button
            key={s}
            className={`invoices-page__filter-btn ${
              statusFilter === s ? "invoices-page__filter-btn--active" : ""
            }`}
            onClick={() => setStatus(s)}
          >
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoices table */}
      {loading ? (
        <div className="invoices-page__loading">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon="◇"
          title="No invoices yet"
          description="Create your first invoice to start tracking payments."
          action={
            <Button variant="primary" onClick={openCreate}>
              + New Invoice
            </Button>
          }
        />
      ) : (
        <div className="inv-table">
          <div className="inv-table__head">
            <span>Invoice</span>
            <span>Client</span>
            <span>Amount</span>
            <span>Tax</span>
            <span>Total</span>
            <span>Due date</span>
            <span>Status</span>
            <span />
          </div>

          {invoices.map((invoice) => {
            const due = dueLabel(invoice);
            return (
              <div
                key={invoice.id}
                className={`inv-table__row ${
                  invoice.overdue ? "inv-table__row--overdue" : ""
                }`}
                onClick={() => openEdit(invoice)}
              >
                <div>
                  <div className="inv-table__number">
                    {invoice.invoice_number}
                  </div>
                  <div className="inv-table__title">{invoice.title}</div>
                </div>

                <div className="inv-table__client">
                  {invoice.client_name || "—"}
                </div>

                <div className="inv-table__amount">{fmt(invoice.amount)}</div>

                <div className="inv-table__tax">
                  {invoice.tax_rate > 0 ? `${invoice.tax_rate}%` : "—"}
                </div>

                <div className="inv-table__total">
                  {fmt(invoice.total_amount)}
                </div>

                <div>
                  {invoice.due_date ? (
                    <div>
                      <div className="inv-table__due-date">
                        {new Date(invoice.due_date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </div>
                      {due && (
                        <div
                          className={`inv-table__due-label ${
                            due.red ? "inv-table__due-label--red" : ""
                          }`}
                        >
                          {due.label}
                        </div>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </div>

                <div>
                  <Badge
                    label={invoice.overdue ? "overdue" : invoice.status}
                    color={
                      STATUS_COLORS[
                        invoice.overdue ? "overdue" : invoice.status
                      ]
                    }
                  />
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  {invoice.status === "sent" && (
                    <button
                      className="inv-table__mark-paid"
                      onClick={(e) => handleMarkPaid(invoice, e)}
                    >
                      Mark paid
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.invoice_number}` : "New Invoice"}
        size="lg"
      >
        <div className="inv-form">
          {errors.length > 0 && (
            <div className="inv-form__errors">
              {errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}

          <Input
            label="Invoice title"
            name="title"
            placeholder="Brand Identity Project — Apex Tech"
            value={form.title}
            onChange={handleChange}
          />

          <div className="inv-form__row">
            <Input
              label="Amount (KES)"
              type="number"
              name="amount"
              placeholder="500000"
              value={form.amount}
              onChange={handleChange}
            />
            <div className="inv-form__field">
              <label className="inv-form__label">Tax rate % (optional)</label>
              <input
                className="inv-form__input"
                type="number"
                name="tax_rate"
                min="0"
                max="100"
                placeholder="16"
                value={form.tax_rate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Tax preview */}
          {parseFloat(form.amount) > 0 && (
            <div className="inv-form__preview">
              <div className="inv-form__preview-row">
                <span>Subtotal</span>
                <span>KES {parseFloat(form.amount || 0).toLocaleString()}</span>
              </div>
              <div className="inv-form__preview-row">
                <span>Tax ({form.tax_rate || 0}%)</span>
                <span>KES {preview.tax}</span>
              </div>
              <div className="inv-form__preview-row inv-form__preview-row--total">
                <span>Total</span>
                <span>KES {preview.total}</span>
              </div>
            </div>
          )}

          <div className="inv-form__row">
            <div className="inv-form__field">
              <label className="inv-form__label">Issue date</label>
              <input
                className="inv-form__input"
                type="date"
                name="issued_date"
                value={form.issued_date}
                onChange={handleChange}
              />
            </div>
            <div className="inv-form__field">
              <label className="inv-form__label">Due date</label>
              <input
                className="inv-form__input"
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="inv-form__field">
            <label className="inv-form__label">Status</label>
            <select
              className="inv-form__select"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="inv-form__field">
            <label className="inv-form__label">Notes</label>
            <textarea
              className="inv-form__textarea"
              name="notes"
              placeholder="Payment terms, bank details, etc."
              value={form.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="inv-form__actions">
            {editing && (
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <div className="inv-form__actions-right">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>
                {editing ? "Save changes" : "Create invoice"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Invoices;
