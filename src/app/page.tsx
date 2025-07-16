"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KickIcon, PunchIcon } from "@/components/icons";
import { LayoutDashboard, Trophy } from "lucide-react";

type SessionState = "idle" | "running" | "finished";

const SESSION_DURATION = 30;

export default function Home() {
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
  const [kicks, setKicks] = useState(0);
  const [punches, setPunches] = useState(0);
  const [topScore, setTopScore] = useState(0);

  useEffect(() => {
    const storedTopScore = localStorage.getItem("topScore");
    if (storedTopScore) {
      setTopScore(parseInt(storedTopScore, 10));
    }
  }, []);

  const resetSession = useCallback(() => {
    setSessionState("idle");
    setTimeRemaining(SESSION_DURATION);
    const currentScore = kicks + punches;
    if (currentScore > topScore) {
      setTopScore(currentScore);
      localStorage.setItem("topScore", currentScore.toString());
    }
    setKicks(0);
    setPunches(0);
  }, [kicks, punches, topScore]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionState === "running" && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
        // Simulate strike detection
        if (Math.random() > 0.6) {
          if (Math.random() > 0.5) {
            setKicks((k) => k + 1);
          } else {
            setPunches((p) => p + 1);
          }
        }
      }, 1000);
    } else if (timeRemaining === 0 && sessionState === "running") {
      setSessionState("finished");
      resetSession();
    }
    return () => clearInterval(timer);
  }, [sessionState, timeRemaining, resetSession]);

  const handleButtonClick = () => {
    if (sessionState === "idle" || sessionState === "finished") {
      setSessionState("running");
    } else {
      resetSession();
    }
  };

  const buttonText = {
    idle: "Start Session",
    running: "Stop Session",
    finished: "Start New Session",
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-primary font-headline">CounterPunch</h1>
        <div className="flex items-center gap-4">
          <Card className="bg-card/80 border-primary/50 text-center">
            <CardContent className="p-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Top Score</p>
                <p className="font-bold text-lg">{topScore}</p>
              </div>
            </CardContent>
          </Card>
          <Button asChild variant="outline" size="icon">
            <Link href="/dashboard">
              <LayoutDashboard className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 w-full h-full bg-card rounded-xl border-2 border-dashed border-border flex items-center justify-center">
          <p className="text-muted-foreground">Camera Feed Area</p>
        </div>

        <div className="relative z-10 w-full flex flex-col items-center justify-center h-full p-4">
          <div className="absolute top-4 text-6xl font-bold text-accent font-mono tabular-nums bg-background/50 backdrop-blur-sm px-4 py-2 rounded-lg">
            {timeRemaining}
          </div>

          <div className="flex-1 flex items-center justify-center w-full">
            <div className="grid grid-cols-2 gap-8 text-center w-full max-w-md">
              <div className="flex flex-col items-center gap-2">
                <PunchIcon className="w-16 h-16 text-primary" />
                <span className="text-7xl font-bold font-mono tabular-nums text-foreground transition-all duration-300">{punches}</span>
                <span className="text-xl text-muted-foreground">Punches</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <KickIcon className="w-16 h-16 text-primary" />
                <span className="text-7xl font-bold font-mono tabular-nums text-foreground transition-all duration-300">{kicks}</span>
                <span className="text-xl text-muted-foreground">Kicks</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-xs mt-auto">
            <Button
              onClick={handleButtonClick}
              size="lg"
              className={`w-full h-16 text-2xl font-bold ${sessionState === "running" ? "bg-destructive hover:bg-destructive/90" : ""}`}
            >
              {buttonText[sessionState]}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
