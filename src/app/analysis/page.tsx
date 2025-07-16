"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { detectStrike } from '@/ai/flows/detect-strike-flow';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { KickIcon, PunchIcon } from '@/components/icons';

const ANALYSIS_FRAME_SKIP = 5; // Analyze every 5th frame to speed up the process

export default function AnalysisPage() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [punchCount, setPunchCount] = useState(0);
  const [kickCount, setKickCount] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const isDetecting = useRef(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoSrc(URL.createObjectURL(file));
      resetAnalysis();
    }
  };
  
  const resetAnalysis = () => {
    setPunchCount(0);
    setKickCount(0);
    setAnalysisProgress(0);
    setAnalysisComplete(false);
    setIsAnalyzing(false);
    isDetecting.current = false;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }

  const startAnalysis = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    resetAnalysis();
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    video.currentTime = 0;
    video.pause();

    let frameCount = 0;

    const processFrame = async () => {
      if (!videoRef.current || video.currentTime >= video.duration || !isAnalyzing) {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        return;
      }

      if (isDetecting.current) {
        animationFrameId.current = requestAnimationFrame(processFrame);
        return;
      }

      video.currentTime += (ANALYSIS_FRAME_SKIP / (await getVideoFrameRate(video)));

      if (video.seeking) {
        video.onseeked = () => {
          video.onseeked = null; // a little hack to prevent infinite loop
          detectInFrame();
        }
      } else {
         await detectInFrame();
      }
    };
    
    const detectInFrame = async () => {
        if (!videoRef.current || !canvasRef.current || isDetecting.current) return;
        
        isDetecting.current = true;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageDataUri = canvas.toDataURL('image/jpeg', 0.8);
            try {
                const result = await detectStrike({ imageDataUri });
                if (result.strike === 'punch') {
                    setPunchCount(p => p + 1);
                } else if (result.strike === 'kick') {
                    setKickCount(k => k + 1);
                }
            } catch (error) {
                console.error("Error during strike detection:", error);
            }
        }
        
        setAnalysisProgress((video.currentTime / video.duration) * 100);
        isDetecting.current = false;
        animationFrameId.current = requestAnimationFrame(processFrame);
    }
    
    animationFrameId.current = requestAnimationFrame(processFrame);
  };
  
  // Helper to get video frame rate, with a fallback
  const getVideoFrameRate = (video: HTMLVideoElement): Promise<number> => {
      return new Promise((resolve) => {
          if ('requestVideoFrameCallback' in video) {
              let frameCount = 0;
              let startTime = performance.now();
              const callback = () => {
                  frameCount++;
                  if (frameCount === 10) {
                      const endTime = performance.now();
                      const rate = 1000 * frameCount / (endTime - startTime);
                      resolve(rate);
                  } else {
                      video.requestVideoFrameCallback(callback);
                  }
              }
              video.requestVideoFrameCallback(callback);
          } else {
              resolve(30); // Fallback to 30fps
          }
      });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Video Analysis</h1>
        <p className="text-muted-foreground">
          Upload a video to automatically count your strikes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Video</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="video-upload">Select Video File</Label>
            <Input id="video-upload" type="file" accept="video/*" onChange={handleFileChange} disabled={isAnalyzing}/>
          </div>
        </CardContent>
      </Card>

      {videoSrc && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video w-full bg-card rounded-md overflow-hidden border">
              <video ref={videoRef} src={videoSrc} controls className="w-full h-full" />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex flex-col gap-4">
              <Button onClick={startAnalysis} disabled={isAnalyzing || !videoSrc}>
                {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
              </Button>

              {isAnalyzing && (
                <div className="space-y-2">
                    <Label>Analysis Progress</Label>
                    <Progress value={analysisProgress} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {analysisComplete && (
        <Card>
            <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Punches</CardTitle>
                        <PunchIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{punchCount}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Kicks</CardTitle>
                        <KickIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kickCount}</div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
