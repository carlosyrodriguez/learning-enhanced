"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Circle, Play, FileText, Lightbulb, ArrowRight, Clock } from "lucide-react"

interface InstructionPanelProps {
  instructions: any[]
  currentStep: number
  completedSteps: Set<number>
  onStepComplete: (stepIndex: number) => void
  onStepSelect: (stepIndex: number) => void
  isLoading: boolean
}

export function InstructionPanel({
  instructions,
  currentStep,
  completedSteps,
  onStepComplete,
  onStepSelect,
  isLoading,
}: InstructionPanelProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Analyzing repository and generating instructions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (instructions.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No instructions generated yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentInstruction = instructions[currentStep]

  return (
    <div className="grid lg:grid-cols-3 gap-4 h-full">
      {/* Steps List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Steps</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="p-4 space-y-2">
                {instructions.map((instruction, index) => (
                  <button
                    key={index}
                    onClick={() => onStepSelect(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      index === currentStep
                        ? "border-blue-200 bg-blue-50"
                        : completedSteps.has(index)
                          ? "border-green-200 bg-green-50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {completedSteps.has(index) ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : index === currentStep ? (
                        <Play className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-400" />
                      )}
                      <span className="font-medium text-sm">Step {index + 1}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{instruction.title}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Current Instruction */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>Step {currentStep + 1}</span>
                <Badge variant="outline">{currentInstruction?.type || "Task"}</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                {completedSteps.has(currentStep) ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    In Progress
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-500px)]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{currentInstruction?.title}</h3>
                  <p className="text-slate-600 mb-4">{currentInstruction?.description}</p>
                </div>

                {currentInstruction?.code && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Code to implement:
                    </h4>
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{currentInstruction.code}</code>
                    </pre>
                  </div>
                )}

                {currentInstruction?.explanation && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Explanation:
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-slate-700">{currentInstruction.explanation}</p>
                    </div>
                  </div>
                )}

                {currentInstruction?.tips && currentInstruction.tips.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tips:</h4>
                    <ul className="space-y-1">
                      {currentInstruction.tips.map((tip: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                          <ArrowRight className="h-3 w-3 mt-0.5 text-slate-400 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => onStepComplete(currentStep)}
                    disabled={completedSteps.has(currentStep)}
                    className="flex-1"
                  >
                    {completedSteps.has(currentStep) ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </>
                    )}
                  </Button>
                  {currentStep < instructions.length - 1 && (
                    <Button variant="outline" onClick={() => onStepSelect(currentStep + 1)}>
                      Next Step
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
