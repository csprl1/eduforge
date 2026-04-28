// components/courses/lesson-content.tsx
"use client";

import ReactMarkdown from "react-markdown";

interface LessonContentProps {
  content: string;
}

export function LessonContent({ content }: LessonContentProps) {
  return (
    <div className="forge-card p-6 sm:p-8">
      <div className="prose-forge">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-white mb-4 mt-8 first:mt-0" style={{ fontFamily: "var(--font-syne)" }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-white mb-3 mt-6" style={{ fontFamily: "var(--font-syne)" }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-slate-100 mb-2 mt-4">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-slate-300 leading-relaxed mb-4">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-5 mb-4 space-y-1.5 text-slate-300">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-slate-300">{children}</ol>
            ),
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            code: ({ inline, children, ...props }: { inline?: boolean; children?: React.ReactNode; [key: string]: unknown }) =>
              inline ? (
                <code className="font-mono text-xs bg-slate-800/80 text-indigo-300 px-1.5 py-0.5 rounded border border-white/5">
                  {children}
                </code>
              ) : (
                <code className="block font-mono text-sm text-slate-300 leading-relaxed" {...props}>
                  {children}
                </code>
              ),
            pre: ({ children }) => (
              <pre className="bg-slate-900 border border-white/10 rounded-xl p-5 overflow-x-auto mb-5 text-sm">
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-indigo-500 pl-4 italic text-slate-400 mb-4 my-4">
                {children}
              </blockquote>
            ),
            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              >
                {children}
              </a>
            ),
            hr: () => <hr className="border-white/10 my-6" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
