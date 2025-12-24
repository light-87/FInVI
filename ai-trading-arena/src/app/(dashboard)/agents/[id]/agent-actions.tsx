"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AgentActionsProps {
  agentId: string;
  agentName: string;
  status: "active" | "paused" | "archived";
}

export function AgentActions({ agentId, agentName, status }: AgentActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Failed to delete agent");
      }

      router.push("/agents");
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete agent");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = status === "active" ? "paused" : "active";
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Failed to update status");
      }

      router.refresh();
    } catch (err) {
      console.error("Status update error:", err);
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Status Toggle */}
        <button
          onClick={handleStatusToggle}
          disabled={isUpdatingStatus}
          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            status === "active"
              ? "border-warning text-warning hover:bg-warning/10"
              : "border-profit text-profit hover:bg-profit/10"
          } disabled:opacity-50`}
        >
          {isUpdatingStatus
            ? "Updating..."
            : status === "active"
            ? "Pause Agent"
            : "Activate Agent"}
        </button>

        {/* Edit Button */}
        <Link
          href={`/agents/${agentId}/edit`}
          className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:border-border-active hover:text-text-primary transition-colors"
        >
          Edit
        </Link>

        {/* Delete Button */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 text-sm font-medium text-loss border border-loss/30 rounded-lg hover:bg-loss/10 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-surface border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Delete Agent
            </h3>
            <p className="text-text-secondary mb-4">
              Are you sure you want to delete{" "}
              <span className="font-medium text-text-primary">{agentName}</span>?
              This action cannot be undone. All associated trades and data will be
              permanently deleted.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium bg-loss text-white rounded-lg hover:bg-loss/80 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Agent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
