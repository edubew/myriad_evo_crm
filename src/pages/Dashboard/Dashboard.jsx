import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { dashboardService } from "../../services/dashboardService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "./Dashboard.scss";

const PRIORITY_COLORS = {
  low: "#4A8C6A",
  medium: "#7A8A96",
  high: "#A87830",
  urgent: "#B34A30",
};

const SOURCE_COLORS = {
  project: { bg: "#F9EDED", color: "#8B2A2A", label: "proj" },
  calendar: { bg: "#EDE0D4", color: "#8A7060", label: "cal" },
  manual: { bg: "#EAF5EE", color: "#4A8C6A", label: "todo" },
  lead: { bg: "#FFF8EE", color: "#A87830", label: "lead" },
};

const KANBAN_COLS = [
  { id: "backlog", label: "Backlog", color: "#8A7060" },
  { id: "in_progress", label: "In progress", color: "#8B2A2A" },
  { id: "review", label: "Review", color: "#A87830" },
  { id: "completed", label: "Done", color: "#4A8C6A" },
];

const DEV_USER = { first_name: "Inayat" };

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeUser = user || DEV_USER;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [addingTodo, setAdding] = useState(false);
  const todoInputRef = useRef(null);

  useEffect(() => {
    loadDashboard();
    loadTodos();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getDashboard();
      setData(result);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadTodos = async () => {
    try {
      const result = await dashboardService.getTodos();
      setTodos(result);
    } catch {
      /* empty */
    }
  };

  const handleToggleTodo = async (todo) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)),
    );
    try {
      await dashboardService.toggleTodo(todo.id, !todo.done);
    } catch {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, done: todo.done } : t)),
      );
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const created = await dashboardService.createTodo(newTodo.trim());
      setTodos((prev) => [...prev, created]);
      setNewTodo("");
      setAdding(false);
    } catch {
      /* empty */
    }
  };

  const handleDeleteTodo = async (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await dashboardService.deleteTodo(id);
    } catch {
      /* empty */
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = () =>
    new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatCurrency = (val) =>
    `KES ${Math.round(parseFloat(val || 0)).toLocaleString()}`;

  const formatEventTime = (e) => {
    if (e.all_day) return "All day";
    return new Date(e.start).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEventDate = (e) => {
    const d = new Date(e.start);
    const now = new Date();
    const tom = new Date();
    tom.setDate(now.getDate() + 1);
    if (d.toDateString() === now.toDateString()) return "Today";
    if (d.toDateString() === tom.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const daysLabel = (dateStr, isOverdue) => {
    if (!dateStr) return null;
    if (isOverdue) return { label: "Overdue", overdue: true };
    const diff = Math.ceil(
      (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 0) return { label: "Due today", overdue: false };
    if (diff === 1) return { label: "Due tomorrow", overdue: false };
    return { label: `${diff}d left`, overdue: false };
  };

  // Merge smart items + manual todos for focus list
  const focusItems = [
    ...(data?.todays_focus || []),
    ...todos.map((t) => ({
      id: `manual_${t.id}`,
      _todoId: t.id,
      text: t.text,
      source: "manual",
      meta: "Personal · today",
      done: t.done,
      type: "manual",
      priority: null,
      overdue: false,
    })),
  ];

  const doneCount = focusItems.filter((i) => i.done).length;
  const totalCount = focusItems.length;
  const focusPct =
    totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Custom tooltip for chart
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip__label">{label}</div>
        {payload.map((p) => (
          <div key={p.dataKey} className="chart-tooltip__row">
            <span
              className="chart-tooltip__dot"
              style={{ background: p.fill }}
            />
            <span>{p.name}:</span>
            <span className="chart-tooltip__val">
              {formatCurrency(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading">
          <div className="dashboard__spinner" />
          <span>Loading your workspace...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard__error">
          <p>{error}</p>
          <button onClick={loadDashboard}>Try again</button>
        </div>
      </div>
    );
  }

  const {
    metrics = {},
    alert,
    kanban_overview = { tasks: {}, counts: {} },
    upcoming_events = [],
    active_projects = [],
    pipeline_summary = [],
    revenue_chart = [],
  } = data || {};

  return (
    <div className="dashboard">
      <div className="dashboard__greeting">
        <div>
          <h1 className="dashboard__greeting-title">
            {greeting()}, {activeUser.first_name} 👋
          </h1>
          <p className="dashboard__greeting-date">{formatDate()}</p>
        </div>
        <div className="dashboard__greeting-actions">
          <button
            className="dashboard__refresh"
            onClick={() => {
              loadDashboard();
              loadTodos();
            }}
            title="Refresh"
          >
            ↻
          </button>
          <button
            className="dashboard__new-event"
            onClick={() => navigate("/calendar")}
          >
            + New event
          </button>
        </div>
      </div>

      {alert && (
        <div className="dashboard__alert">
          <span className="dashboard__alert-icon">⚠</span>
          <span className="dashboard__alert-text">{alert.message}</span>
          <button
            className="dashboard__alert-link"
            onClick={() => navigate("/projects")}
          >
            Review now →
          </button>
        </div>
      )}

      <div className="dashboard__metrics">
        <div
          className={`metric-card ${
            metrics.overdue_projects > 0
              ? "metric-card--red"
              : "metric-card--neutral"
          }`}
          onClick={() => navigate("/projects")}
        >
          <div className="metric-card__top">
            <span className="metric-card__icon">⚑</span>
            {metrics.overdue_projects > 0 && (
              <span className="metric-card__badge metric-card__badge--red">
                Needs attention
              </span>
            )}
          </div>
          <div
            className={`metric-card__value ${
              metrics.overdue_projects > 0 ? "metric-card__value--red" : ""
            }`}
          >
            {metrics.overdue_projects ?? 0}
          </div>
          <div className="metric-card__label">Overdue projects</div>
          <div
            className={`metric-card__sub ${
              metrics.overdue_projects > 0 ? "metric-card__sub--red" : ""
            }`}
          >
            {metrics.overdue_projects > 0 ? "Act today" : "All on track"}
          </div>
        </div>

        <div
          className="metric-card metric-card--brand"
          onClick={() => navigate("/projects")}
        >
          <div className="metric-card__top">
            <span className="metric-card__icon">◈</span>
          </div>
          <div className="metric-card__value">
            {metrics.active_projects ?? 0}
          </div>
          <div className="metric-card__label">Active projects</div>
          <div className="metric-card__sub">
            {metrics.projects_due_this_week > 0
              ? `${metrics.projects_due_this_week} due this week`
              : "No deadlines this week"}
          </div>
        </div>

        <div
          className="metric-card metric-card--amber"
          onClick={() => navigate("/calendar")}
        >
          <div className="metric-card__top">
            <span className="metric-card__icon">◷</span>
          </div>
          <div className="metric-card__value">
            {metrics.upcoming_deadlines ?? 0}
          </div>
          <div className="metric-card__label">Upcoming deadlines</div>
          <div className="metric-card__sub">Next 14 days</div>
        </div>

        <div
          className="metric-card metric-card--neutral"
          onClick={() => navigate("/clients")}
        >
          <div className="metric-card__top">
            <span className="metric-card__icon">◎</span>
          </div>
          <div className="metric-card__value">
            {metrics.active_clients ?? 0}
          </div>
          <div className="metric-card__label">Active clients</div>
          <div className="metric-card__sub">
            {metrics.new_clients_this_month > 0
              ? `${metrics.new_clients_this_month} new this month`
              : "No new clients this month"}
          </div>
        </div>
      </div>

      <div className="dashboard__grid">
        <div className="dash-card dash-card--kanban">
          <div className="dash-card__header">
            <h2 className="dash-card__title">Tasks across all projects</h2>
            <button
              className="dash-card__link"
              onClick={() => navigate("/projects")}
            >
              All projects →
            </button>
          </div>

          <div className="kanban-overview">
            {KANBAN_COLS.map((col) => {
              const tasks = kanban_overview.tasks?.[col.id] || [];
              const count = kanban_overview.counts?.[col.id] || 0;
              return (
                <div key={col.id} className="kanban-col">
                  <div className="kanban-col__header">
                    <div
                      className="kanban-col__dot"
                      style={{ background: col.color }}
                    />
                    <span className="kanban-col__label">{col.label}</span>
                    <span className="kanban-col__count">{count}</span>
                  </div>

                  <div className="kanban-col__tasks">
                    {tasks.length === 0 ? (
                      <div className="kanban-col__empty">No tasks</div>
                    ) : (
                      tasks.map((task) => (
                        <div
                          key={task.id}
                          className="ktask"
                          onClick={() =>
                            navigate(`/projects/${task.project_id}`)
                          }
                        >
                          <div
                            className="ktask__priority"
                            style={{
                              background: PRIORITY_COLORS[task.priority],
                            }}
                          />
                          <div className="ktask__body">
                            <p
                              className={`ktask__title ${
                                col.id === "completed"
                                  ? "ktask__title--done"
                                  : ""
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="ktask__foot">
                              <span
                                className="ktask__badge"
                                style={{
                                  color: PRIORITY_COLORS[task.priority],
                                  background: `${PRIORITY_COLORS[task.priority]}18`,
                                }}
                              >
                                {task.priority}
                              </span>
                              {task.due_date && col.id !== "completed" && (
                                <span
                                  className={`ktask__due ${
                                    task.overdue ? "ktask__due--red" : ""
                                  }`}
                                >
                                  {task.overdue
                                    ? "Overdue"
                                    : new Date(
                                        task.due_date,
                                      ).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {count > tasks.length && (
                      <div
                        className="kanban-col__more"
                        onClick={() => navigate("/projects")}
                      >
                        +{count - tasks.length} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dash-card dash-card--focus">
          <div className="dash-card__header">
            <h2 className="dash-card__title">Today's focus</h2>
            <span className="dash-card__subtitle">
              {doneCount} of {totalCount} done
            </span>
          </div>

          <div className="focus-progress">
            <div className="focus-progress__bar">
              <div
                className="focus-progress__fill"
                style={{ width: `${focusPct}%` }}
              />
            </div>
            <span className="focus-progress__pct">{focusPct}%</span>
          </div>

          <div className="focus-list">
            {focusItems.length === 0 ? (
              <div className="focus-empty">
                Nothing due today. Add something below.
              </div>
            ) : (
              focusItems.map((item) => {
                const src = SOURCE_COLORS[item.source] || SOURCE_COLORS.manual;
                const isManual = item.type === "manual";
                return (
                  <div
                    key={item.id}
                    className={`focus-item ${item.done ? "focus-item--done" : ""}`}
                  >
                    <button
                      className={`focus-item__check ${
                        item.done ? "focus-item__check--done" : ""
                      }`}
                      onClick={() => {
                        if (isManual) {
                          handleToggleTodo({
                            id: item._todoId,
                            done: item.done,
                          });
                        }
                      }}
                      disabled={!isManual}
                      title={!isManual ? "Complete from project" : ""}
                    >
                      {item.done && <div className="focus-item__tick" />}
                    </button>

                    <div className="focus-item__body">
                      <p
                        className={`focus-item__text ${
                          item.done ? "focus-item__text--done" : ""
                        } ${item.overdue ? "focus-item__text--overdue" : ""}`}
                      >
                        {item.text}
                      </p>
                      <p className="focus-item__meta">{item.meta}</p>
                    </div>

                    <div className="focus-item__right">
                      <span
                        className="focus-item__source"
                        style={{ background: src.bg, color: src.color }}
                      >
                        {src.label}
                      </span>
                      {isManual && !item.done && (
                        <button
                          className="focus-item__delete"
                          onClick={() => handleDeleteTodo(item._todoId)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add manual item */}
          {addingTodo ? (
            <form className="focus-add-form" onSubmit={handleAddTodo}>
              <input
                ref={todoInputRef}
                className="focus-add-input"
                type="text"
                placeholder="What else needs doing today?"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                autoFocus
              />
              <div className="focus-add-actions">
                <button
                  type="submit"
                  className="focus-add-btn focus-add-btn--save"
                >
                  Add
                </button>
                <button
                  type="button"
                  className="focus-add-btn focus-add-btn--cancel"
                  onClick={() => {
                    setAdding(false);
                    setNewTodo("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              className="focus-add-trigger"
              onClick={() => setAdding(true)}
            >
              + Add to today's focus
            </button>
          )}
        </div>

        <div className="dash-card dash-card--chart">
          <div className="dash-card__header">
            <h2 className="dash-card__title">Revenue vs pipeline</h2>
            <button
              className="dash-card__link"
              onClick={() => navigate("/finance/revenue")}
            >
              Finance →
            </button>
          </div>

          <div className="chart-legend">
            <div className="chart-legend__item">
              <span
                className="chart-legend__dot"
                style={{ background: "#8B2A2A" }}
              />
              Won
            </div>
            <div className="chart-legend__item">
              <span
                className="chart-legend__dot"
                style={{ background: "#EDE0D4" }}
              />
              Pipeline
            </div>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={revenue_chart} barGap={2} barCategoryGap="25%">
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#8A7060",
                  }}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="pipeline" name="Pipeline" radius={[3, 3, 0, 0]}>
                  {revenue_chart.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.current ? "#D9CBC0" : "#EDE0D4"}
                    />
                  ))}
                </Bar>
                <Bar dataKey="won" name="Won" radius={[3, 3, 0, 0]}>
                  {revenue_chart.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.current ? "#A84040" : "#8B2A2A"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-card dash-card--pipeline">
          <div className="dash-card__header">
            <h2 className="dash-card__title">Sales pipeline</h2>
            <button
              className="dash-card__link"
              onClick={() => navigate("/sales/pipeline")}
            >
              Full view →
            </button>
          </div>

          <div className="pipeline-rows">
            {pipeline_summary
              .filter((s) => s.count > 0)
              .map((stage) => (
                <div key={stage.status} className="pipeline-row">
                  <div
                    className="pipeline-row__dot"
                    style={{ background: stage.color }}
                  />
                  <span className="pipeline-row__label">{stage.label}</span>
                  <span className="pipeline-row__count">{stage.count}</span>
                  <div className="pipeline-row__bar">
                    <div
                      className="pipeline-row__fill"
                      style={{
                        width: `${stage.percentage}%`,
                        background: stage.color,
                      }}
                    />
                  </div>
                  <span className="pipeline-row__value">
                    {formatCurrency(stage.value)}
                  </span>
                </div>
              ))}
            {pipeline_summary.every((s) => s.count === 0) && (
              <div className="dash-card__empty">No active deals</div>
            )}
          </div>
        </div>

        <div className="dash-card dash-card--events">
          <div className="dash-card__header">
            <h2 className="dash-card__title">Coming up</h2>
            <button
              className="dash-card__link"
              onClick={() => navigate("/calendar")}
            >
              Calendar →
            </button>
          </div>

          {upcoming_events.length === 0 ? (
            <div className="dash-card__empty">No events in the next 7 days</div>
          ) : (
            <div className="event-rows">
              {upcoming_events.map((event) => (
                <div
                  key={event.id}
                  className="event-row"
                  onClick={() => navigate("/calendar")}
                >
                  <div
                    className="event-row__dot"
                    style={{ background: event.color }}
                  />
                  <div className="event-row__body">
                    <span className="event-row__title">{event.title}</span>
                    <span className="event-row__time">
                      {formatEventTime(event)}
                    </span>
                  </div>
                  <span className="event-row__when">
                    {formatEventDate(event)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
