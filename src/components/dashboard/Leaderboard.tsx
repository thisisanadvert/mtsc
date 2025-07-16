
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Instagram } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Player = {
  rank: number;
  name: string;
  score: number;
  avatar: string;
  instagram: string | null;
  isCurrentUser?: boolean;
};

const defaultLeaderboardData: Omit<Player, 'rank'>[] = [
  { name: "Ryu", score: 124, avatar: "R", instagram: "ryu" },
  { name: "Chun-Li", score: 118, avatar: "CL", instagram: null },
  { name: "Sagat", score: 112, avatar: "S", instagram: "sagat" },
  { name: "Ken", score: 58, avatar: "K", instagram: null },
];

export function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);

  useEffect(() => {
    const youDataString = localStorage.getItem("leaderboard_you");
    let youData = null;
    if (youDataString) {
      try {
        const parsed = JSON.parse(youDataString);
        youData = {
          name: parsed.name || "You",
          score: parsed.score || 0,
          avatar: (parsed.name || "Y").charAt(0).toUpperCase(),
          instagram: parsed.instagram || null,
          isCurrentUser: true,
        };
      } catch (e) {
        console.error("Could not parse user data from local storage", e)
      }
    } else {
        const profileString = localStorage.getItem("userProfile");
        if(profileString) {
            try {
                const parsed = JSON.parse(profileString);
                youData = {
                    name: parsed.name || "You",
                    score: 0,
                    avatar: (parsed.name || "Y").charAt(0).toUpperCase(),
                    instagram: parsed.instagram || null,
                    isCurrentUser: true,
                };
            } catch (e) {
                 console.error("Could not parse user profile from local storage", e)
            }
        }
    }
    
    const combinedData = [...defaultLeaderboardData];
    if (youData) {
      combinedData.push(youData);
    }
    
    const sortedData = combinedData
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));

    setLeaderboardData(sortedData);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((player) => (
              <TableRow key={player.rank} className={player.isCurrentUser ? "bg-primary/20" : ""}>
                <TableCell className="font-medium">{player.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${player.avatar}`} />
                      <AvatarFallback>{player.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{player.name}</span>
                    {player.instagram && (
                      <Link href={`https://instagram.com/${player.instagram}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <Instagram className="h-4 w-4" />
                        <span className="sr-only">Instagram</span>
                      </Link>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{player.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
