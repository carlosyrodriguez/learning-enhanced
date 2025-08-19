import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { memoryCache } from "@/lib/cache"

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const clientData = requestCounts.get(clientId)

  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  clientData.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const clientId = request.headers.get("x-forwarded-for") || "anonymous"
    if (!checkRateLimit(clientId)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const body = await request.json()
    const { project } = body

    // Input validation
    if (!project || !project.name || !project.language) {
      return NextResponse.json({ error: "Invalid project data" }, { status: 400 })
    }

    const cacheKey = `lessons-${project.name}-${project.language}-${JSON.stringify(project.files?.slice(0, 3))}`
    const cached = memoryCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, max-age=1800, s-maxage=3600",
          "X-Cache": "HIT",
        },
      })
    }

    const prompt = `Create 5-8 progressive coding lessons for: ${project.name} (${project.language})
Description: ${project.description}

Files: ${
      project.files
        ?.slice(0, 5)
        .map((f: any) => `${f.name}: ${f.content.slice(0, 500)}`)
        .join("\n") || "No files provided"
    }

Return JSON with lessons array. Each lesson needs:
- id, title, description, objectives (array), code (10-30 lines), explanation, keyPoints (array), difficulty, estimatedTime, prerequisites (array)

Focus on practical, typeable code examples that build understanding progressively.`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.3,
        maxTokens: 3000, // Reduced for faster response
        abortSignal: controller.signal,
      })

      clearTimeout(timeoutId)

      let lessons
      try {
        const cleanedText = text.trim().replace(/```json\n?|\n?```/g, "")
        const parsed = JSON.parse(cleanedText)
        lessons = parsed.lessons || (Array.isArray(parsed) ? parsed : [parsed])

        lessons = lessons.slice(0, 8).map((lesson: any, index: number) => ({
          id: lesson.id?.replace(/[^a-zA-Z0-9-]/g, "") || `lesson-${index + 1}`,
          title: (lesson.title || `Lesson ${index + 1}`).slice(0, 100),
          description: (lesson.description || "Learn key concepts").slice(0, 200),
          objectives: Array.isArray(lesson.objectives)
            ? lesson.objectives.slice(0, 5).map((obj: string) => obj.slice(0, 100))
            : ["Understand core concepts", "Practice implementation", "Learn best practices"],
          code: (lesson.code || `// ${project.name} - Lesson ${index + 1}\nconsole.log("Learning!");`).slice(0, 2000),
          explanation: (lesson.explanation || `Learn about ${project.name}.`).slice(0, 1000),
          keyPoints: Array.isArray(lesson.keyPoints)
            ? lesson.keyPoints.slice(0, 5).map((point: string) => point.slice(0, 100))
            : ["Key concept", "Important pattern", "Best practice"],
          difficulty: ["Beginner", "Intermediate", "Advanced"].includes(lesson.difficulty)
            ? lesson.difficulty
            : "Beginner",
          estimatedTime: lesson.estimatedTime || "10 minutes",
          prerequisites: Array.isArray(lesson.prerequisites) ? lesson.prerequisites.slice(0, 3) : [],
        }))
      } catch (parseError) {
        console.error("JSON parsing failed:", parseError)
        lessons = [
          {
            id: "project-overview",
            title: `Understanding ${project.name}`,
            description: `Learn the architecture and purpose of ${project.name}`,
            objectives: ["Understand the project structure", "Learn the technology stack", "Identify key components"],
            code: `// ${project.name} - Project Overview
// ${project.description || "A programming project"}
// Language: ${project.language}

console.log("Exploring ${project.name}");
console.log("Built with: ${project.language}");

// This project demonstrates:
// - Modern ${project.language} patterns
// - Clean code architecture
// - Real-world implementation`,
            explanation: `${project.name} is a ${project.language} project that showcases modern development practices. By studying its structure and implementation, you'll learn valuable patterns and techniques used in professional software development.`,
            keyPoints: [
              `Built with ${project.language}`,
              "Demonstrates clean architecture",
              "Real-world code patterns",
            ],
            difficulty: "Beginner",
            estimatedTime: "8 minutes",
            prerequisites: [],
          },
        ]
      }

      const result = { lessons }

      memoryCache.set(cacheKey, result, 1800) // 30 minutes

      return NextResponse.json(result, {
        headers: {
          "Cache-Control": "public, max-age=1800, s-maxage=3600",
          "X-Cache": "MISS",
        },
      })
    } catch (aiError) {
      clearTimeout(timeoutId)
      if (aiError.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 408 })
      }
      throw aiError
    }
  } catch (error) {
    console.error("Error generating lessons:", error)

    const errorResponse = {
      error: "Failed to generate lessons",
      retryAfter: 60,
      message: "Please try again in a moment",
    }

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        "Retry-After": "60",
      },
    })
  }
}
