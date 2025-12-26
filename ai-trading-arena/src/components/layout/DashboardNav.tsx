"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface DashboardNavProps {
  user: {
    email: string;
    displayName: string;
    credits: number;
  };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/agents", label: "My Agents" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <nav className="border-b border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icons/logo/vivy-logo.svg" width={28} height={28} alt="Vivy" />
            <span className="text-xl font-bold font-display text-primary">
              Vivy
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Credits */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated border border-border">
              <span className="text-text-tertiary text-sm">Credits:</span>
              <span className="text-primary font-mono font-bold">
                {user.credits}
              </span>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">
                  {user.displayName}
                </p>
                <p className="text-xs text-text-tertiary">{user.email}</p>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={signOut}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-loss border border-border hover:border-loss rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
