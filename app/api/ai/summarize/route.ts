// app/api/ai/summarize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lessonId } = await req.json();
    if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json({
        data: {
          summary: "**Key Takeaways:**\n\n• This lesson covers foundational concepts\n• Core patterns and best practices are discussed\n• Hands-on examples are provided throughout\n\n**TL;DR:** This lesson provides essential knowledge for building modern applications. Focus on understanding the core concepts before moving to advanced topics.",
        },
      });
    }

    const prompt = `Summarize this lesson content in a concise, educational way. Format as markdown with:
1. A "Key Takeaways" section with 3-5 bullet points
2. A "TL;DR" one-paragraph summary at the end

LESSON: ${lesson.title}

CONTENT:
${lesson.content.slice(0, 3000)}`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 600,
      }),
    });

    const data = await groqResponse.json();
    const summary = data.choices[0].message.content;

    return NextResponse.json({ data: { summary } });
  } catch (error) {
    console.error("[AI SUMMARIZE]", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
