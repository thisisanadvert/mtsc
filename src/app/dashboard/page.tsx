import { AchievementCard } from "@/components/dashboard/AchievementCard";
import { HistoryChart } from "@/components/dashboard/HistoryChart";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { Medal, Star, Zap } from "lucide-react";

export default function DashboardPage() {
  const achievements = [
    { icon: Medal, title: "Century Striker", description: "Land 100 total strikes." },
    { icon: Star, title: "Perfect Session", description: "Achieve a top score of 50." },
    { icon: Zap, title: "Training Streak", description: "Train 3 days in a row." },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Your Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and celebrate your achievements.
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HistoryChart />
        </div>
        <div className="lg:col-span-1">
          <Leaderboard />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Achievements</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((ach, index) => (
            <AchievementCard key={index} {...ach} />
          ))}
        </div>
      </div>
    </div>
  );
}
