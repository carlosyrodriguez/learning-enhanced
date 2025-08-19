"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, User, Zap, Target, BookOpen } from "lucide-react"

interface LeaderboardUser {
  id: string
  username: string
  stats: {
    totalLessonsCompleted: number
    totalWPM: number
    totalAccuracy: number
    bestWPM: number
    bestAccuracy: number
  }
  joinedAt: string
}

type SortBy = "bestWPM" | "bestAccuracy" | "totalLessonsCompleted"

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [sortBy, setSortBy] = useState<SortBy>("bestWPM")
  const { user } = useAuth()

  useEffect(() => {
    // Load users from localStorage
    const allUsers = JSON.parse(localStorage.getItem("learning-enhanced-users") || "[]")
    const usersWithStats = allUsers
      .filter((u: any) => u.stats.totalLessonsCompleted > 0) // Only show users who have completed at least one lesson
      .map((u: any) => ({
        id: u.id,
        username: u.username,
        stats: u.stats,
        joinedAt: u.joinedAt,
      }))
    setUsers(usersWithStats)
  }, [])

  const sortedUsers = [...users].sort((a, b) => {
    switch (sortBy) {
      case "bestWPM":
        return b.stats.bestWPM - a.stats.bestWPM
      case "bestAccuracy":
        return b.stats.bestAccuracy - a.stats.bestAccuracy
      case "totalLessonsCompleted":
        return b.stats.totalLessonsCompleted - a.stats.totalLessonsCompleted
      default:
        return 0
    }
  })

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-muted-foreground font-bold text-sm">#{rank}</span>
    }
  }

  const getCurrentUserRank = () => {
    if (!user) return null
    const rank = sortedUsers.findIndex((u) => u.id === user.id) + 1
    return rank > 0 ? rank : null
  }

  const getSortLabel = (sort: SortBy) => {
    switch (sort) {
      case "bestWPM":
        return "Best WPM"
      case "bestAccuracy":
        return "Best Accuracy"
      case "totalLessonsCompleted":
        return "Lessons Completed"
    }
  }

  const getSortValue = (userStats: LeaderboardUser["stats"], sort: SortBy) => {
    switch (sort) {
      case "bestWPM":
        return `${userStats.bestWPM} WPM`
      case "bestAccuracy":
        return `${userStats.bestAccuracy}%`
      case "totalLessonsCompleted":
        return `${userStats.totalLessonsCompleted} lessons`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
        </div>
        <div className="flex gap-2">
          <Button variant={sortBy === "bestWPM" ? "default" : "outline"} size="sm" onClick={() => setSortBy("bestWPM")}>
            <Zap className="h-4 w-4 mr-1" />
            WPM
          </Button>
          <Button
            variant={sortBy === "bestAccuracy" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("bestAccuracy")}
          >
            <Target className="h-4 w-4 mr-1" />
            Accuracy
          </Button>
          <Button
            variant={sortBy === "totalLessonsCompleted" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("totalLessonsCompleted")}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Lessons
          </Button>
        </div>
      </div>

      {user && (
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-purple-400" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{getCurrentUserRank() || "N/A"}</div>
                <div className="text-sm text-muted-foreground">Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{user.stats.bestWPM}</div>
                <div className="text-sm text-muted-foreground">Best WPM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{user.stats.bestAccuracy}%</div>
                <div className="text-sm text-muted-foreground">Best Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{user.stats.totalLessonsCompleted}</div>
                <div className="text-sm text-muted-foreground">Lessons</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Top Performers - {getSortLabel(sortBy)}</span>
            <Badge variant="secondary">{sortedUsers.length} users</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users on the leaderboard yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Complete a lesson to appear here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedUsers.slice(0, 10).map((leaderboardUser, index) => {
                const rank = index + 1
                const isCurrentUser = user?.id === leaderboardUser.id

                return (
                  <div
                    key={leaderboardUser.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                      isCurrentUser
                        ? "border-purple-500/50 bg-purple-500/10"
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8">{getRankIcon(rank)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{leaderboardUser.username}</span>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Joined {new Date(leaderboardUser.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-400">
                        {getSortValue(leaderboardUser.stats, sortBy)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {leaderboardUser.stats.totalLessonsCompleted} lessons completed
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {sortedUsers.length > 10 && (
        <div className="text-center">
          <p className="text-muted-foreground">Showing top 10 users. {sortedUsers.length - 10} more users below.</p>
        </div>
      )}
    </div>
  )
}
