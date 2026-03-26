import { useState, useEffect } from "react";
import { salesService } from "../../services/salesService";
import PipelineBoard from "../../modules/sales/PipelineBoard";
import "./Pipeline.scss";

function Pipeline() {
  const [deals, setDeals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const data = await salesService.getDeals();
      setDeals(data.data);
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    const newDeal = await salesService.createDeal(data);
    setDeals((prev) => [...prev, newDeal]);
  };

  const handleUpdate = async (id, data) => {
    const updated = await salesService.updateDeal(id, data);
    setDeals((prev) =>
      prev.map((d) => (String(d.id) === String(id) ? { ...d, ...updated } : d)),
    );
  };

  const handleDelete = async (id) => {
    await salesService.deleteDeal(id);
    setDeals((prev) => prev.filter((d) => String(d.id) !== String(id)));
  };

  return (
    <div className="pipeline-page">
      <div className="pipeline-page__header">
        <div>
          <h1 className="pipeline-page__title">Sales Pipeline</h1>
          <p className="pipeline-page__subtitle">
            Track deals through your sales process
          </p>
        </div>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="pipeline-page__stats">
          <div className="pipeline-stat">
            <span className="pipeline-stat__value">
              KES {parseFloat(summary.total_value || 0).toLocaleString()}
            </span>
            <span className="pipeline-stat__label">Pipeline Value</span>
          </div>
          <div className="pipeline-stat">
            <span className="pipeline-stat__value">
              KES {parseFloat(summary.weighted_value || 0).toLocaleString()}
            </span>
            <span className="pipeline-stat__label">Weighted Value</span>
          </div>
          <div className="pipeline-stat">
            <span className="pipeline-stat__value">{summary.deal_count}</span>
            <span className="pipeline-stat__label">Active Deals</span>
          </div>
          <div className="pipeline-stat">
            <span className="pipeline-stat__value pipeline-stat__value--success">
              KES {parseFloat(summary.won_value || 0).toLocaleString()}
            </span>
            <span className="pipeline-stat__label">Won This Period</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="pipeline-page__loading">Loading pipeline...</div>
      ) : (
        <PipelineBoard
          deals={deals}
          onDealCreate={handleCreate}
          onDealUpdate={handleUpdate}
          onDealDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default Pipeline;
