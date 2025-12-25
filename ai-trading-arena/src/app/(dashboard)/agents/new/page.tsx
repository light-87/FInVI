import { AgentCreatorForm } from "./agent-creator-form";

export const metadata = {
  title: "Create Agent | Vivy",
  description: "Create a new AI trading agent",
};

export default function NewAgentPage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-text-primary">
          Create New Agent
        </h1>
        <p className="text-text-secondary mt-2">
          Configure your AI trading agent with a custom strategy and risk
          parameters.
        </p>
      </div>

      {/* Form */}
      <AgentCreatorForm />
    </div>
  );
}
