// components/courses/lesson-manager.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lesson } from "@prisma/client";
import { Plus, Pencil, Trash2, Save, X, GripVertical, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface LessonManagerProps {
  courseId: string;
  lessons: Lesson[];
}

type LessonDraft = {
  title: string;
  content: string;
  duration: number | "";
  videoUrl: string;
};

const emptyDraft: LessonDraft = { title: "", content: "", duration: "", videoUrl: "" };

export function LessonManager({ courseId, lessons: initialLessons }: LessonManagerProps) {
  const router = useRouter();
  const [lessons, setLessons] = useState(initialLessons);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LessonDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const startEdit = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setAddingNew(false);
    setDraft({
      title: lesson.title,
      content: lesson.content,
      duration: lesson.duration ?? "",
      videoUrl: lesson.videoUrl ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAddingNew(false);
    setDraft(emptyDraft);
  };

  const saveLesson = async (lessonId?: string) => {
    if (!draft.title.trim() || !draft.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: draft.title,
        content: draft.content,
        duration: draft.duration ? Number(draft.duration) : undefined,
        videoUrl: draft.videoUrl || undefined,
        order: lessonId ? lessons.find((l) => l.id === lessonId)?.order : lessons.length + 1,
        ...(!lessonId && { courseId }),
      };

      const res = await fetch(lessonId ? `/api/lessons/${lessonId}` : "/api/lessons", {
        method: lessonId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error ?? "Failed to save lesson", variant: "destructive" });
        return;
      }
      toast({ title: lessonId ? "Lesson updated!" : "Lesson added!", variant: "success" });
      cancelEdit();
      router.refresh();
      // Optimistic update
      if (lessonId) {
        setLessons((prev) => prev.map((l) => (l.id === lessonId ? data.data : l)));
      } else {
        setLessons((prev) => [...prev, data.data]);
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    setDeletingId(lessonId);
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast({ title: data.error ?? "Failed to delete", variant: "destructive" });
        return;
      }
      toast({ title: "Lesson deleted", variant: "success" });
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      router.refresh();
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const LessonDraftForm = ({ onSave, lessonId }: { onSave: () => void; lessonId?: string }) => (
    <div className="p-5 space-y-4 border-t border-white/5 bg-white/[0.02]">
      <div className="space-y-1.5">
        <Label>Title *</Label>
        <Input
          placeholder="e.g. Introduction to React Hooks"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label>Content * (Markdown supported)</Label>
        <Textarea
          rows={10}
          placeholder="# Lesson Title&#10;&#10;Write your lesson content in Markdown..."
          value={draft.content}
          onChange={(e) => setDraft({ ...draft, content: e.target.value })}
          className="font-mono text-xs"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Duration (minutes)</Label>
          <Input
            type="number"
            min="1"
            max="300"
            placeholder="30"
            value={draft.duration}
            onChange={(e) => setDraft({ ...draft, duration: e.target.value ? parseInt(e.target.value) : "" })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Video URL (YouTube)</Label>
          <Input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={draft.videoUrl}
            onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>
          <X className="h-3.5 w-3.5" /> Cancel
        </Button>
        <Button size="sm" onClick={() => saveLesson(lessonId)} loading={saving}>
          <Save className="h-3.5 w-3.5" />
          {lessonId ? "Save Changes" : "Add Lesson"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {lessons.length === 0 && !addingNew && (
        <div className="forge-card p-10 text-center">
          <p className="text-slate-400 font-medium">No lessons yet</p>
          <p className="text-sm text-slate-600 mt-1 mb-4">Add your first lesson to get started</p>
        </div>
      )}

      {lessons.map((lesson, idx) => (
        <div key={lesson.id} className="forge-card overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <GripVertical className="h-4 w-4 text-slate-700 cursor-grab shrink-0" />
            <span className="h-6 w-6 rounded-md bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{lesson.title}</p>
              {lesson.duration && (
                <p className="text-xs text-slate-500">{lesson.duration} min</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
              >
                {expandedId === lesson.id ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-white"
                onClick={() => startEdit(lesson)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-red-400"
                onClick={() => deleteLesson(lesson.id)}
                disabled={deletingId === lesson.id}
              >
                {deletingId === lesson.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Preview */}
          {expandedId === lesson.id && editingId !== lesson.id && (
            <div className="px-4 pb-4 border-t border-white/5 pt-3">
              <p className="text-xs text-slate-500 line-clamp-3 font-mono leading-relaxed">
                {lesson.content.slice(0, 300)}...
              </p>
            </div>
          )}

          {/* Edit form */}
          {editingId === lesson.id && (
            <LessonDraftForm onSave={() => saveLesson(lesson.id)} lessonId={lesson.id} />
          )}
        </div>
      ))}

      {/* Add new lesson form */}
      {addingNew && (
        <div className="forge-card overflow-hidden border-indigo-500/20">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-400" />
            <p className="text-sm font-semibold text-indigo-300">New Lesson</p>
          </div>
          <LessonDraftForm onSave={() => saveLesson()} />
        </div>
      )}

      {/* Add button */}
      {!addingNew && (
        <Button
          variant="outline"
          className="w-full border-dashed border-white/20 hover:border-indigo-500/40 hover:text-indigo-300 gap-2"
          onClick={() => {
            setAddingNew(true);
            setEditingId(null);
            setDraft(emptyDraft);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Lesson
        </Button>
      )}
    </div>
  );
}
