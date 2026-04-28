// app/api/ai/generate-quiz/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lessonId, courseId, numQuestions = 5 } = await req.json();

    let content = "";
    let title = "Quiz";
    let targetCourseId = courseId;

    if (lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { course: true },
      });
      if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      content = lesson.content;
      title = `${lesson.title} — Quiz`;
      targetCourseId = lesson.courseId;
    } else if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { lessons: { take: 3, orderBy: { order: "asc" } } },
      });
      if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
      content = course.lessons.map((l) => l.content).join("\n\n");
      title = `${course.title} — Quiz`;
    }

    if (!content) {
      return NextResponse.json({ error: "No content to generate quiz from" }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      // Return mock questions if no API key (for demo)
      const mockQuestions = Array.from({ length: numQuestions }, (_, i) => ({
        id: `q-${i + 1}`,
        question: `Sample question ${i + 1} about the lesson content?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation: "This is a sample explanation for the answer.",
      }));

      const quiz = await prisma.quiz.create({
        data: {
          title,
          courseId: targetCourseId,
          lessonId: lessonId || null,
          questions: mockQuestions,
        },
      });

      return NextResponse.json({ data: quiz, message: "Quiz generated (demo mode)" });
    }

    // Call Groq API directly
    const prompt = `You are an educational quiz generator. Based on the following lesson content, generate exactly ${numQuestions} multiple-choice questions.

LESSON CONTENT:
${content.slice(0, 4000)}

Generate ${numQuestions} quiz questions. Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": "q-1",
    "question": "Clear, specific question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this answer is correct."
  }
]

Rules:
- correctAnswer is the 0-based index of the correct option (0, 1, 2, or 3)
- Make questions educational and test comprehension
- Keep questions concise and clear
- Make all 4 options plausible
- Return ONLY the JSON array, no other text`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!groqResponse.ok) {
      throw new Error("Groq API request failed");
    }

    const groqData = await groqResponse.json();
    const rawText = groqData.choices[0].message.content;

    // Parse JSON from response
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Invalid response format from AI");

    const questions = JSON.parse(jsonMatch[0]);

    const quiz = await prisma.quiz.create({
      data: {
        title,
        courseId: targetCourseId,
        lessonId: lessonId || null,
        questions,
      },
    });

    return NextResponse.json({ data: quiz, message: "Quiz generated successfully!" }, { status: 201 });
  } catch (error) {
    console.error("[AI QUIZ]", error);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
