// app/page.tsx
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Brain,
  BookOpen,
  Users,
  Zap,
  Shield,
  Trophy,
  Star,
  Play,
  ChevronRight,
} from "lucide-react";

export default async function HomePage() {
  const session = await getAuthSession();

  const [courseCount, userCount] = await Promise.all([
    prisma.course.count({ where: { published: true } }),
    prisma.user.count(),
  ]).catch(() => [0, 0]);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Quizzes",
      description: "Generate intelligent quizzes from lesson content using Groq's Llama 3 model. Instant, contextual, and adaptive.",
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: BookOpen,
      title: "Rich Course Builder",
      description: "Instructors can build structured courses with markdown lessons, video embeds, and organized learning paths.",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: Zap,
      title: "Instant Summarization",
      description: "AI-powered lesson summaries help students quickly grasp key concepts and review material efficiently.",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: Shield,
      title: "Secure Auth",
      description: "JWT-based authentication with role-based access control for students, instructors, and administrators.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: Users,
      title: "Progress Tracking",
      description: "Track enrollment progress, quiz scores, and completion rates with a rich learner dashboard.",
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      icon: Trophy,
      title: "Instructor Analytics",
      description: "Instructors get detailed insights on enrollments, student progress, and course performance.",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  const techStack = ["Next.js 15", "TypeScript", "PostgreSQL", "Prisma ORM", "Groq AI", "NextAuth.js", "Tailwind CSS", "Zod"];

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px]" />
            <div className="absolute top-32 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[80px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 mb-8 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Learning Platform
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 animate-slide-up">
              Forge your skills with{" "}
              <span className="gradient-text">intelligent</span>{" "}
              learning
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up stagger-2">
              EduForge combines expert-curated courses with Groq AI to generate quizzes,
              summarize lessons, and personalize your learning journey — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-3">
              {session ? (
                <Button size="xl" variant="glow" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="xl" variant="glow" asChild>
                    <Link href="/register">
                      Start Learning Free <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="xl" variant="outline" asChild>
                    <Link href="/courses">
                      <Play className="h-4 w-4" />
                      Browse Courses
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto animate-fade-in stagger-4">
              {[
                { value: courseCount || "10+", label: "Courses" },
                { value: userCount || "100+", label: "Learners" },
                { value: "∞", label: "AI Quizzes" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4">Platform Features</Badge>
              <h2 className="text-4xl font-bold text-white mb-4">
                Everything you need to learn and teach
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                A full-stack LMS built with modern web technologies, AI integration,
                and a focus on real-world usability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className={`forge-card p-6 animate-slide-up`}
                  style={{ animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: "forwards" }}
                >
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${feature.bg} mb-5`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
              Built with production-grade technologies
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-slate-300 font-medium hover:border-indigo-500/40 hover:text-indigo-300 transition-all cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 border-t border-white/5">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-600/5 p-12">
              <Sparkles className="h-10 w-10 text-indigo-400 mx-auto mb-5" />
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to start forging?
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Join EduForge and get access to high-quality courses, AI-powered quizzes,
                and a community of learners and instructors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="glow" asChild>
                  <Link href="/register">
                    Create Free Account <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
