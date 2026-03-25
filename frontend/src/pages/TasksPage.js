import React, { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTasks } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  getErrorMessage,
} from "../utils/helpers";
import TaskCard from "../components/tasks/TaskCard";
import TaskFormModal from "../components/tasks/TaskFormModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import toast from "react-hot-toast";
import { useDroppable } from "@dnd-kit/core";

const STATUSES = ["todo", "in-progress", "review", "completed"];

export default function TasksPage() {
  const {
    tasks,
    loading,
    filters,
    setFilters,
    fetchTasks,
    deleteTask,
    reorderTasks,
    pagination,
  } = useTasks();
  const { isManager } = useAuth();
  const [view, setView] = useState("list"); // 'list' | 'kanban'
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [activeId, setActiveId] = useState(null);

  ///added for kanban
  const { updateStatus } = useTasks(); // 👈 ADD THIS

  //before
  // const handleKanbanDragEnd = async (event) => {
  //   const { active, over } = event;
  //   setActiveId(null);

  //   if (!over) return;

  //   const task = tasks.find((t) => t._id === active.id);
  //   const newStatus = over.id;

  //   if (!task || task.status === newStatus) return;

  //   try {
  //     await updateStatus(task._id, newStatus);
  //     toast.success("Task moved");
  //   } catch (err) {
  //     toast.error(getErrorMessage(err));
  //   }
  // };

  //after
  const handleKanbanDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const task = tasks.find((t) => t._id === active.id);
    if (!task) return;

    // Update the status of the task to the new column
    const newStatus = over.id; // DroppableColumn id = status
    if (task.status === newStatus) return;

    try {
      await updateStatus(task._id, newStatus); // call your TaskContext updateStatus
      toast.success(`Task moved to ${STATUS_CONFIG[newStatus].label}`);
    } catch (err) {
      toast.error("Failed to move task");
    }
  };
  ///added for kanban

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDelete = async () => {
    try {
      await deleteTask(deleteId);
      toast.success("Task deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteId(null);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t._id === active.id);
    const newIndex = tasks.findIndex((t) => t._id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    await reorderTasks(reordered);
  };

  const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;

  // Kanban columns
  const columns = useMemo(
    () =>
      STATUSES.map((s) => ({
        status: s,
        ...STATUS_CONFIG[s],
        tasks: tasks.filter((t) => t.status === s),
      })),
    [tasks],
  );

  return (
    <div
      style={{
        padding: "32px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: 28,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            Tasks
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {pagination.total} task{pagination.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* View toggle */}
          <div
            style={{
              display: "flex",
              background: "var(--bg-card)",
              border: "1.5px solid var(--border)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {[
              ["list", "☰ List"],
              ["kanban", "⊞ Kanban"],
            ].map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "7px 14px",
                  border: "none",
                  cursor: "pointer",
                  background: view === v ? "var(--accent)" : "transparent",
                  color: view === v ? "white" : "var(--text-secondary)",
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {isManager && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditTask(null);
                setShowForm(true);
              }}
            >
              + New Task
            </button>
          )}
        </div>
      </div>

      {/* Filters bar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          className="input"
          placeholder="🔍 Search tasks..."
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
          style={{ maxWidth: 220 }}
        />
        <select
          className="input"
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value }))
          }
          style={{ maxWidth: 150 }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={filters.priority}
          onChange={(e) =>
            setFilters((f) => ({ ...f, priority: e.target.value }))
          }
          style={{ maxWidth: 150 }}
        >
          <option value="">All Priorities</option>
          {["low", "medium", "high", "urgent"].map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
        {(filters.search || filters.status || filters.priority) && (
          <button
            className="btn btn-secondary"
            onClick={() => setFilters({ status: "", priority: "", search: "" })}
            style={{ fontSize: 12 }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : tasks.length === 0 ? (
        <EmptyState isManager={isManager} onNew={() => setShowForm(true)} />
      ) : view === "list" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active }) => setActiveId(active.id)}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 14,
              }}
              className="stagger-children"
            >
              {tasks.map((task) => (
                <SortableTaskCard
                  key={task._id}
                  task={task}
                  onEdit={(t) => {
                    setEditTask(t);
                    setShowForm(true);
                  }}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeTask && (
              <div
                style={{
                  opacity: 0.85,
                  transform: "rotate(2deg)",
                  pointerEvents: "none",
                }}
              >
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        // <KanbanView
        //   columns={columns}
        //   onEdit={(t) => {
        //     setEditTask(t);
        //     setShowForm(true);
        //   }}
        //   onDelete={(id) => setDeleteId(id)}
        // />

        ///added for kanban
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active }) => setActiveId(active.id)}
          onDragEnd={handleKanbanDragEnd} // we'll create this next
        >
          <KanbanView
            columns={columns}
            onEdit={(t) => {
              setEditTask(t);
              setShowForm(true);
            }}
            onDelete={(id) => setDeleteId(id)}
          />
          <DragOverlay>
            {activeTask && (
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            )}
          </DragOverlay>
        </DndContext>

        ///added for kanban
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            paddingTop: 24,
            marginTop: "auto",
          }}
        >
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => fetchTasks(p)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: "1.5px solid var(--border)",
                  background:
                    p === pagination.page ? "var(--accent)" : "var(--bg-card)",
                  color:
                    p === pagination.page ? "white" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {p}
              </button>
            ),
          )}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <TaskFormModal
          task={editTask}
          onClose={() => {
            setShowForm(false);
            setEditTask(null);
          }}
        />
      )}
      {deleteId && (
        <ConfirmDialog
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

// Sortable wrapper
function SortableTaskCard({ task, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : "auto",
  };
  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// Kanban view

//added for kanban
function DroppableColumn({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 100,
        background: isOver ? "rgba(99,102,241,0.08)" : "transparent",
        borderRadius: 8,
        transition: "0.2s",
      }}
    >
      {children}
    </div>
  );
}

//added for kanban
//before
// function KanbanView({ columns, onEdit, onDelete }) {
//   return (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: "repeat(4, 1fr)",
//         gap: 16,
//         flex: 1,
//         overflowX: "auto",
//         minWidth: 0,
//       }}
//     >
//       {columns.map(({ status, label, color, bg, tasks }) => (
//         <div
//           key={status}
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             gap: 10,
//             minWidth: 220,
//           }}
//         >
//           {/* Column header */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               padding: "8px 12px",
//               borderRadius: 8,
//               background: bg,
//             }}
//           >
//             <span
//               style={{
//                 fontFamily: "Syne, sans-serif",
//                 fontWeight: 700,
//                 fontSize: 13,
//                 color,
//               }}
//             >
//               {label}
//             </span>
//             <span
//               style={{
//                 width: 22,
//                 height: 22,
//                 borderRadius: "50%",
//                 background: `${color}20`,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontSize: 11,
//                 fontWeight: 800,
//                 color,
//               }}
//             >
//               {tasks.length}
//             </span>
//           </div>

//           {/* Task cards */}
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               gap: 8,
//               flex: 1,
//             }}
//           >
//             {tasks.length === 0 ? (
//               <div
//                 style={{
//                   padding: "24px 12px",
//                   textAlign: "center",
//                   borderRadius: 10,
//                   border: `2px dashed ${color}30`,
//                   color: "var(--text-muted)",
//                   fontSize: 12,
//                 }}
//               >
//                 Drop tasks here
//               </div>
//             ) : (
//               tasks.map((task) => (
//                 <TaskCard
//                   key={task._id}
//                   task={task}
//                   onEdit={onEdit}
//                   onDelete={onDelete}
//                 />
//               ))
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

//added for kanban after
function KanbanView({ columns, onEdit, onDelete }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        flex: 1,
        overflowX: "auto",
        minWidth: 0,
      }}
    >
      {columns.map(({ status, label, color, bg, tasks }) => (
        <DroppableColumn id={status} key={status}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minWidth: 220,
            }}
          >
            {/* Column header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: 8,
                background: bg,
              }}
            >
              <span
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: `${color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  color,
                }}
              >
                {tasks.length}
              </span>
            </div>

            {/* Task cards */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                flex: 1,
              }}
            >
              {tasks.length === 0 ? (
                <div
                  style={{
                    padding: "24px 12px",
                    textAlign: "center",
                    borderRadius: 10,
                    border: `2px dashed ${color}30`,
                    color: "var(--text-muted)",
                    fontSize: 12,
                  }}
                >
                  Drop tasks here
                </div>
              ) : (
                tasks.map((task) => (
                  <SortableTaskCard
                    key={task._id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </div>
        </DroppableColumn>
      ))}
    </div>
  );
}

function LoadingSkeleton({ count = 6 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 14,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card animate-pulse-slow"
          style={{ height: 180 }}
        />
      ))}
    </div>
  );
}

function EmptyState({ isManager, onNew }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        color: "var(--text-muted)",
      }}
    >
      <div style={{ fontSize: 56 }}>📋</div>
      <h3
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "var(--text-primary)",
        }}
      >
        No tasks found
      </h3>
      <p style={{ fontSize: 14, textAlign: "center", maxWidth: 300 }}>
        {isManager
          ? "Create your first task to get started."
          : "No tasks have been assigned to you yet."}
      </p>
      {isManager && (
        <button className="btn btn-primary" onClick={onNew}>
          + Create First Task
        </button>
      )}
    </div>
  );
}
