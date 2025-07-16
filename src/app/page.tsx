
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KickIcon, PunchIcon } from "@/components/icons";
import { LayoutDashboard, Trophy, Info, ArrowLeft, User, Instagram, LogOut } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { detectStrike } from "@/ai/flows/detect-strike-flow";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type SessionState = "idle" | "running" | "finished";
type GameMode = "100-kicks" | "300-punches";
type UserProfile = {
  name: string;
  instagram?: string;
};

const UserProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  instagram: z.string().optional(),
});


const SESSION_DURATION = 60; // 1 minute for both challenges
const CAPTURE_INTERVAL = 500; // Capture a frame every 500ms
const CAPTURE_WIDTH = 480;
const CAPTURE_HEIGHT = 360;


const gameConfig = {
  "100-kicks": {
    title: "100 Kicks Challenge",
    goal: 100,
    strikeType: "kicks",
    Icon: KickIcon,
  },
  "300-punches": {
    title: "300 Punches Challenge",
    goal: 300,
    strikeType: "punches",
    Icon: PunchIcon,
  },
};

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameMode | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
  const [kicks, setKicks] = useState(0);
  const [punches, setPunches] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout>();
  const sessionTimerRef = useRef<NodeJS.Timeout>();
  const isDetecting = useRef(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof UserProfileSchema>>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      name: "",
      instagram: "",
    },
  });

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error("Failed to parse user profile from localStorage", error);
      localStorage.removeItem("userProfile");
    }
  }, []);

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

  const stopSession = useCallback(() => {
    setSessionState("finished");
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    detectionIntervalRef.current = undefined;
    sessionTimerRef.current = undefined;

    let finalKicks = 0;
    let finalPunches = 0;
    setKicks(k => { finalKicks = k; return k; });
    setPunches(p => { finalPunches = p; return p; });

    if (selectedGame) {
      const config = gameConfig[selectedGame];
      const currentScore = config.strikeType === 'kicks' ? finalKicks : finalPunches;
      setFinalScore(currentScore);

      if (currentScore > topScore) {
        setTopScore(currentScore);
        localStorage.setItem("topScore", currentScore.toString());
        if (userProfile) {
          localStorage.setItem(`leaderboard_you`, JSON.stringify({ name: userProfile.name, score: currentScore, instagram: userProfile.instagram }));
        }
      }
    }
  }, [selectedGame, topScore, userProfile]);


  const captureAndDetect = useCallback(async () => {
    if (isDetecting.current) return;
    if (videoRef.current && canvasRef.current) {
      isDetecting.current = true;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = CAPTURE_WIDTH;
      canvas.height = CAPTURE_HEIGHT;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUri = canvas.toDataURL('image/jpeg', 0.8);
        
        try {
          const { strike } = await detectStrike({ imageDataUri });
          if (sessionState === 'running') {
            if (strike === 'punch') {
              setPunches((p) => p + 1);
            } else if (strike === 'kick') {
              setKicks((k) => k + 1);
            }
          }
        } catch (error) {
          console.error("Error detecting strike:", error);
        } finally {
          isDetecting.current = false;
        }
      } else {
        isDetecting.current = false;
      }
    }
  }, [sessionState]);
  
  const startSession = useCallback(() => {
    setSessionState("running");
    setTimeRemaining(SESSION_DURATION);
    setPunches(0);
    setKicks(0);
    setFinalScore(0);
    detectionIntervalRef.current = setInterval(captureAndDetect, CAPTURE_INTERVAL);
    sessionTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          stopSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [captureAndDetect, stopSession]);

  useEffect(() => {
    if (sessionState === "running" && selectedGame) {
      const config = gameConfig[selectedGame];
      const currentCount = config.strikeType === 'kicks' ? kicks : punches;
      if (currentCount >= config.goal) {
        stopSession();
      }
    }
    // Cleanup timers when component unmounts
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [sessionState, kicks, punches, selectedGame, stopSession]);

  const handleStartButtonClick = () => {
    if (hasCameraPermission !== true) return;
    if (sessionState === "idle" || sessionState === "finished") {
      startSession();
    } else { // running
      stopSession();
    }
  };

  const handleBackToSelection = () => {
    setSessionState("idle");
    setSelectedGame(null);
    setPunches(0);
    setKicks(0);
    setFinalScore(0);
    setTimeRemaining(SESSION_DURATION);
  };
  
  const onProfileSubmit: SubmitHandler<z.infer<typeof UserProfileSchema>> = (data) => {
    const profile = { name: data.name, instagram: data.instagram || undefined };
    localStorage.setItem("userProfile", JSON.stringify(profile));
    setUserProfile(profile);
  };

  const handleSwitchUser = () => {
    localStorage.removeItem("userProfile");
    setUserProfile(null);
    form.reset({ name: "", instagram: "" });
  };


  const buttonText = {
    idle: "Start Challenge",
    running: "Stop Challenge",
    finished: "Try Again",
  };
  
  const renderProfileForm = () => (
    <div className="relative z-10 w-full max-w-sm mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Strike Counter!</CardTitle>
          <CardContent className="pt-4 px-0 pb-0">
            <p className="text-muted-foreground mb-4">Please create a profile to track your scores on the leaderboard.</p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                           <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input placeholder="e.g. John Doe" {...field} className="pl-9" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram (Optional)</FormLabel>
                      <FormControl>
                         <div className="relative flex items-center">
                           <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input placeholder="e.g. johndoe" {...field} className="pl-9" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Save Profile & Start</Button>
              </form>
            </Form>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );

  const renderGameSelection = () => (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-2 font-headline">Choose Your Challenge</h2>
      <p className="text-muted-foreground mb-8">Select a game mode to start your training session.</p>
      <div className="grid md:grid-cols-2 gap-6">
        <Card 
          className="bg-card/80 hover:bg-primary/20 border-2 border-transparent hover:border-primary cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => setSelectedGame("100-kicks")}
        >
          <CardHeader>
            <CardTitle className="flex flex-col items-center gap-4">
              <KickIcon className="w-20 h-20 text-primary" />
              <span>100 Kicks Challenge</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Land 100 kicks in 60 seconds.</p>
          </CardContent>
        </Card>
        <Card 
          className="bg-card/80 hover:bg-primary/20 border-2 border-transparent hover:border-primary cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => setSelectedGame("300-punches")}
        >
          <CardHeader>
            <CardTitle className="flex flex-col items-center gap-4">
              <PunchIcon className="w-20 h-20 text-primary" />
              <span>300 Punches Challenge</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Land 300 punches in 60 seconds.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTrainingSession = () => {
    if (!selectedGame) return null;
    const config = gameConfig[selectedGame];
    const currentCount = config.strikeType === 'kicks' ? kicks : punches;
    const isGoalReached = finalScore >= config.goal;

    return (
      <div className="relative z-10 w-full flex flex-col items-center justify-center h-full p-4">
        <div className="absolute top-4 left-4">
            <Button variant="ghost" size="sm" onClick={handleBackToSelection}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
        </div>
        <div className="absolute top-4 text-6xl font-bold text-accent font-mono tabular-nums bg-background/50 backdrop-blur-sm px-4 py-2 rounded-lg">
          {timeRemaining}
        </div>

        <div className="flex-1 flex items-center justify-center w-full">
          <div className="text-center">
            {sessionState !== "finished" ? (
                <>
                    <config.Icon className="w-24 h-24 text-primary mx-auto mb-4" />
                    <span className="text-9xl font-bold font-mono tabular-nums text-foreground transition-all duration-300">{currentCount}</span>
                    <span className="text-4xl font-mono text-muted-foreground">/{config.goal}</span>
                    <p className="text-2xl text-muted-foreground mt-2">{config.title}</p>
                </>
            ) : (
                <div className="text-center">
                    <h2 className="text-5xl font-bold font-headline mb-4">
                        {isGoalReached ? "Challenge Complete!" : "Time's Up!"}
                    </h2>
                    <p className="text-2xl text-muted-foreground mb-2">You landed</p>
                    <p className="text-8xl font-bold font-mono text-primary mb-4">{finalScore} <span className="text-6xl">{config.strikeType}</span></p>
                    <p className="text-xl text-muted-foreground">
                        {isGoalReached ? `You did it in ${SESSION_DURATION - timeRemaining} seconds!` : "Better luck next time!"}
                    </p>
                </div>
            )}
            </div>
        </div>

        <div className="w-full max-w-xs mt-auto flex flex-col gap-4">
          {(sessionState === "idle" || sessionState === "finished") && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Pro Tips for Best Results</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-xs">
                  <li>Ensure you are in a well-lit area.</li>
                  <li>Have a clear, non-cluttered background.</li>
                  <li>
                    <strong>Punches:</strong> Stand facing the camera and punch
                    directly towards it for best detection.
                  </li>
                  <li>
                    <strong>Kicks:</strong> Ensure your full body is visible in
                    the camera frame.
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleStartButtonClick}
            size="lg"
            className={`w-full h-16 text-2xl font-bold ${sessionState === "running" ? "bg-destructive hover:bg-destructive/90" : ""}`}
            disabled={hasCameraPermission !== true}
          >
            {sessionState === "finished" && isGoalReached ? "New Challenge" : buttonText[sessionState]}
          </Button>
           {sessionState === "finished" && (
             <Button variant="outline" onClick={handleBackToSelection}>Choose Different Challenge</Button>
           )}
        </div>
      </div>
    );
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
           {userProfile && (
            <Button variant="outline" size="icon" onClick={handleSwitchUser} title="Switch User">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Switch User</span>
            </Button>
          )}
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

        {!userProfile
          ? renderProfileForm()
          : selectedGame
          ? renderTrainingSession()
          : renderGameSelection()}
      </main>
    </div>
  );
}

    