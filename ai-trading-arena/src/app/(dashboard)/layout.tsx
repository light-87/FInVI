import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/DashboardNav";
import type { User } from "@/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single() as { data: User | null };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav
        user={{
          email: user.email ?? "",
          displayName: profile?.display_name ?? "User",
          credits: profile?.credits_remaining ?? 0,
        }}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
