"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, CheckCircle, RefreshCw, Eye } from "lucide-react"

interface CodeEditorProps {
  currentStep: number
  instructions: any[]
  userCode: Record<string, string>
  onCodeChange: (code: Record<string, string>) => void
  onStepComplete: (stepIndex: number) => void
}

export function CodeEditor({ currentStep, instructions, userCode, onCodeChange, onStepComplete }: CodeEditorProps) {
  const [activeFile, setActiveFile] = useState("index.html")
  const [currentCode, setCurrentCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)

  const currentInstruction = instructions[currentStep]
  const expectedCode = currentInstruction?.code || ""
  const fileName = currentInstruction?.fileName || "index.html"

  useEffect(() => {
    setCurrentCode(userCode[fileName] || "")
    setActiveFile(fileName)
  }, [currentStep, fileName, userCode])

  const handleCodeChange = (value: string) => {
    setCurrentCode(value)
    const updatedCode = { ...userCode, [fileName]: value }
    onCodeChange(updatedCode)
  }

  const validateCode = async () => {
    setIsValidating(true)

    // Simple validation - check if code contains key elements
    const isValid = currentCode.trim().length > 0 && currentCode.includes(expectedCode.split("\n")[0]?.trim() || "")

    setTimeout(() => {
      setIsValidating(false)
      if (isValid) {
        onStepComplete(currentStep)
      }
    }, 1000)
  }

  const resetCode = () => {
    setCurrentCode("")
    const updatedCode = { ...userCode, [fileName]: "" }
    onCodeChange(updatedCode)
  }

  const showSolution = () => {
    setCurrentCode(expectedCode)
    const updatedCode = { ...userCode, [fileName]: expectedCode }
    onCodeChange(updatedCode)
  }

  if (!currentInstruction) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Select a step to start coding</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4 h-full">
      {/* Code Editor */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {fileName}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Step {currentStep + 1}</Badge>
                <Button size="sm" variant="outline" onClick={resetCode}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
                <Button size="sm" variant="outline" onClick={showSolution}>
                  <Eye className="h-3 w-3 mr-1" />
                  Show Solution
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[calc(100vh-500px)]">
              <textarea
                value={currentCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full h-full p-4 font-mono text-sm border-0 resize-none focus:outline-none bg-slate-900 text-slate-100"
                placeholder={`Start typing your ${fileName} code here...`}
                spellCheck={false}
              />
            </div>
            <div className="p-4 border-t bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Lines: {currentCode.split("\n").length}</span>
                  <span className="text-sm text-slate-600">Characters: {currentCode.length}</span>
                </div>
                <Button
                  onClick={validateCode}
                  disabled={isValidating || !currentCode.trim()}
                  className="flex items-center gap-2"
                >
                  {isValidating ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Validating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Validate Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expected Output / Hints */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Expected Output</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-500px)]">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">What you should implement:</h4>
                  <p className="text-sm text-slate-600 mb-3">{currentInstruction.description}</p>
                </div>

                {expectedCode && (
                  <div>
                    <h4 className="font-medium mb-2">Expected Code:</h4>
                    <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto">
                      <code>{expectedCode}</code>
                    </pre>
                  </div>
                )}

                {currentInstruction.hints && (
                  <div>
                    <h4 className="font-medium mb-2">Hints:</h4>
                    <ul className="space-y-1">
                      {currentInstruction.hints.map((hint: string, index: number) => (
                        <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-blue-500 font-bold">•</span>
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Progress:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${currentCode.length > 0 ? "bg-green-500" : "bg-slate-300"}`}
                      />
                      <span className="text-sm">Code started</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          currentCode.length > expectedCode.length * 0.5 ? "bg-green-500" : "bg-slate-300"
                        }`}
                      />
                      <span className="text-sm">Halfway complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          currentCode.length >= expectedCode.length * 0.8 ? "bg-green-500" : "bg-slate-300"
                        }`}
                      />
                      <span className="text-sm">Nearly finished</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
