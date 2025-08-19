"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"
import { JetBrains_Mono } from "next/font/google"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code, CheckCircle, RotateCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
})

interface TypingInterfaceProps {
  lesson: any
  onComplete: () => void
  isCompleted: boolean
}

interface ErrorIndicator {
  id: number
  x: number
  y: number
}

export function TypingInterface({ lesson, onComplete, isCompleted }: TypingInterfaceProps) {
  const [userInput, setUserInput] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [errors, setErrors] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [incorrectChars, setIncorrectChars] = useState<Set<number>>(new Set())
  const [errorIndicators, setErrorIndicators] = useState<ErrorIndicator[]>([])
  const [errorIdCounter, setErrorIdCounter] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingAreaRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { user, updateUserStats } = useAuth()

  const targetCode = lesson?.code || ""
  const targetLength = targetCode.length

  useEffect(() => {
    setUserInput("")
    setCurrentIndex(0)
    setErrors(0)
    setStartTime(null)
    setWpm(0)
    setHasError(false)
    setIncorrectChars(new Set())
    setErrorIndicators([])
    setErrorIdCounter(0)
  }, [lesson])

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
      setIsFocused(true)
    }
  }

  const handleInputFocus = () => {
    setIsFocused(true)
  }

  const handleInputBlur = () => {
    setIsFocused(false)
  }

  const createErrorIndicator = (charIndex: number) => {
    if (typingAreaRef.current) {
      const charElements = typingAreaRef.current.querySelectorAll(".char-span")
      const charElement = charElements[charIndex] as HTMLElement
      if (charElement) {
        const rect = charElement.getBoundingClientRect()
        const containerRect = typingAreaRef.current.getBoundingClientRect()

        const newIndicator: ErrorIndicator = {
          id: errorIdCounter,
          x: rect.left - containerRect.left + rect.width,
          y: rect.top - containerRect.top,
        }

        setErrorIndicators((prev) => [...prev, newIndicator])
        setErrorIdCounter((prev) => prev + 1)

        // Remove indicator after animation
        setTimeout(() => {
          setErrorIndicators((prev) => prev.filter((indicator) => indicator.id !== newIndicator.id))
        }, 1000)
      }
    }
  }

  const getCurrentLineIndentation = (text: string, position: number): string => {
    const lines = text.substring(0, position).split("\n")
    const currentLine = lines[lines.length - 1]
    const match = currentLine.match(/^(\s*)/)
    return match ? match[1] : ""
  }

  const shouldAutoIndent = (text: string, position: number): boolean => {
    if (position === 0) return false
    const charBefore = text[position - 1]
    return charBefore === "{" || charBefore === "(" || charBefore === "["
  }

  const handleInputChange = (value: string) => {
    if (!startTime && value.length > 0) {
      setStartTime(Date.now())
    }

    if (value.length > userInput.length) {
      // User is typing a new character
      const newCharIndex = value.length - 1
      const typedChar = value[newCharIndex]
      const expectedChar = targetCode[newCharIndex]

      if (typedChar !== expectedChar) {
        setErrors((prev) => prev + 1)
        setHasError(true)
        setIncorrectChars((prev) => new Set([...prev, newCharIndex]))
        createErrorIndicator(newCharIndex)
        setUserInput(value)
        setCurrentIndex(value.length)
        return
      } else {
        setIncorrectChars((prev) => {
          const newSet = new Set(prev)
          newSet.delete(newCharIndex)
          return newSet
        })
        setHasError(false)
      }
    } else if (value.length < userInput.length) {
      // User is deleting - remove from incorrect chars
      const deletedIndex = value.length
      setIncorrectChars((prev) => {
        const newSet = new Set(prev)
        newSet.delete(deletedIndex)
        return newSet
      })
      setHasError(incorrectChars.size > 1) // Still has error if other incorrect chars exist
    }

    if (value.length <= targetLength) {
      setUserInput(value)
      setCurrentIndex(value.length)

      // Calculate WPM only for correct characters
      if (startTime && value.length > 0 && incorrectChars.size === 0) {
        const timeElapsed = (Date.now() - startTime) / 1000 / 60
        const wordsTyped = value.length / 5
        setWpm(Math.round(wordsTyped / timeElapsed))
      }

      // Check completion - only if no errors and full length
      if (value === targetCode && incorrectChars.size === 0) {
        if (user && startTime) {
          const finalAccuracy =
            userInput.length > 0 ? Math.round((userInput.length / (userInput.length + errors)) * 100) : 100
          updateUserStats(wpm, finalAccuracy)
        }
        onComplete()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()

      const expectedChar = targetCode[currentIndex]

      if (expectedChar === "\t") {
        // Correct - user pressed Tab when a tab is expected
        const newInput = userInput + "\t"
        setUserInput(newInput)
        setCurrentIndex(newInput.length)
        setHasError(false)

        // Calculate WPM
        if (startTime && newInput.length > 0 && incorrectChars.size === 0) {
          const timeElapsed = (Date.now() - startTime) / 1000 / 60
          const wordsTyped = newInput.length / 5
          setWpm(Math.round(wordsTyped / timeElapsed))
        }

        // Check completion
        if (newInput === targetCode && incorrectChars.size === 0) {
          if (user && startTime) {
            const finalAccuracy =
              userInput.length > 0 ? Math.round((userInput.length / (userInput.length + errors)) * 100) : 100
            updateUserStats(wpm, finalAccuracy)
          }
          onComplete()
        }
      } else {
        // Check if we need to type spaces instead of tab
        let spacesToAdd = 0
        for (let i = currentIndex; i < targetCode.length && targetCode[i] === " "; i++) {
          spacesToAdd++
        }

        if (spacesToAdd > 0) {
          const newInput = userInput + " ".repeat(spacesToAdd)
          if (
            newInput.substring(0, currentIndex + spacesToAdd) === targetCode.substring(0, currentIndex + spacesToAdd)
          ) {
            setUserInput(newInput)
            setCurrentIndex(newInput.length)
            setHasError(false)
          } else {
            // Incorrect tab usage
            setErrors((prev) => prev + 1)
            setHasError(true)
            createErrorIndicator(currentIndex)
          }
        } else {
          // Incorrect - user pressed Tab when something else was expected
          setErrors((prev) => prev + 1)
          setHasError(true)
          createErrorIndicator(currentIndex)
        }
      }
      return
    }

    if (e.key === "Enter") {
      e.preventDefault() // Prevent default form submission

      const expectedChar = targetCode[currentIndex]

      if (expectedChar === "\n") {
        // Correct - user pressed Enter when a newline is expected
        let newInput = userInput + "\n"

        // Check if we need to add indentation after the newline
        let indentationToAdd = ""
        let nextIndex = currentIndex + 1

        // Get the expected indentation from the target code
        while (nextIndex < targetCode.length && (targetCode[nextIndex] === " " || targetCode[nextIndex] === "\t")) {
          indentationToAdd += targetCode[nextIndex]
          nextIndex++
        }

        if (indentationToAdd) {
          newInput += indentationToAdd
        }

        setUserInput(newInput)
        setCurrentIndex(newInput.length)

        // Remove any error state since this was correct
        setHasError(false)

        // Calculate WPM
        if (startTime && newInput.length > 0 && incorrectChars.size === 0) {
          const timeElapsed = (Date.now() - startTime) / 1000 / 60
          const wordsTyped = newInput.length / 5
          setWpm(Math.round(wordsTyped / timeElapsed))
        }

        // Check completion
        if (newInput === targetCode && incorrectChars.size === 0) {
          if (user && startTime) {
            const finalAccuracy =
              userInput.length > 0 ? Math.round((userInput.length / (userInput.length + errors)) * 100) : 100
            updateUserStats(wpm, finalAccuracy)
          }
          onComplete()
        }
      } else {
        // Incorrect - user pressed Enter when something else was expected
        setErrors((prev) => prev + 1)
        setHasError(true)
        createErrorIndicator(currentIndex)
      }
    }
  }

  const resetTyping = () => {
    setUserInput("")
    setCurrentIndex(0)
    setErrors(0)
    setStartTime(null)
    setWpm(0)
    setHasError(false)
    setIncorrectChars(new Set())
    setErrorIndicators([])
    setErrorIdCounter(0)
    if (inputRef.current) {
      inputRef.current.focus()
      setIsFocused(true)
    }
  }

  const renderTypingText = () => {
    return (
      <div className={`text-[15px] leading-relaxed tracking-wide relative whitespace-pre-wrap`} ref={typingAreaRef}>
        {targetCode.split("").map((char, index) => {
          let className = ""
          let displayChar = char

          // Handle special characters
          if (char === " ") {
            displayChar = " "
          } else if (char === "\t") {
            displayChar = "    "
          } else if (char === "\n") {
            displayChar = char
          }

          if (index < userInput.length) {
            if (incorrectChars.has(index)) {
              className = "bg-red-500/20 text-red-400 border-b-2 border-red-500"
            } else {
              className = "bg-purple-500/20 text-purple-400"
            }
          } else if (index === currentIndex && incorrectChars.size === 0) {
            if (char === "\n") {
              className = "bg-purple-500 animate-pulse inline-block w-2 h-6"
            } else {
              className = "bg-purple-500 text-white animate-pulse"
            }
          } else {
            className = "text-muted-foreground"
          }

          if (char === "\n" && index === currentIndex && incorrectChars.size === 0) {
            return (
              <span key={index} className="relative">
                <br />
                <span className="absolute left-0 top-0 bg-purple-500 animate-pulse inline-block w-2 h-6 char-span"></span>
              </span>
            )
          }

          return (
            <span
              key={index}
              className={`char-span ${className} ${char === "\n" ? "" : "px-0.5 py-0.5 rounded"} transition-all duration-200`}
            >
              {displayChar}
            </span>
          )
        })}
      </div>
    )
  }

  const progress = targetLength > 0 ? (userInput.length / targetLength) * 100 : 0
  const accuracy = userInput.length > 0 ? Math.round((userInput.length / (userInput.length + errors)) * 100) : 100

  return (
    <div className="h-full flex flex-col cursor-text" ref={containerRef} onClick={handleContainerClick}>
      <style jsx>{`
        @keyframes fadeUpOut {
          0% {
            opacity: 1;
            transform: translateY(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
      `}</style>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-foreground">Type the Code</h2>
          {isCompleted && (
            <Badge className="bg-purple-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
        <Button variant="outline" onClick={resetTyping}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{Math.round(progress)}%</div>
          <div className="text-sm text-muted-foreground">Progress</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{wpm}</div>
          <div className="text-sm text-muted-foreground">WPM</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{errors}</div>
          <div className="text-sm text-muted-foreground">Errors</div>
        </div>
      </div>

      {!isFocused && userInput.length === 0 && (
        <div className="text-center mb-4">
          <div className="text-muted-foreground text-lg font-medium">Click anywhere to start typing</div>
        </div>
      )}

      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-6">
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            className={`flex-1 rounded-lg p-6 mb-4 transition-all duration-200 overflow-hidden ${
              isFocused ? "bg-muted/50 border-2 border-purple-500" : "bg-muted/30 border-2 border-border"
            }`}
          >
            <div className="w-full max-w-full overflow-x-auto">
              <div className={`min-w-fit ${jetbrainsMono.className}`}>{renderTypingText()}</div>
            </div>
          </div>

          <textarea
            ref={inputRef}
            value={userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="absolute opacity-0 pointer-events-none resize-none"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            rows={1}
          />

          {hasError && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              You have incorrect characters (shown in red). Please delete them and type correctly to continue.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
