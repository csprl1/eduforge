// types/index.ts
import type { User, Course, Lesson, Enrollment, Quiz, Review } from "@prisma/client";

export type UserWithCounts = User & {
  _count: {
    courses: number;
    enrollments: number;
  };
};

export type CourseWithAuthorAndCounts = Course & {
  author: Pick<User, "id" | "name" | "image">;
  _count: {
    lessons: number;
    enrollments: number;
    reviews: number;
  };
  lessons?: Lesson[];
  enrollments?: Enrollment[];
  averageRating?: number;
};

export type LessonWithProgress = Lesson & {
  completed?: boolean;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type QuizWithQuestions = Quiz & {
  questions: QuizQuestion[];
  _count?: {
    attempts: number;
  };
};

export type EnrollmentWithCourse = Enrollment & {
  course: CourseWithAuthorAndCounts;
};

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">;
};

export type DashboardStats = {
  totalCourses: number;
  totalEnrollments: number;
  totalStudents: number;
  totalRevenue: number;
  recentEnrollments: (Enrollment & {
    user: Pick<User, "id" | "name" | "email" | "image">;
    course: Pick<Course, "id" | "title">;
  })[];
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};
