// prisma/seed.ts
import { PrismaClient, Role, CourseLevel, CourseCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@eduforge.dev" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@eduforge.dev",
      password: adminPassword,
      role: Role.ADMIN,
      bio: "Platform administrator",
    },
  });

  // Create instructor
  const instructorPassword = await bcrypt.hash("Instructor@123", 12);
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@eduforge.dev" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "instructor@eduforge.dev",
      password: instructorPassword,
      role: Role.INSTRUCTOR,
      bio: "Full-stack developer with 10 years of experience. Passionate about teaching modern web technologies.",
    },
  });

  // Create student
  const studentPassword = await bcrypt.hash("Student@123", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@eduforge.dev" },
    update: {},
    create: {
      name: "John Doe",
      email: "student@eduforge.dev",
      password: studentPassword,
      role: Role.STUDENT,
      bio: "Aspiring web developer",
    },
  });

  // Create sample courses
  const course1 = await prisma.course.upsert({
    where: { slug: "nextjs-mastery-2024" },
    update: {},
    create: {
      title: "Next.js 15 Mastery: From Zero to Production",
      slug: "nextjs-mastery-2024",
      description:
        "Master Next.js 15 with TypeScript, including App Router, Server Components, streaming, and deployment. Build real-world applications with industry best practices.",
      category: CourseCategory.WEB_DEVELOPMENT,
      level: CourseLevel.INTERMEDIATE,
      tags: ["nextjs", "react", "typescript", "fullstack"],
      price: 0,
      published: true,
      authorId: instructor.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: "ai-ml-fundamentals" },
    update: {},
    create: {
      title: "AI & Machine Learning Fundamentals",
      slug: "ai-ml-fundamentals",
      description:
        "Dive into the world of AI and Machine Learning. Learn core concepts, algorithms, and practical applications using Python and popular ML libraries.",
      category: CourseCategory.AI_ML,
      level: CourseLevel.BEGINNER,
      tags: ["ai", "machine-learning", "python", "data-science"],
      price: 0,
      published: true,
      authorId: instructor.id,
    },
  });

  // Create lessons for course1
  const lessons = [
    {
      title: "Introduction to Next.js 15 and the App Router",
      content: `# Introduction to Next.js 15\n\nNext.js 15 introduces powerful new features that revolutionize how we build React applications. In this lesson, we'll explore:\n\n## What is Next.js?\nNext.js is a React framework that provides:\n- **Server-Side Rendering (SSR)**: Pages are rendered on the server for better SEO\n- **Static Site Generation (SSG)**: Pre-render pages at build time\n- **App Router**: File-based routing with nested layouts\n- **Server Components**: Run React components on the server\n\n## Setting Up Your Project\n\`\`\`bash\nnpx create-next-app@latest my-app --typescript --tailwind\ncd my-app\nnpm run dev\n\`\`\`\n\n## Project Structure\nThe new App Router uses a folder-based convention inside the \`app/\` directory.\n\n## Key Concepts\n1. **Layouts**: Shared UI that wraps multiple pages\n2. **Pages**: Unique UI for each route\n3. **Loading States**: Built-in loading.tsx support\n4. **Error Boundaries**: error.tsx for graceful error handling`,
      order: 1,
      duration: 30,
      courseId: course1.id,
    },
    {
      title: "Server Components vs Client Components",
      content: `# Server vs Client Components\n\nOne of the most powerful features of Next.js with React is the distinction between Server and Client Components.\n\n## Server Components (Default)\nServer Components render on the server and:\n- Can access databases directly\n- Keep sensitive data secure\n- Reduce client-side JavaScript\n- Are NOT interactive\n\n\`\`\`tsx\n// app/users/page.tsx - Server Component\nimport { prisma } from '@/lib/db'\n\nexport default async function UsersPage() {\n  const users = await prisma.user.findMany()\n  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>\n}\n\`\`\`\n\n## Client Components\nUse the \`'use client'\` directive:\n- Enable interactivity (useState, useEffect)\n- Handle user events\n- Use browser APIs\n\n\`\`\`tsx\n'use client'\nimport { useState } from 'react'\n\nexport function Counter() {\n  const [count, setCount] = useState(0)\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>\n}\n\`\`\``,
      order: 2,
      duration: 45,
      courseId: course1.id,
    },
    {
      title: "Data Fetching Patterns in Next.js",
      content: `# Data Fetching in Next.js 15\n\n## Server-Side Data Fetching\nFetch data directly in Server Components:\n\n\`\`\`tsx\nasync function getData() {\n  const res = await fetch('https://api.example.com/data', {\n    cache: 'no-store' // Always fetch fresh data\n  })\n  return res.json()\n}\n\nexport default async function Page() {\n  const data = await getData()\n  return <main>{JSON.stringify(data)}</main>\n}\n\`\`\`\n\n## Caching Strategies\n- **Static**: \`cache: 'force-cache'\` (default)\n- **Dynamic**: \`cache: 'no-store'\`\n- **Revalidate**: \`next: { revalidate: 3600 }\`\n\n## Parallel Data Fetching\n\`\`\`tsx\nexport default async function Dashboard() {\n  const [users, posts] = await Promise.all([\n    fetchUsers(),\n    fetchPosts()\n  ])\n  return <>{/* render */}</>\n}\n\`\`\``,
      order: 3,
      duration: 40,
      courseId: course1.id,
    },
  ];

  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: {
        id: `${lesson.courseId}-lesson-${lesson.order}`,
      },
      update: {},
      create: {
        id: `${lesson.courseId}-lesson-${lesson.order}`,
        ...lesson,
      },
    });
  }

  // Enroll student in course1
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId: course1.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      courseId: course1.id,
      progress: 33,
    },
  });

  console.log("✅ Seeding complete!");
  console.log("\n📧 Demo accounts:");
  console.log("  Admin:      admin@eduforge.dev / Admin@123");
  console.log("  Instructor: instructor@eduforge.dev / Instructor@123");
  console.log("  Student:    student@eduforge.dev / Student@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
