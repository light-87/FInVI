import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Agent } from "@/types/database";
import Link from "next/link";
import { AgentEditForm } from "./agent-edit-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: agent } = (await supabase
    .from("agents")
    .select("name")
    .eq("id", id)
    .single()) as { data: { name: string } | null };

  return {
    title: agent ? `Edit ${agent.name} | AI Trading Arena` : "Edit Agent | AI Trading Arena",
  };
}

export default async function EditAgentPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch agent
  const { data: agent } = (await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()) as { data: Agent | null };

  if (!agent) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/agents/${id}`}
          className="text-sm text-text-tertiary hover:text-text-secondary mb-2 inline-block"
        >
          &larr; Back to Agent
        </Link>
        <h1 className="text-3xl font-bold font-display text-text-primary">
          Edit Agent
        </h1>
        <p className="text-text-secondary mt-2">
          Update your agent&apos;s configuration and settings.
        </p>
      </div>

      {/* Form */}
      <AgentEditForm agent={agent} />
    </div>
  );
}
