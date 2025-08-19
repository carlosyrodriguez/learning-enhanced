"use client"

import React from "react"
import { errorLogger } from "@/lib/error-logger"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorLogger.logError(error, "critical", {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              We've encountered an unexpected error. Our team has been notified.
            </p>
            <button
              onClick={this.resetError}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
