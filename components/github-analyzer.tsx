"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Github, BookOpen, Code, ArrowLeft, Clock, CheckCircle, Circle, Play } from "lucide-react"
import { TypingInterface } from "./typing-interface"
import { useAuth } from "@/contexts/auth-context"

interface GitHubProject {
  name: string
  description: string
  language: string
  stars: number
  url: string
  files: Array<{
    name: string
    path: string
    content: string
  }>
}

interface Lesson {
  id: string
  title: string
  description: string
  objectives: string[]
  code: string
  explanation: string
  keyPoints: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  estimatedTime?: string
  prerequisites?: string[]
}

interface GitHubAnalyzerProps {
  onBack?: () => void
}

export function GitHubAnalyzer({ onBack }: GitHubAnalyzerProps) {
  const [githubUrl, setGithubUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [project, setProject] = useState<GitHubProject | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")
  // Added state to track if user is in typing mode
  const [isTypingMode, setIsTypingMode] = useState(false)

  const { user, updateUserStats } = useAuth()

  const analyzeRepository = async () => {
    if (!githubUrl.trim()) return

    setIsAnalyzing(true)
    setError("")

    try {
      // Analyze the repository
      const analyzeResponse = await fetch("/api/analyze-github-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: githubUrl }),
      })

      if (!analyzeResponse.ok) {
        throw new Error("Failed to analyze repository")
      }

      const projectData = await analyzeResponse.json()
      setProject(projectData)

      // Generate lessons
      const lessonsResponse = await fetch("/api/generate-github-lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: projectData }),
      })

      if (!lessonsResponse.ok) {
        throw new Error("Failed to generate lessons")
      }

      const lessonsData = await lessonsResponse.json()
      setLessons(lessonsData.lessons)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      analyzeRepository()
    }
  }

  const markLessonComplete = () => {
    if (selectedLesson) {
      setCompletedLessons((prev) => new Set([...prev, selectedLesson.id]))
      if (user) {
        // Use default values for GitHub lessons since we don't track WPM/accuracy here
        updateUserStats(50, 95) // Default reasonable values for GitHub lesson completion
      }
      // Exit typing mode when lesson is completed
      setIsTypingMode(false)
    }
  }

  const getCurrentLessonIndex = () => {
    if (!selectedLesson) return 0
    return lessons.findIndex((lesson) => lesson.id === selectedLesson.id)
  }

  const getNextLesson = () => {
    const currentIndex = getCurrentLessonIndex()
    return currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
  }

  const getPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex()
    return currentIndex > 0 ? lessons[currentIndex - 1] : null
  }

  if (selectedLesson) {
    const currentIndex = getCurrentLessonIndex()
    const progress = ((currentIndex + 1) / lessons.length) * 100
    const nextLesson = getNextLesson()
    const previousLesson = getPreviousLesson()
    const isCompleted = completedLessons.has(selectedLesson.id)

    // Show typing interface when in typing mode
    if (isTypingMode) {
      return (
        <div className="min-h-screen bg-background flex">
          <div className="w-80 border-r border-border bg-card/50 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border">
              <Button variant="ghost" size="sm" onClick={() => setIsTypingMode(false)} className="mb-3">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Lesson
              </Button>
              <div className="flex items-center gap-2 mb-2">
                <Github className="h-5 w-5 text-foreground" />
                <h2 className="font-semibold text-foreground truncate">{project?.name}</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <span>
                  Lesson {currentIndex + 1} of {lessons.length}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {selectedLesson.difficulty}
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Lesson Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="font-semibold text-sm text-foreground mb-3">Course Content</h3>
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLesson(lesson)
                      setIsTypingMode(false)
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      lesson.id === selectedLesson.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {completedLessons.has(lesson.id) ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : lesson.id === selectedLesson.id ? (
                        <Play className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-sm">{lesson.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground ml-6">
                      <Clock className="h-3 w-3" />
                      <span>{lesson.estimatedTime || "10 min"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Integrated TypingInterface component */}
          <div className="flex-1">
            <TypingInterface lesson={selectedLesson} onComplete={markLessonComplete} isCompleted={isCompleted} />
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background flex">
        <div className="w-80 border-r border-border bg-card/50 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <Button variant="ghost" size="sm" onClick={() => setSelectedLesson(null)} className="mb-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lessons
            </Button>
            <div className="flex items-center gap-2 mb-2">
              <Github className="h-5 w-5 text-foreground" />
              <h2 className="font-semibold text-foreground truncate">{project?.name}</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <span>
                Lesson {currentIndex + 1} of {lessons.length}
              </span>
              <Badge variant="secondary" className="text-xs">
                {selectedLesson.difficulty}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Lesson Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold text-sm text-foreground mb-3">Course Content</h3>
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    lesson.id === selectedLesson.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {completedLessons.has(lesson.id) ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : lesson.id === selectedLesson.id ? (
                      <Play className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium text-sm">{lesson.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground ml-6">
                    <Clock className="h-3 w-3" />
                    <span>{lesson.estimatedTime || "10 min"}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <div className="border-b border-border bg-card/80 backdrop-blur-sm p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold text-foreground mb-2">{selectedLesson.title}</h1>
              <p className="text-muted-foreground text-lg">{selectedLesson.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{selectedLesson.estimatedTime || "10 minutes"}</span>
                </div>
                <Badge variant="outline">{selectedLesson.difficulty}</Badge>
                {/* Added completion status indicator */}
                {isCompleted && (
                  <Badge className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6 space-y-8">
              {/* Learning Objectives */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Learning Objectives</CardTitle>
                  <CardDescription>What you'll accomplish in this lesson</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedLesson.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary font-semibold text-sm">{index + 1}</span>
                        </div>
                        <span className="text-muted-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Explanation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Explanation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <p className="leading-relaxed">{selectedLesson.explanation}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Code Practice */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Code Practice</CardTitle>
                  <CardDescription>Interactive typing practice with the lesson code</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
                    <pre className="text-slate-100 whitespace-pre-wrap">{selectedLesson.code}</pre>
                  </div>
                  {/* Added button to start typing practice */}
                  <Button onClick={() => setIsTypingMode(true)} className="w-full" size="lg">
                    <Code className="h-4 w-4 mr-2" />
                    Start Typing Practice
                  </Button>
                </CardContent>
              </Card>

              {/* Key Points */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Takeaways</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedLesson.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-2"></div>
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => previousLesson && setSelectedLesson(previousLesson)}
                disabled={!previousLesson}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                {/* Updated completion button logic */}
                <Button variant="outline" onClick={() => markLessonComplete()} disabled={isCompleted}>
                  {isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    "Mark Complete"
                  )}
                </Button>

                <Button
                  onClick={() => {
                    if (!isCompleted) markLessonComplete()
                    if (nextLesson) setSelectedLesson(nextLesson)
                  }}
                  disabled={!nextLesson}
                >
                  {nextLesson ? (
                    <>
                      Next Lesson
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </>
                  ) : (
                    "Course Complete!"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <Github className="h-8 w-8 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">GitHub Project Analyzer</h1>
            <Badge variant="secondary" className="ml-2">
              AI-Powered Learning
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {!project ? (
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Learn Any GitHub Project</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Paste any public GitHub repository URL and get AI-generated Codecademy-style lessons to learn the
                codebase step by step.
              </p>

              <div className="max-w-2xl mx-auto">
                <div className="flex gap-4 mb-4">
                  <Input
                    placeholder="https://github.com/username/repository"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={analyzeRepository} disabled={isAnalyzing || !githubUrl.trim()}>
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Github className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {error}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Github className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1 text-foreground">Paste GitHub URL</h3>
                    <p className="text-sm text-muted-foreground">Any public repository works</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <BookOpen className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1 text-foreground">AI Analysis</h3>
                    <p className="text-sm text-muted-foreground">Get structured lesson plans</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Code className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1 text-foreground">Learn by Typing</h3>
                    <p className="text-sm text-muted-foreground">Interactive coding experience</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div>
              {/* Project Overview */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Github className="h-6 w-6" />
                    <div>
                      <CardTitle className="text-2xl">{project.name}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="secondary">{project.language}</Badge>
                    <Badge variant="outline">⭐ {project.stars}</Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Generated Lessons */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6">Generated Lessons</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lessons.map((lesson, index) => (
                    <Card
                      key={lesson.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow group"
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">{index + 1}</span>
                          </div>
                          <Badge
                            variant={
                              lesson.difficulty === "Beginner"
                                ? "default"
                                : lesson.difficulty === "Intermediate"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {lesson.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg group-hover:text-blue-400 transition-colors">
                          {lesson.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-3">{lesson.description}</CardDescription>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{lesson.estimatedTime || "10 min"}</span>
                          </div>
                          <Code className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
