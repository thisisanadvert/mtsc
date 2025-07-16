"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KickIcon, PunchIcon } from "@/components/icons";
import { LayoutDashboard, Trophy } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { detectStrike } from "@/ai/flows/detect-strike-flow";

type SessionState = "idle" | "running" | "finished";

const SESSION_DURATION = 30;

export default function Home() {
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
  const [kicks, setKicks] = useState(0);
  const [punches, setPunches] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
  }, [toast]);
  
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

  const captureAndDetect = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUri = canvas.toDataURL('image/jpeg');
        
        try {
          const { strike } = await detectStrike({ imageDataUri });
          if (strike === 'punch') {
            setPunches((p) => p + 1);
          } else if (strike === 'kick') {
            setKicks((k) => k + 1);
          }
        } catch (error) {
          console.error("Error detecting strike:", error);
          toast({
            variant: "destructive",
            title: "Strike Detection Failed",
            description: "Could not analyze the video frame. Please try again.",
          });
        }
      }
    }
  }, [toast]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionState === "running" && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
        captureAndDetect();
      }, 1000);
    } else if (timeRemaining === 0 && sessionState === "running") {
      setSessionState("finished");
      resetSession();
    }
    return () => clearInterval(timer);
  }, [sessionState, timeRemaining, resetSession, captureAndDetect]);

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
        <h1 className="text-2xl font-bold text-primary font-headline">Strike Counter</h1>
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
        <div className="absolute inset-0 w-full h-full bg-card rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
        
        {hasCameraPermission === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Alert variant="destructive" className="max-w-sm">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser to use this feature. You might need to refresh the page.
                </AlertDescription>
            </Alert>
          </div>
        )}

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
              disabled={hasCameraPermission !== true}
            >
              {buttonText[sessionState]}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
