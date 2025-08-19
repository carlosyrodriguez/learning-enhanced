"use client"

import { Leaderboard } from "@/components/leaderboard"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LeaderboardPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="text-foreground hover:bg-card">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <Leaderboard />
      </div>
    </div>
  )
}
