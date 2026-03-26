import { useState, useEffect } from "react";
import { salesService } from "../../services/salesService";
import LeadModal from "../../modules/sales/LeadModal";
import Button from "../../components/ui/Button/Button";
import Badge from "../../components/ui/Badge/Badge";
import EmptyState from "../../components/ui/EmptyState/EmptyState";
import "./Leads.scss";

const STATUS_COLORS = {
  new: "#60A5FA",
  contacted: "#FBBF24",
  qualified: "#34D399",
  disqualified: "#F87171",
};

const SOURCE_LABELS = {
  website: "Website",
  referral: "Referral",
  social_media: "Social Media",
  cold_outreach: "Cold Outreach",
  event: "Event",
  other: "Other",
};

function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async (params = {}) => {
    setLoading(true);
    try {
      const data = await salesService.getLeads(params);
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    loadLeads({ q: e.target.value, status: statusFilter });
  };

  const handleStatusFilter = (status) => {
    const newStatus = status === statusFilter ? "" : status;
    setStatus(newStatus);
    loadLeads({ q: search, status: newStatus });
  };

  const handleSave = async (data, id) => {
    if (id) {
      const updated = await salesService.updateLead(id, data);
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
    } else {
      const newLead = await salesService.createLead(data);
      setLeads((prev) => [newLead, ...prev]);
    }
  };

  const handleDelete = async (id) => {
    await salesService.deleteLead(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="leads-page">
      <div className="leads-page__header">
        <div>
          <h1 className="leads-page__title">Leads</h1>
          <p className="leads-page__subtitle">
            {leads.length} lead{leads.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedLead(null);
            setModalOpen(true);
          }}
        >
          + New Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="leads-page__filters">
        <input
          className="leads-page__search"
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={handleSearch}
        />
        <div className="leads-page__status-filters">
          {["new", "contacted", "qualified", "disqualified"].map((s) => (
            <button
              key={s}
              className={`leads-page__filter-btn ${
                statusFilter === s ? "leads-page__filter-btn--active" : ""
              }`}
              onClick={() => handleStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="leads-page__loading">Loading leads...</div>
      ) : leads.length === 0 ? (
        <EmptyState
          icon="◉"
          title="No leads yet"
          description="Start tracking potential clients by adding your first lead."
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              + New Lead
            </Button>
          }
        />
      ) : (
        <div className="leads-table">
          <div className="leads-table__header">
            <span>Company</span>
            <span>Contact</span>
            <span>Source</span>
            <span>Status</span>
            <span>Added</span>
            <span />
          </div>
          {leads.map((lead) => (
            <div key={lead.id} className="leads-table__row">
              <div className="leads-table__company">
                <div className="leads-table__avatar">
                  {lead.company_name[0]}
                </div>
                <div>
                  <div className="leads-table__name">{lead.company_name}</div>
                  {lead.email && (
                    <div className="leads-table__email">{lead.email}</div>
                  )}
                </div>
              </div>
              <span className="leads-table__contact">
                {lead.contact_name || "—"}
              </span>
              <span className="leads-table__source">
                {SOURCE_LABELS[lead.source] || lead.source}
              </span>
              <span>
                <Badge label={lead.status} color={STATUS_COLORS[lead.status]} />
              </span>
              <span className="leads-table__date">
                {new Date(lead.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <button
                className="leads-table__edit"
                onClick={() => {
                  setSelectedLead(lead);
                  setModalOpen(true);
                }}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      <LeadModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedLead(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        lead={selectedLead}
      />
    </div>
  );
}

export default Leads;
