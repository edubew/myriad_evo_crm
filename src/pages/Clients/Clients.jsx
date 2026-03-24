import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClients } from "../../modules/clients/useClients";
import ClientModal from "../../modules/clients/ClientModal";
import Button from "../../components/ui/Button/Button";
import Badge from "../../components/ui/Badge/Badge";
import EmptyState from "../../components/ui/EmptyState/EmptyState";
import "./Clients.scss";

const STATUS_COLORS = {
  active: "#34D399",
  inactive: "#9090A8",
  prospect: "#FBBF24",
};

function Clients() {
  const navigate = useNavigate();
  const { clients, loading, fetchClients, createClient, updateClient } =
    useClients();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchClients({ q: e.target.value, status: statusFilter });
  };

  const handleStatusFilter = (status) => {
    const newStatus = status === statusFilter ? "" : status;
    setStatus(newStatus);
    fetchClients({ q: search, status: newStatus });
  };

  const handleSave = async (data, id) => {
    if (id) {
      await updateClient(id, data);
    } else {
      await createClient(data);
    }
  };

  const handleEdit = (e, client) => {
    e.stopPropagation();
    setEditClient(client);
    setModalOpen(true);
  };

  return (
    <div className="clients-page">
      <div className="clients-page__header">
        <div>
          <h1 className="clients-page__title">Clients</h1>
          <p className="clients-page__subtitle">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditClient(null);
            setModalOpen(true);
          }}
        >
          + New Client
        </Button>
      </div>

      <div className="clients-page__filters">
        <input
          className="clients-page__search"
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={handleSearch}
        />
        <div className="clients-page__status-filters">
          {["active", "prospect", "inactive"].map((status) => (
            <button
              key={status}
              className={`clients-page__filter-btn ${
                statusFilter === status
                  ? "clients-page__filter-btn--active"
                  : ""
              }`}
              onClick={() => handleStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="clients-page__loading">Loading clients...</div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon="◎"
          title="No clients yet"
          description="Add your first client to get started tracking relationships."
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              + New Client
            </Button>
          }
        />
      ) : (
        <div className="clients-grid">
          {clients.map((client) => (
            <div
              key={client.id}
              className="client-card"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <div className="client-card__header">
                <div className="client-card__avatar">{client.initials}</div>
                <div className="client-card__info">
                  <h3 className="client-card__name">{client.company_name}</h3>
                  {client.industry && (
                    <span className="client-card__industry">
                      {client.industry}
                    </span>
                  )}
                </div>
                <Badge
                  label={client.status}
                  color={STATUS_COLORS[client.status]}
                />
              </div>

              {client.primary_contact && (
                <div className="client-card__contact">
                  <span className="client-card__contact-name">
                    {client.primary_contact.full_name}
                  </span>
                  {client.primary_contact.role && (
                    <span className="client-card__contact-role">
                      {client.primary_contact.role}
                    </span>
                  )}
                </div>
              )}

              <div className="client-card__footer">
                <div className="client-card__meta">
                  {client.email && (
                    <span className="client-card__meta-item">
                      ✉ {client.email}
                    </span>
                  )}
                  {client.phone && (
                    <span className="client-card__meta-item">
                      ✆ {client.phone}
                    </span>
                  )}
                </div>
                <button
                  className="client-card__edit-btn"
                  onClick={(e) => handleEdit(e, client)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ClientModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditClient(null);
        }}
        onSave={handleSave}
        client={editClient}
      />
    </div>
  );
}

export default Clients;