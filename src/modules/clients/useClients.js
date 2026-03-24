import { useState, useCallback } from "react";
import { clientService } from "../../services/clientService";

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getClients(params);
      setClients(data);
    } catch {
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = async (data) => {
    const newClient = await clientService.createClient(data);
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = async (id, data) => {
    const updated = await clientService.updateClient(id, data);
    setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const deleteClient = async (id) => {
    await clientService.deleteClient(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}
