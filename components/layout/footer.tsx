// components/layout/footer.tsx
import Link from "next/link";
import { Sparkles, Github, Linkedin , Globe} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-white">
                Edu<span className="text-indigo-400">Forge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              An AI-powered learning management system built for the next generation of developers and learners.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Platform</h4>
            <ul className="space-y-2">
              {[
                { href: "/courses", label: "Explore Courses" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/register", label: "Get Started" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Built With</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Next.js 15 + TypeScript</li>
              <li>PostgreSQL + Prisma</li>
              <li>Tailwind CSS</li>
              <li>Groq AI (Llama 3)</li>
              <li>NextAuth.js</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} EduForge. Assignment project for House of Edtech.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600">
              Built by{" "}
              <span className="text-indigo-400 font-semibold">Prathamesh Ugale</span>
            </span>
            <a
              href="https://github.com/csprl1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/prathamesh-ugale-1aa536138"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-blue-400 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
  href="https://www.sonurajeugale.com/"
  target="_blank"
  rel="noopener noreferrer"
  className="text-slate-500 hover:text-indigo-400 transition-colors"
  aria-label="Portfolio"
>
  <Globe className="h-4 w-4" />
</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
