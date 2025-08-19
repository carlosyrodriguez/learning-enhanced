"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BookOpen, CheckCircle, RotateCcw } from "lucide-react"
import { TypingInterface } from "@/components/typing-interface"
import { LessonContent } from "@/components/lesson-content"

interface DSALearningProps {
  topic: {
    id: string
    title: string
    description: string
    difficulty: string
    lessons: number
    color: string
  }
  onBack: () => void
}

export function DSALearning({ topic, onBack }: DSALearningProps) {
  const [currentLesson, setCurrentLesson] = useState(0)
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set())
  const [lessons, setLessons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    generateLessons()
  }, [topic.id])

  const generateLessons = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/generate-dsa-lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, topicTitle: topic.title }),
      })
      const data = await response.json()
      setLessons(data.lessons || [])
    } catch (error) {
      console.error("Error generating lessons:", error)
      // Fallback lessons
      setLessons([
        {
          id: 1,
          title: "Introduction to " + topic.title,
          description: "Learn the basics and fundamental concepts",
          code: `// Welcome to ${topic.title}\nconsole.log("Hello, ${topic.title}!");`,
          explanation: "This is your first lesson in " + topic.title,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLessonComplete = (lessonIndex: number) => {
    setCompletedLessons((prev) => new Set([...prev, lessonIndex]))
    if (lessonIndex === currentLesson && lessonIndex < lessons.length - 1) {
      setCurrentLesson(lessonIndex + 1)
    }
  }

  const resetProgress = () => {
    setCurrentLesson(0)
    setCompletedLessons(new Set())
  }

  const progress = lessons.length > 0 ? (completedLessons.size / lessons.length) * 100 : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating lessons for {topic.title}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Topics
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{topic.title}</h1>
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  Progress: {completedLessons.size}/{lessons.length}
                </p>
                <Progress value={progress} className="w-32" />
              </div>
              <Badge variant={progress === 100 ? "default" : "secondary"}>
                {progress === 100 ? "Complete" : "Learning"}
              </Badge>
              <Button variant="outline" size="sm" onClick={resetProgress}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6 h-[calc(100vh-200px)]">
          {/* Lesson List - Now horizontal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" />
                Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(index)}
                    className={`flex-shrink-0 p-3 rounded-lg border transition-colors min-w-[200px] ${
                      index === currentLesson
                        ? "border-primary bg-primary/10"
                        : completedLessons.has(index)
                          ? "border-green-500 bg-green-500/10"
                          : "border-border hover:border-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {completedLessons.has(index) ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            index === currentLesson ? "border-primary" : "border-muted-foreground"
                          }`}
                        />
                      )}
                      <span className="font-medium text-sm">Lesson {index + 1}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 text-left">{lesson.title}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Learning Area - Now vertical layout */}
          <div className="space-y-6 flex-1">
            {/* Typing Interface - takes remaining space */}
            <div className="flex-1">
              <TypingInterface
                lesson={lessons[currentLesson]}
                onComplete={() => handleLessonComplete(currentLesson)}
                isCompleted={completedLessons.has(currentLesson)}
              />
            </div>

            {/* Lesson Content - takes only needed space */}
            <div>
              <LessonContent
                lesson={lessons[currentLesson]}
                lessonNumber={currentLesson + 1}
                isCompleted={completedLessons.has(currentLesson)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
