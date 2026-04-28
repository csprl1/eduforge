// components/admin/admin-actions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { ChevronDown, Shield, GraduationCap, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminActionsProps {
  userId: string;
  currentRole: string;
}

const roles = [
  { value: "STUDENT", label: "Student", icon: GraduationCap },
  { value: "INSTRUCTOR", label: "Instructor", icon: Presentation },
  { value: "ADMIN", label: "Admin", icon: Shield },
];

export function AdminActions({ userId, currentRole }: AdminActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const changeRole = async (newRole: string) => {
    if (newRole === currentRole) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast({ title: data.error ?? "Failed to update role", variant: "destructive" });
        return;
      }
      toast({ title: `Role updated to ${newRole}`, variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs gap-1"
        onClick={() => setOpen(!open)}
        disabled={loading}
      >
        Role <ChevronDown className="h-3 w-3" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-white/10 bg-slate-900 shadow-xl z-50 overflow-hidden">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => changeRole(role.value)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors",
                  currentRole === role.value
                    ? "text-indigo-300 bg-indigo-500/10"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <role.icon className="h-3.5 w-3.5" />
                {role.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
