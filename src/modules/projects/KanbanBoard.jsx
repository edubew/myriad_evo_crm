import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { projectService } from "../../services/projectService";
import TaskModal from "./TaskModal";
import Badge from "../../components/ui/Badge/Badge";
import "./KanbanBoard.scss";

const COLUMNS = [
  { id: "backlog", label: "Backlog", color: "#9090A8" },
  { id: "in_progress", label: "In Progress", color: "#6C63FF" },
  { id: "review", label: "Review", color: "#FBBF24" },
  { id: "completed", label: "Completed", color: "#34D399" },
];

const PRIORITY_COLORS = {
  low: "#34D399",
  medium: "#60A5FA",
  high: "#FBBF24",
  urgent: "#F87171",
};

function KanbanBoard({
  project,
  tasks,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
}) {
  const [taskModal, setTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState("backlog");
  const getColumnTasks = (status) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);

  // Handle drag end
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a column
    if (!destination) return;

    // Dropped in same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newStatus = destination.droppableId;

    // Build reorder payload for the destination column
    const columnTasks = getColumnTasks(newStatus).filter(
      (t) => String(t.id) !== draggableId,
    );

    // Insert dragged task at new position
    columnTasks.splice(destination.index, 0, {
      id: draggableId,
      status: newStatus,
    });

    const reorderPayload = columnTasks.map((t, index) => ({
      id: t.id,
      status: newStatus,
      position: index,
    }));

    // Optimistic update
    onTaskUpdate(draggableId, { status: newStatus });

    // Persist to API
    try {
      await projectService.reorderTasks(project.id, reorderPayload);
    } catch (err) {
      console.error("Reorder failed", err);
    }
  };

  const handleAddTask = (status) => {
    setSelectedTask(null);
    setDefaultStatus(status);
    setTaskModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskModal(true);
  };

  const handleSaveTask = async (data, taskId) => {
    if (taskId) {
      await onTaskUpdate(taskId, data);
    } else {
      await onTaskCreate(data);
    }
  };

  return (
    <div className="kanban">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban__board">
          {COLUMNS.map((column) => {
            const columnTasks = getColumnTasks(column.id);

            return (
              <div key={column.id} className="kanban__column">
                <div className="kanban__column-header">
                  <div className="kanban__column-title">
                    <span
                      className="kanban__column-dot"
                      style={{ background: column.color }}
                    />
                    <span>{column.label}</span>
                    <span className="kanban__column-count">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    className="kanban__add-btn"
                    onClick={() => handleAddTask(column.id)}
                    title="Add task"
                  >
                    +
                  </button>
                </div>

                {/* Droppable area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`kanban__drop-zone ${
                        snapshot.isDraggingOver
                          ? "kanban__drop-zone--active"
                          : ""
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable
                          key={String(task.id)}
                          draggableId={String(task.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`kanban__card ${
                                snapshot.isDragging
                                  ? "kanban__card--dragging"
                                  : ""
                              }`}
                              onClick={() => handleEditTask(task)}
                            >
                              {/* Priority indicator */}
                              <div
                                className="kanban__card-priority"
                                style={{
                                  background: PRIORITY_COLORS[task.priority],
                                }}
                              />

                              <div className="kanban__card-body">
                                <p className="kanban__card-title">
                                  {task.title}
                                </p>

                                {task.description && (
                                  <p className="kanban__card-desc">
                                    {task.description}
                                  </p>
                                )}

                                <div className="kanban__card-footer">
                                  <Badge
                                    label={task.priority}
                                    color={PRIORITY_COLORS[task.priority]}
                                    size="sm"
                                  />
                                  {task.due_date && (
                                    <span className="kanban__card-date">
                                      {new Date(
                                        task.due_date,
                                      ).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                    </span>
                                  )}
                                  {task.assignee && (
                                    <span className="kanban__card-assignee">
                                      {task.assignee.full_name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Empty column state */}
                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="kanban__empty">No tasks</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <TaskModal
        isOpen={taskModal}
        onClose={() => {
          setTaskModal(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={onTaskDelete}
        task={selectedTask}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}

export default KanbanBoard;
