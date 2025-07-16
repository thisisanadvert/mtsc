"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { detectStrike } from '@/ai/flows/detect-strike-flow';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnalysisPage() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoSrc(URL.createObjectURL(file));
      setDetectionResult(null);
    }
  };

  const handlePlaybackRateChange = (rate: string) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = parseFloat(rate);
    }
  };

  const handleDetectStrike = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsDetecting(true);
    setDetectionResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUri = canvas.toDataURL('image/jpeg');

      try {
        const result = await detectStrike({ imageDataUri });
        setDetectionResult(result.strike);
      } catch (error) {
        console.error("Error detecting strike:", error);
        setDetectionResult('Error');
      }
    }
    
    setIsDetecting(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Video Analysis</h1>
        <p className="text-muted-foreground">
          Upload a video to analyze your strikes frame by frame.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Video</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="video-upload">Select Video File</Label>
            <Input id="video-upload" type="file" accept="video/*" onChange={handleFileChange} />
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
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="playback-speed">Speed:</Label>
                <Select defaultValue="1" onValueChange={handlePlaybackRateChange}>
                  <SelectTrigger id="playback-speed" className="w-[80px]">
                    <SelectValue placeholder="Speed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="0.25">0.25x</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleDetectStrike} disabled={isDetecting}>
                {isDetecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Detect Strike on Current Frame
              </Button>

              {detectionResult && (
                 <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Result:</p>
                    <Badge variant={detectionResult === 'none' ? 'secondary' : 'default'}>
                        {detectionResult.charAt(0).toUpperCase() + detectionResult.slice(1)}
                    </Badge>
                 </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}