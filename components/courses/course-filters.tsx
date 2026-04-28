// components/courses/course-filters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface CourseFiltersProps {
  categories: readonly FilterOption[];
  levels: readonly FilterOption[];
  activeCategory?: string;
  activeLevel?: string;
  search?: string;
}

export function CourseFilters({
  categories,
  levels,
  activeCategory,
  activeLevel,
  search: initialSearch,
}: CourseFiltersProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(initialSearch ?? "");
  const [isPending, startTransition] = useTransition();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => router.push(`/courses?${params.toString()}`));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", searchValue || null);
  };

  const clearAll = () => {
    setSearchValue("");
    startTransition(() => router.push("/courses"));
  };

  const hasFilters = activeCategory || activeLevel || initialSearch;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search courses..."
            className="pl-10"
          />
        </form>
      </div>

      {/* Category */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Category
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter("category", null)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
              !activeCategory
                ? "bg-indigo-500/10 text-indigo-300 font-medium"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() =>
                updateFilter("category", activeCategory === cat.value ? null : cat.value)
              }
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                activeCategory === cat.value
                  ? "bg-indigo-500/10 text-indigo-300 font-medium"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Level
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter("level", null)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
              !activeLevel
                ? "bg-indigo-500/10 text-indigo-300 font-medium"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}
          >
            All Levels
          </button>
          {levels.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() =>
                updateFilter("level", activeLevel === lvl.value ? null : lvl.value)
              }
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                activeLevel === lvl.value
                  ? "bg-indigo-500/10 text-indigo-300 font-medium"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="w-full gap-1.5 text-slate-400">
          <X className="h-3.5 w-3.5" /> Clear filters
        </Button>
      )}
    </div>
  );
}
