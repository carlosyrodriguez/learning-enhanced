"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Brain, Target, Zap, BookOpen, Trophy, User, LogIn, LogOut } from "lucide-react"
import { DSALearning } from "@/components/dsa-learning"
import { Button } from "@/components/ui/button"
import { GitHubAnalyzer } from "@/components/github-analyzer"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"
import Link from "next/link"

const DSA_TOPICS = [
  {
    id: "arrays",
    title: "Arrays & Strings",
    description: "Learn array manipulation, string processing, and basic algorithms",
    difficulty: "Beginner",
    lessons: 8,
    color: "bg-green-500",
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    description: "Master singly, doubly, and circular linked lists with operations",
    difficulty: "Beginner",
    lessons: 6,
    color: "bg-blue-500",
  },
  {
    id: "stacks-queues",
    title: "Stacks & Queues",
    description: "Understand LIFO and FIFO data structures with real applications",
    difficulty: "Beginner",
    lessons: 5,
    color: "bg-purple-500",
  },
  {
    id: "trees",
    title: "Trees & Binary Trees",
    description: "Explore tree traversals, BST operations, and tree algorithms",
    difficulty: "Intermediate",
    lessons: 10,
    color: "bg-orange-500",
  },
  {
    id: "graphs",
    title: "Graphs",
    description: "Learn graph representations, DFS, BFS, and shortest paths",
    difficulty: "Intermediate",
    lessons: 8,
    color: "bg-red-500",
  },
  {
    id: "sorting",
    title: "Sorting Algorithms",
    description: "Master bubble sort, merge sort, quick sort, and more",
    difficulty: "Intermediate",
    lessons: 7,
    color: "bg-indigo-500",
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    description: "Solve complex problems with memoization and tabulation",
    difficulty: "Advanced",
    lessons: 12,
    color: "bg-pink-500",
  },
  {
    id: "advanced-algorithms",
    title: "Advanced Algorithms",
    description: "Greedy algorithms, backtracking, and optimization techniques",
    difficulty: "Advanced",
    lessons: 10,
    color: "bg-gray-500",
  },
]

export default function HomePage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [showGitHubAnalyzer, setShowGitHubAnalyzer] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, logout, isLoading } = useAuth()

  if (selectedTopic) {
    const topic = DSA_TOPICS.find((t) => t.id === selectedTopic)
    return <DSALearning topic={topic!} onBack={() => setSelectedTopic(null)} />
  }

  if (showGitHubAnalyzer) {
    return <GitHubAnalyzer onBack={() => setShowGitHubAnalyzer(false)} />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex items-center gap-3">
              {isLoading ? (
                // Render a placeholder to prevent layout shift while checking auth
                <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
              ) : user ? (
                // Logged-in view
                <>
                  <Link href="/leaderboard">
                    <span className="text-sm text-foreground hover:text-muted-foreground transition-colors cursor-pointer flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Leaderboard
                    </span>
                  </Link>
                  <span className="text-muted-foreground">|</span>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">{user.username}</span>
                  </div>
                  <span className="text-muted-foreground">|</span>
                  <span
                    onClick={logout}
                    className="text-sm text-foreground hover:text-muted-foreground transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </span>
                </>
              ) : (
                // Logged-out view
                <>
                  <Link href="/leaderboard">
                    <span className="text-sm text-foreground hover:text-muted-foreground transition-colors cursor-pointer flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Leaderboard
                    </span>
                  </Link>
                  <span className="text-muted-foreground">|</span>
                  <span
                    onClick={() => setShowAuthModal(true)}
                    className="text-sm text-foreground hover:text-muted-foreground transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <LogIn className="h-5 w-5" />
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {/* ... Hero Section content ... */}
        <div className="relative mb-12 rounded-3xl overflow-hidden">
          <div className="relative z-10 px-8 py-6 md:py-28 text-center">
            <Card className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-800 to-gray-900" />
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">Learn Programming</h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-medium">
              Master coding through interactive typing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-full"
                onClick={() => setShowGitHubAnalyzer(true)}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg rounded-full bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Learn Programming Through Interactive Typing</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Master data structures, algorithms, and real-world projects by typing every character. Our AI-powered
            platform provides instant feedback, error correction, and structured lessons that build both coding
            knowledge and muscle memory.
          </p>
          {/* --- FIX #2 START: Added isLoading check to user stats --- */}
          {!isLoading && user && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{user.stats.totalLessonsCompleted}</div>
                  <div className="text-muted-foreground">Lessons Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{user.stats.bestWPM}</div>
                  <div className="text-muted-foreground">Best WPM</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{user.stats.bestAccuracy}%</div>
                  <div className="text-muted-foreground">Best Accuracy</div>
                </div>
              </div>
            </div>
          )}
          {/* --- FIX #2 END --- */}
        </div>
        
        {/* ... Rest of your component (Features, Learning Paths, etc.) ... */}
         {/* Features */}
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Code className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <CardTitle className="text-base font-semibold">GitHub Projects</CardTitle>
              <CardDescription className="text-sm">Learn from real repositories</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <CardTitle className="text-base font-semibold">AI-Generated Lessons</CardTitle>
              <CardDescription className="text-sm">Learning paths based on real projects</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-base font-semibold">Character-by-Character</CardTitle>
              <CardDescription className="text-sm">Type every character correctly</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Trophy className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <CardTitle className="text-base font-semibold">Progress Tracking</CardTitle>
              <CardDescription className="text-sm">Compete on the leaderboard</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Learning Paths */}
        <div className="max-w-6xl mx-auto mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Choose Your Learning Path</h3>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-all group border-2 border-blue-500/20 hover:border-blue-500/40">
              <CardHeader className="text-center pb-4">
                <Code className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                <CardTitle className="text-xl group-hover:text-blue-400 transition-colors">
                  GitHub Project Lesson Builder
                </CardTitle>
                <CardDescription>
                  Paste any GitHub repository and get structured lessons to learn by typing through real projects
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button onClick={() => setShowGitHubAnalyzer(true)} className="w-full">
                  Analyze GitHub Project
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all group border-2 border-green-500/20 hover:border-green-500/40">
              <CardHeader className="text-center pb-4">
                <BookOpen className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <CardTitle className="text-xl group-hover:text-green-400 transition-colors">
                  Data Structures & Algorithms
                </CardTitle>
                <CardDescription>
                  Master fundamental CS concepts through structured lessons and hands-on typing practice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Choose from {DSA_TOPICS.length} topics below</p>
              </CardContent>
            </Card>
          </div>

          {/* Topics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DSA_TOPICS.map((topic) => (
              <Card
                key={topic.id}
                className="cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => setSelectedTopic(topic.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${topic.color}`} />
                    <Badge
                      variant={
                        topic.difficulty === "Beginner"
                          ? "default"
                          : topic.difficulty === "Intermediate"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {topic.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-400 transition-colors">{topic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">{topic.description}</CardDescription>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{topic.lessons} lessons</span>
                    <Zap className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground text-xs">© 2025 Learning Enhanced.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}