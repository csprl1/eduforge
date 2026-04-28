// components/courses/course-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toaster";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/lib/utils";
import { Save, Eye, EyeOff, Tag, X } from "lucide-react";

interface CourseFormProps {
  courseId?: string;
  defaultValues?: {
    title?: string;
    description?: string;
    category?: string;
    level?: string;
    tags?: string[];
    price?: number;
    published?: boolean;
    thumbnail?: string;
  };
}

export function CourseForm({ courseId, defaultValues }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: defaultValues?.title ?? "",
    description: defaultValues?.description ?? "",
    category: defaultValues?.category ?? "WEB_DEVELOPMENT",
    level: defaultValues?.level ?? "BEGINNER",
    tags: defaultValues?.tags ?? [] as string[],
    price: defaultValues?.price ?? 0,
    published: defaultValues?.published ?? false,
    thumbnail: defaultValues?.thumbnail ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title || form.title.length < 5) errs.title = "Title must be at least 5 characters";
    if (!form.description || form.description.length < 20) errs.description = "Description must be at least 20 characters";
    if (form.price < 0) errs.price = "Price cannot be negative";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   if (!validate()) {
  toast({
    title: "Please complete required fields",
    variant: "destructive",
  });
  return;
}
    setLoading(true);

    try {
      const res = await fetch(courseId ? `/api/courses/${courseId}` : "/api/courses", {
        method: courseId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        toast({ title: data.error ?? "Failed to save course", variant: "destructive" });
        return;
      }

      toast({
        title: courseId ? "Course updated!" : "Course created!",
        variant: "success",
      });
      router.push(`/courses/${data.data.id}`);
      router.refresh();
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="forge-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Basic Info</h2>

        <div className="space-y-1.5">
          <Label htmlFor="title">Course Title *</Label>
          <Input
            id="title"
            placeholder="e.g. Next.js 15 Mastery: From Zero to Production"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            rows={5}
            placeholder="Describe what students will learn, prerequisites, and what makes this course unique..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <p className="text-xs text-slate-600">{form.description.length}/2000 characters</p>
          {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="thumbnail">Thumbnail URL</Label>
          <Input
            id="thumbnail"
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={form.thumbnail}
            onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
          />
          <p className="text-xs text-slate-600">Paste an image URL (Unsplash, Cloudinary, etc.)</p>
        </div>
      </div>

      {/* Category, Level, Price */}
      <div className="forge-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Course Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Level *</Label>
            <Select
              value={form.level}
              onValueChange={(v) => setForm({ ...form, level: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_LEVELS.map((lvl) => (
                  <SelectItem key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            max="9999"
            step="0.01"
            placeholder="0 for free"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
            className="w-40"
          />
          {errors.price && <p className="text-xs text-red-400">{errors.price}</p>}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon" onClick={addTag}>
              <Tag className="h-4 w-4" />
            </Button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-600">{form.tags.length}/10 tags</p>
        </div>
      </div>

      {/* Publish */}
      <div className="forge-card p-6">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Visibility</h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setForm({ ...form, published: false })}
            className={`flex-1 flex items-center gap-2.5 p-4 rounded-xl border transition-all ${
              !form.published
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
            }`}
          >
            <EyeOff className="h-4 w-4" />
            <div className="text-left">
              <p className="text-sm font-semibold">Draft</p>
              <p className="text-xs opacity-70">Only you can see it</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, published: true })}
            className={`flex-1 flex items-center gap-2.5 p-4 rounded-xl border transition-all ${
              form.published
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
            }`}
          >
            <Eye className="h-4 w-4" />
            <div className="text-left">
              <p className="text-sm font-semibold">Published</p>
              <p className="text-xs opacity-70">Visible to all students</p>
            </div>
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : courseId ? "Save Changes" : "Create Course"}
        </Button>
      </div>
    </form>
  );
}
