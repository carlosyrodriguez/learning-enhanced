"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Lightbulb, Target, Code } from "lucide-react"

interface LessonContentProps {
  lesson: any
  lessonNumber: number
  isCompleted: boolean
}

export function LessonContent({ lesson, lessonNumber, isCompleted }: LessonContentProps) {
  if (!lesson) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Select a lesson to begin</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lesson {lessonNumber}
          </CardTitle>
          {isCompleted && (
            <Badge variant="default" className="bg-green-600">
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-6">
            {/* Lesson Title */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">{lesson.title}</h2>
              <p className="text-muted-foreground">{lesson.description}</p>
            </div>

            {/* Learning Objectives */}
            {lesson.objectives && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2 text-foreground">
                  <Target className="h-4 w-4 text-blue-500" />
                  Learning Objectives
                </h3>
                <ul className="space-y-2">
                  {lesson.objectives.map((objective: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-blue-500 font-bold">•</span>
                      <span className="text-muted-foreground">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concept Explanation */}
            {lesson.explanation && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2 text-foreground">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Concept Explanation
                </h3>
                <div className="bg-muted border border-border rounded-lg p-4">
                  <p className="text-foreground leading-relaxed">{lesson.explanation}</p>
                </div>
              </div>
            )}

            {/* Code Explanation */}
            {lesson.codeExplanation && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2 text-foreground">
                  <Code className="h-4 w-4 text-green-500" />
                  Code Breakdown
                </h3>
                <div className="bg-muted border border-border rounded-lg p-4">
                  <p className="text-foreground leading-relaxed">{lesson.codeExplanation}</p>
                </div>
              </div>
            )}

            {/* Key Points */}
            {lesson.keyPoints && lesson.keyPoints.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 text-foreground">Key Points to Remember</h3>
                <div className="space-y-3">
                  {lesson.keyPoints.map((point: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground font-bold min-w-[20px]">{index + 1}.</span>
                      <span className="text-foreground text-sm leading-relaxed flex-1">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time Complexity */}
            {lesson.timeComplexity && (
              <div>
                <h3 className="font-medium mb-3 text-foreground">Time & Space Complexity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted border border-border rounded-lg">
                    <p className="text-sm font-medium text-blue-400">Time Complexity</p>
                    <p className="text-lg font-mono text-blue-300">{lesson.timeComplexity}</p>
                  </div>
                  {lesson.spaceComplexity && (
                    <div className="p-3 bg-muted border border-border rounded-lg">
                      <p className="text-sm font-medium text-purple-400">Space Complexity</p>
                      <p className="text-lg font-mono text-purple-300">{lesson.spaceComplexity}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tips */}
            {lesson.tips && lesson.tips.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 text-foreground">💡 Pro Tips</h3>
                <div className="space-y-2">
                  {lesson.tips.map((tip: string, index: number) => (
                    <div key={index} className="p-3 bg-muted border border-border rounded-lg">
                      <p className="text-foreground text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Mistakes */}
            {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 text-foreground">⚠️ Common Mistakes</h3>
                <div className="space-y-2">
                  {lesson.commonMistakes.map((mistake: string, index: number) => (
                    <div key={index} className="p-3 bg-muted border border-border rounded-lg">
                      <p className="text-red-400 text-sm">{mistake}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
