import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { projectData, githubUrl } = await request.json()

    const prompt = `
You are an expert programming instructor. Analyze this GitHub repository and create step-by-step instructions for a beginner to rebuild it from scratch.

Repository Information:
- Name: ${projectData.name}
- Description: ${projectData.description}
- Language: ${projectData.language}
- Technologies: ${projectData.technologies?.join(", ")}
- File Count: ${projectData.fileCount}
- Key Files: ${projectData.files?.slice(0, 10).join(", ")}

Create a learning path with 8-12 detailed steps that guide someone through rebuilding this project. Each step should:
1. Have a clear title and description
2. Include the specific code to implement
3. Provide an explanation of what the code does
4. Include helpful tips
5. Specify the filename being worked on

Focus on the core functionality and structure. Make it educational and progressive.

Return the response as a JSON object with this structure:
{
  "instructions": [
    {
      "title": "Step title",
      "description": "What to do in this step",
      "fileName": "filename.ext",
      "code": "actual code to implement",
      "explanation": "Why this code is needed",
      "tips": ["tip1", "tip2"],
      "type": "setup|component|styling|functionality"
    }
  ]
}
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    // Parse the JSON response
    let instructions
    try {
      instructions = JSON.parse(text)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      instructions = {
        instructions: [
          {
            title: "Set up project structure",
            description: "Create the basic file structure for your project",
            fileName: "index.html",
            code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectData.name}</title>
</head>
<body>
    <h1>Welcome to ${projectData.name}</h1>
</body>
</html>`,
            explanation: "This creates the basic HTML structure for your project",
            tips: ["Always include the DOCTYPE declaration", "Use semantic HTML elements"],
            type: "setup",
          },
        ],
      }
    }

    return NextResponse.json(instructions)
  } catch (error) {
    console.error("Error generating instructions:", error)
    return NextResponse.json(
      {
        error: "Failed to generate instructions",
        instructions: [],
      },
      { status: 500 },
    )
  }
}
