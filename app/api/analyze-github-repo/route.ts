import { type NextRequest, NextResponse } from "next/server"
import { memoryCache } from "@/lib/cache"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    const cacheKey = `github-repo-${url}`
    const cached = memoryCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=600",
          "X-Cache": "HIT",
        },
      })
    }

    // Extract owner and repo from GitHub URL
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 })
    }

    const [, owner, repo] = match
    const cleanRepo = repo.replace(/\.git$/, "")

    const githubHeaders = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Learning-Enhanced-App",
    }

    // Fetch repository information
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
      headers: githubHeaders,
    })
    if (!repoResponse.ok) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    const repoData = await repoResponse.json()

    // Fetch repository contents
    const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/contents`, {
      headers: githubHeaders,
    })
    if (!contentsResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch repository contents" }, { status: 500 })
    }

    const contents = await contentsResponse.json()

    // Get key files (README, main files, etc.)
    const keyFiles = []
    const fileExtensions = [".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".cpp", ".c", ".go", ".rs", ".php"]

    const filePromises = contents.slice(0, 10).map(async (item: any) => {
      if (
        item.type === "file" &&
        (item.name.toLowerCase().includes("readme") ||
          item.name.toLowerCase().includes("main") ||
          item.name.toLowerCase().includes("index") ||
          fileExtensions.some((ext) => item.name.endsWith(ext)))
      ) {
        try {
          const fileResponse = await fetch(item.download_url, {
            headers: githubHeaders,
          })
          if (fileResponse.ok) {
            const content = await fileResponse.text()
            return {
              name: item.name,
              path: item.path,
              content: content.slice(0, 2000), // Limit content size
            }
          }
        } catch (error) {
          console.error(`Failed to fetch ${item.name}:`, error)
        }
      }
      return null
    })

    const fileResults = await Promise.all(filePromises)
    keyFiles.push(...fileResults.filter(Boolean))

    const project = {
      name: repoData.name,
      description: repoData.description || "No description available",
      language: repoData.language || "Unknown",
      stars: repoData.stargazers_count,
      url: repoData.html_url,
      files: keyFiles,
    }

    memoryCache.set(cacheKey, project, 600)

    return NextResponse.json(project, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600",
        "X-Cache": "MISS",
      },
    })
  } catch (error) {
    console.error("Error analyzing repository:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
