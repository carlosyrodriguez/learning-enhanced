import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    // Extract owner and repo from GitHub URL
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 })
    }

    const [, owner, repo] = match
    const cleanRepo = repo.replace(/\.git$/, "")

    // Fetch repository information from GitHub API
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`)
    const repoData = await repoResponse.json()

    if (!repoResponse.ok) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    // Fetch repository contents
    const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/contents`)
    const contentsData = await contentsResponse.json()

    // Get file list recursively (simplified)
    const files = await getFileList(owner, cleanRepo, "")

    // Analyze technologies based on files
    const technologies = analyzeTechnologies(files)

    return NextResponse.json({
      name: repoData.name,
      description: repoData.description,
      language: repoData.language,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      files: files.slice(0, 50), // Limit to first 50 files
      fileCount: files.length,
      technologies,
      url: repoData.html_url,
    })
  } catch (error) {
    console.error("Error analyzing repository:", error)
    return NextResponse.json({ error: "Failed to analyze repository" }, { status: 500 })
  }
}

async function getFileList(owner: string, repo: string, path: string): Promise<string[]> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`)
    const data = await response.json()

    if (!Array.isArray(data)) return []

    const files: string[] = []

    for (const item of data) {
      if (item.type === "file") {
        files.push(item.path)
      } else if (item.type === "dir" && files.length < 100) {
        // Recursively get files from subdirectories (limited to prevent API overuse)
        const subFiles = await getFileList(owner, repo, item.path)
        files.push(...subFiles)
      }
    }

    return files
  } catch (error) {
    console.error("Error fetching file list:", error)
    return []
  }
}

function analyzeTechnologies(files: string[]): string[] {
  const technologies = new Set<string>()

  files.forEach((file) => {
    const ext = file.split(".").pop()?.toLowerCase()
    const fileName = file.toLowerCase()

    // Frontend technologies
    if (ext === "js" || ext === "jsx") technologies.add("JavaScript")
    if (ext === "ts" || ext === "tsx") technologies.add("TypeScript")
    if (ext === "vue") technologies.add("Vue.js")
    if (ext === "html") technologies.add("HTML")
    if (ext === "css" || ext === "scss" || ext === "sass") technologies.add("CSS")

    // Backend technologies
    if (ext === "py") technologies.add("Python")
    if (ext === "java") technologies.add("Java")
    if (ext === "php") technologies.add("PHP")
    if (ext === "rb") technologies.add("Ruby")
    if (ext === "go") technologies.add("Go")
    if (ext === "rs") technologies.add("Rust")

    // Frameworks and tools
    if (fileName.includes("package.json")) technologies.add("Node.js")
    if (fileName.includes("next.config")) technologies.add("Next.js")
    if (fileName.includes("nuxt.config")) technologies.add("Nuxt.js")
    if (fileName.includes("angular.json")) technologies.add("Angular")
    if (fileName.includes("tailwind.config")) technologies.add("Tailwind CSS")
    if (fileName.includes("webpack.config")) technologies.add("Webpack")
    if (fileName.includes("vite.config")) technologies.add("Vite")
    if (fileName.includes("dockerfile")) technologies.add("Docker")
    if (fileName.includes("requirements.txt")) technologies.add("Python")
    if (fileName.includes("gemfile")) technologies.add("Ruby")
    if (fileName.includes("cargo.toml")) technologies.add("Rust")
  })

  return Array.from(technologies)
}
