import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { clientService } from "../../services/clientService";
import Button from "../../components/ui/Button/Button";
import Badge from "../../components/ui/Badge/Badge";
import ClientModal from "../../modules/clients/ClientModal";
import "./ClientDetail.scss";

const STATUS_COLORS = {
  active: "#34D399",
  inactive: "#9090A8",
  prospect: "#FBBF24",
};

function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    setLoading(true);
    try {
      const data = await clientService.getClient(id);
      setClient(data);
    } catch {
      navigate("/clients");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data, clientId) => {
    const updated = await clientService.updateClient(clientId, data);
    setClient((prev) => ({ ...prev, ...updated }));
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Remove this contact?")) return;
    await clientService.deleteContact(id, contactId);
    setClient((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((c) => c.id !== contactId),
    }));
  };

  if (loading) {
    return <div className="client-detail__loading">Loading client...</div>;
  }

  if (!client) return null;

  return (
    <div className="client-detail">
      <button
        className="client-detail__back"
        onClick={() => navigate('/clients')}
      >
        ← Back to Clients
      </button>
      <div className="client-detail__hero">
        <div className="client-detail__avatar">
          {client.initials}
        </div>
        <div className="client-detail__hero-info">
          <div className="client-detail__hero-top">
            <h1 className="client-detail__name">
              {client.company_name}
            </h1>
            <Badge
              label={client.status}
              color={STATUS_COLORS[client.status]}
            />
          </div>
          {client.industry && (
            <p className="client-detail__industry">
              {client.industry}
            </p>
          )}
          <div className="client-detail__meta">
            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="client-detail__meta-link"
              >
                ✉ {client.email}
              </a>
            )}
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="client-detail__meta-link"
              >
                ✆ {client.phone}
              </a>
            )}
            {client.website && (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="client-detail__meta-link"
              >
                ⌘ {client.website}
              </a>
            )}
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => setModalOpen(true)}
        >
          Edit Client
        </Button>
      </div>

      <div className="client-detail__grid">
        <div className="client-detail__section">
          <div className="client-detail__section-header">
            <h2 className="client-detail__section-title">
              Contacts
            </h2>
          </div>
          {client.contacts?.length > 0 ? (
            <div className="client-detail__contacts">
              {client.contacts.map(contact => (
                <div
                  key={contact.id}
                  className="contact-item"
                >
                  <div className="contact-item__avatar">
                    {contact.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="contact-item__info">
                    <div className="contact-item__name">
                      {contact.full_name}
                      {contact.is_primary && (
                        <span className="contact-item__primary">
                          Primary
                        </span>
                      )}
                    </div>
                    {contact.role && (
                      <div className="contact-item__role">
                        {contact.role}
                      </div>
                    )}
                    <div className="contact-item__links">
                      {contact.email && (
                        <a href={`mailto:${contact.email}`}>
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`}>
                          {contact.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    className="contact-item__remove"
                    onClick={() => handleDeleteContact(contact.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="client-detail__empty">
              No contacts added yet.
            </p>
          )}
        </div>

        <div className="client-detail__section">
          <h2 className="client-detail__section-title">Notes</h2>
          {client.notes ? (
            <p className="client-detail__notes">{client.notes}</p>
          ) : (
            <p className="client-detail__empty">No notes added.</p>
          )}
        </div>

      </div>

      <ClientModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        client={client}
      />

    </div>
  )
}

export default ClientDetail
