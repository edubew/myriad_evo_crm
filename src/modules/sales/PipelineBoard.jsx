import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { salesService } from "../../services/salesService";
import DealModal from "./DealModal";
import "./PipelineBoard.scss";

const STAGES = [
  { id: "lead", label: "Lead", color: "#9090A8" },
  { id: "qualified", label: "Qualified", color: "#60A5FA" },
  { id: "proposal_sent", label: "Proposal Sent", color: "#A78BFA" },
  { id: "negotiation", label: "Negotiation", color: "#FBBF24" },
  { id: "closed_won", label: "Closed Won", color: "#34D399" },
  { id: "closed_lost", label: "Closed Lost", color: "#F87171" },
];

function PipelineBoard({ deals, onDealCreate, onDealUpdate, onDealDelete }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState("lead");

  const getStageDeals = (stageId) =>
    deals
      .filter((d) => d.status === stageId)
      .sort((a, b) => a.position - b.position);

  const getStageTotal = (stageId) =>
    getStageDeals(stageId).reduce(
      (sum, d) => sum + parseFloat(d.value || 0),
      0,
    );

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newStatus = destination.droppableId;
    const stageDeals = getStageDeals(newStatus).filter(
      (d) => String(d.id) !== draggableId,
    );

    stageDeals.splice(destination.index, 0, {
      id: draggableId,
      status: newStatus,
    });

    const reorderPayload = stageDeals.map((d, index) => ({
      id: d.id,
      status: newStatus,
      position: index,
    }));

    onDealUpdate(draggableId, { status: newStatus });

    try {
      await salesService.reorderDeals(reorderPayload);
    } catch (err) {
      console.error("Reorder failed", err);
    }
  };

  const handleSave = async (data, dealId) => {
    if (dealId) {
      await onDealUpdate(dealId, data);
    } else {
      await onDealCreate(data);
    }
  };

  return (
    <div className="pipeline">
      {/* Add deal button */}
      <div className="pipeline__toolbar">
        <button
          className="pipeline__add-btn"
          onClick={() => {
            setSelectedDeal(null);
            setDefaultStatus("lead");
            setModalOpen(true);
          }}
        >
          + New Deal
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="pipeline__board">
          {STAGES.map((stage) => {
            const stageDeals = getStageDeals(stage.id);
            const stageTotal = getStageTotal(stage.id);

            return (
              <div key={stage.id} className="pipeline__column">
                {/* Stage header */}
                <div className="pipeline__stage-header">
                  <div
                    className="pipeline__stage-bar"
                    style={{ background: stage.color }}
                  />
                  <div className="pipeline__stage-info">
                    <div className="pipeline__stage-top">
                      <span className="pipeline__stage-name">
                        {stage.label}
                      </span>
                      <span className="pipeline__stage-count">
                        {stageDeals.length}
                      </span>
                    </div>
                    <span className="pipeline__stage-value">
                      KES {stageTotal.toLocaleString()}
                    </span>
                  </div>
                  <button
                    className="pipeline__stage-add"
                    onClick={() => {
                      setSelectedDeal(null);
                      setDefaultStatus(stage.id);
                      setModalOpen(true);
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Droppable */}
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`pipeline__drop-zone ${
                        snapshot.isDraggingOver
                          ? "pipeline__drop-zone--active"
                          : ""
                      }`}
                    >
                      {stageDeals.map((deal, index) => (
                        <Draggable
                          key={String(deal.id)}
                          draggableId={String(deal.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`deal-card ${
                                snapshot.isDragging ? "deal-card--dragging" : ""
                              }`}
                              onClick={() => {
                                setSelectedDeal(deal);
                                setModalOpen(true);
                              }}
                            >
                              <p className="deal-card__title">{deal.title}</p>

                              <div className="deal-card__value">
                                KES{" "}
                                {parseFloat(deal.value || 0).toLocaleString()}
                              </div>

                              <div className="deal-card__meta">
                                {/* Probability bar */}
                                <div className="deal-card__prob-bar">
                                  <div
                                    className="deal-card__prob-fill"
                                    style={{
                                      width: `${deal.probability}%`,
                                      background: stage.color,
                                    }}
                                  />
                                </div>
                                <span className="deal-card__prob-label">
                                  {deal.probability}%
                                </span>
                              </div>

                              {deal.expected_close && (
                                <div className="deal-card__close">
                                  Close:{" "}
                                  {new Date(
                                    deal.expected_close,
                                  ).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {stageDeals.length === 0 && !snapshot.isDraggingOver && (
                        <div className="pipeline__empty">No deals</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <DealModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedDeal(null);
        }}
        onSave={handleSave}
        onDelete={onDealDelete}
        deal={selectedDeal}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}

export default PipelineBoard;
