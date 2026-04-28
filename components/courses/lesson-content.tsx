"use client";

import ReactMarkdown from "react-markdown";

interface LessonContentProps {
  content: string;
}

export function LessonContent({
  content,
}: LessonContentProps) {
  return (
    <div className="forge-card p-6 sm:p-8">
      <div className="prose-forge">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1
                className="mb-4 mt-8 text-2xl font-bold text-white first:mt-0"
                style={{
                  fontFamily:
                    "var(--font-syne)",
                }}
              >
                {children}
              </h1>
            ),

            h2: ({ children }) => (
              <h2
                className="mb-3 mt-6 text-xl font-bold text-white"
                style={{
                  fontFamily:
                    "var(--font-syne)",
                }}
              >
                {children}
              </h2>
            ),

            h3: ({ children }) => (
              <h3 className="mb-2 mt-4 text-lg font-semibold text-slate-100">
                {children}
              </h3>
            ),

            p: ({ children }) => (
              <p className="mb-4 leading-relaxed text-slate-300">
                {children}
              </p>
            ),

            ul: ({ children }) => (
              <ul className="mb-4 list-disc space-y-1.5 pl-5 text-slate-300">
                {children}
              </ul>
            ),

            ol: ({ children }) => (
              <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-slate-300">
                {children}
              </ol>
            ),

            li: ({ children }) => (
              <li className="leading-relaxed">
                {children}
              </li>
            ),

            code: ({
              children,
              className,
              ...props
            }: any) => {
              const inline =
                !className?.includes(
                  "language-"
                );

              return inline ? (
                <code
                  className="rounded border border-white/5 bg-slate-800/80 px-1.5 py-0.5 font-mono text-xs text-indigo-300"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <code
                  className="block font-mono text-sm leading-relaxed text-slate-300"
                  {...props}
                >
                  {children}
                </code>
              );
            },

            pre: ({ children }) => (
              <pre className="mb-5 overflow-x-auto rounded-xl border border-white/10 bg-slate-900 p-5 text-sm">
                {children}
              </pre>
            ),

            blockquote: ({
              children,
            }) => (
              <blockquote className="my-4 mb-4 border-l-2 border-indigo-500 pl-4 italic text-slate-400">
                {children}
              </blockquote>
            ),

            strong: ({
              children,
            }) => (
              <strong className="font-semibold text-white">
                {children}
              </strong>
            ),

            a: ({
              href,
              children,
            }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 transition-colors hover:text-indigo-300 text-indigo-400 underline"
              >
                {children}
              </a>
            ),

            hr: () => (
              <hr className="my-6 border-white/10" />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}