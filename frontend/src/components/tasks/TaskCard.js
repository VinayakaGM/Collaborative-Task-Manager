import React, { useState } from "react";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  formatDate,
  isOverdue,
  getInitials,
  timeAgo,
} from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TaskContext";
import toast from "react-hot-toast";

export default function TaskCard({ task, onEdit, onDelete, dragHandleProps }) {
  const { user, isManager } = useAuth();
  const { updateStatus } = useTasks();
  const [statusLoading, setStatusLoading] = useState(false);

  const sCfg = STATUS_CONFIG[task.status] || {};
  const pCfg = PRIORITY_CONFIG[task.priority] || {};
  const overdue = isOverdue(task.dueDate, task.status);
  const isAssignedToMe =
    task.assignedTo?._id === user?._id || task.assignedTo === user?._id;

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatusLoading(true);
    try {
      await updateStatus(task._id, newStatus);
      toast.success(`Status → ${STATUS_CONFIG[newStatus]?.label}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const canChangeStatus = isManager || isAssignedToMe;

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: 18,
        borderLeft: `4px solid ${pCfg.color}`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        outline: overdue ? "1px solid #ef444430" : "none",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {dragHandleProps && (
          <span
            {...dragHandleProps}
            className="drag-handle"
            style={{ paddingTop: 2, cursor: "grab" }}
          >
            <IconGrip />
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--text-primary)",
              marginBottom: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {task.description}
            </p>
          )}
        </div>

        {/* Actions */}
        {isManager && (
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => onEdit(task)}
              style={{
                padding: "5px 8px",
                borderRadius: 6,
                border: "1.5px solid var(--border)",
                background: "var(--bg-secondary)",
                cursor: "pointer",
                color: "var(--text-secondary)",
                fontSize: 12,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(task._id)}
              style={{
                padding: "5px 8px",
                borderRadius: 6,
                border: "1.5px solid var(--border)",
                background: "var(--bg-secondary)",
                cursor: "pointer",
                color: "var(--text-secondary)",
                fontSize: 12,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#ef4444";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Badges row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          alignItems: "center",
        }}
      >
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 12,
            background: pCfg.bg,
            color: pCfg.color,
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "Syne, sans-serif",
            textTransform: "uppercase",
          }}
        >
          {task.priority}
        </span>
        {task.tags?.map((tag) => (
          <span
            key={tag}
            style={{
              padding: "2px 7px",
              borderRadius: 10,
              background: "var(--accent-soft)",
              color: "var(--accent)",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            #{tag}
          </span>
        ))}
        {overdue && (
          <span
            style={{
              padding: "2px 7px",
              borderRadius: 10,
              background: "#fee2e2",
              color: "#ef4444",
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "Syne, sans-serif",
            }}
          >
            OVERDUE
          </span>
        )}
      </div>

      {/* Status selector */}
      {canChangeStatus ? (
        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={statusLoading}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "Syne, sans-serif",
            border: `1.5px solid ${sCfg.color}30`,
            background: sCfg.bg,
            color: sCfg.color,
            cursor: "pointer",
            outline: "none",
            width: "100%",
            appearance: "none",
          }}
        >
          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val}>
              {cfg.label}
            </option>
          ))}
        </select>
      ) : (
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "Syne, sans-serif",
            background: sCfg.bg,
            color: sCfg.color,
            display: "inline-block",
          }}
        >
          {sCfg.label}
        </span>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 4,
          borderTop: "1px solid var(--border)",
        }}
      >
        {/* Assignee */}
        {task.assignedTo && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 9,
                fontWeight: 700,
              }}
            >
              {getInitials(task.assignedTo.name)}
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {task.assignedTo.name}
            </span>
          </div>
        )}

        {/* Due date */}
        {task.dueDate && (
          <span
            style={{
              fontSize: 11,
              color: overdue ? "#ef4444" : "var(--text-muted)",
              fontWeight: overdue ? 700 : 400,
            }}
          >
            📅 {formatDate(task.dueDate)}
          </span>
        )}

        {/* Updated */}
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {timeAgo(task.updatedAt)}
        </span>
      </div>
    </div>
  );
}

function IconGrip() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="6" r="2" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="9" cy="18" r="2" />
      <circle cx="15" cy="18" r="2" />
    </svg>
  );
}
