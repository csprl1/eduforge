// lib/validations.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  role: z.enum(["STUDENT", "INSTRUCTOR"]).default("STUDENT"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const courseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000),
  category: z.enum([
    "WEB_DEVELOPMENT",
    "DATA_SCIENCE",
    "AI_ML",
    "DESIGN",
    "BUSINESS",
    "MARKETING",
    "DEVOPS",
    "MOBILE",
    "OTHER",
  ]),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  tags: z.array(z.string()).max(10).default([]),
  price: z.number().min(0).max(9999).default(0),
  published: z.boolean().default(false),
  thumbnail: z.string().url().optional().or(z.literal("")),
});

export const lessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  content: z.string().min(10, "Content must be at least 10 characters"),
  videoUrl: z.string().url().optional().or(z.literal("")),
  duration: z.number().min(1).max(300).optional(),
  order: z.number().min(1),
  published: z.boolean().default(true),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
