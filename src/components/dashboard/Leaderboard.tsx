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

const leaderboardData = [
  { rank: 1, name: "Ryu", score: 124, avatar: "R" },
  { rank: 2, name: "Chun-Li", score: 118, avatar: "CL" },
  { rank: 3, name: "Sagat", score: 112, avatar: "S" },
  { rank: 4, name: "You", score: 60, avatar: "Y", isCurrentUser: true },
  { rank: 5, name: "Ken", score: 58, avatar: "K" },
];

export function Leaderboard() {
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
                    <span>{player.name}</span>
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
