"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, FileText, Folder, Code, BookOpen, Target } from "lucide-react"
import { CodeEditor } from "@/components/code-editor"
import { InstructionPanel } from "@/components/instruction-panel"

interface ProjectAnalyzerProps {
  projectData: any
  githubUrl: string
}

export function ProjectAnalyzer({ projectData, githubUrl }: ProjectAnalyzerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [userCode, setUserCode] = useState<Record<string, string>>({})
  const [instructions, setInstructions] = useState<any[]>([])
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(true)

  useEffect(() => {
    generateInstructions()
  }, [])

  const generateInstructions = async () => {
    try {
      const response = await fetch("/api/generate-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectData,
          githubUrl,
        }),
      })

      const data = await response.json()
      setInstructions(data.instructions || [])
    } catch (error) {
      console.error("Error generating instructions:", error)
    } finally {
      setIsGeneratingInstructions(false)
    }
  }

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps((prev) => new Set([...prev, stepIndex]))
    if (stepIndex === currentStep && stepIndex < instructions.length - 1) {
      setCurrentStep(stepIndex + 1)
    }
  }

  const progress = instructions.length > 0 ? (completedSteps.size / instructions.length) * 100 : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">{projectData?.name || "Project Analysis"}</h1>
                <p className="text-sm text-slate-600">{githubUrl}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">
                  Progress: {completedSteps.size}/{instructions.length}
                </p>
                <Progress value={progress} className="w-32" />
              </div>
              <Badge variant={progress === 100 ? "default" : "secondary"}>
                {progress === 100 ? "Complete" : "In Progress"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Sidebar - Project Overview */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5" />
                  Project Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="space-y-4">
                    {/* Project Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="font-medium">Files</p>
                        <p className="text-slate-600">{projectData?.fileCount || 0}</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="font-medium">Language</p>
                        <p className="text-slate-600">{projectData?.language || "Mixed"}</p>
                      </div>
                    </div>

                    {/* File Structure */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        File Structure
                      </h4>
                      <div className="space-y-1 text-sm">
                        {projectData?.files?.slice(0, 10).map((file: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-1 rounded hover:bg-slate-50">
                            <FileText className="h-3 w-3 text-slate-400" />
                            <span className="text-slate-600 truncate">{file}</span>
                          </div>
                        ))}
                        {projectData?.files?.length > 10 && (
                          <p className="text-xs text-slate-500 pl-5">+{projectData.files.length - 10} more files</p>
                        )}
                      </div>
                    </div>

                    {/* Technologies */}
                    {projectData?.technologies && (
                      <div>
                        <h4 className="font-medium mb-2">Technologies</h4>
                        <div className="flex flex-wrap gap-1">
                          {projectData.technologies.map((tech: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Center - Instructions and Code Editor */}
          <div className="lg:col-span-9">
            <Tabs defaultValue="instructions" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="instructions" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Instructions
                </TabsTrigger>
                <TabsTrigger value="editor" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Code Editor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="instructions" className="h-[calc(100%-60px)]">
                <InstructionPanel
                  instructions={instructions}
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  onStepComplete={handleStepComplete}
                  onStepSelect={setCurrentStep}
                  isLoading={isGeneratingInstructions}
                />
              </TabsContent>

              <TabsContent value="editor" className="h-[calc(100%-60px)]">
                <CodeEditor
                  currentStep={currentStep}
                  instructions={instructions}
                  userCode={userCode}
                  onCodeChange={setUserCode}
                  onStepComplete={handleStepComplete}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
