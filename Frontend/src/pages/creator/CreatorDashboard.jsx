import React from "react"
import { Link } from "react-router-dom"
import { PlayCircle, Target, ArrowUpRight, DollarSign } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { StatWidget } from "../../components/ui/StatWidget"
import { CampaignCard } from "../../components/shared/CampaignCard"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { mockCreatorStats, mockCampaigns, mockSubmissions } from "../../data/mockData"

export function CreatorDashboard() {
  const recommendedCampaigns = mockCampaigns.filter(c => !c.hasJoined).slice(0, 3)
  const recentSubmissions = mockSubmissions.slice(0, 5)

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Creator Dashboard" 
        description={`Welcome back! You've earned ${mockCreatorStats.totalEarnings} total on SocialRewards.`}
        action={
          <Link to="/creator/campaigns">
            <Button>Find Campaigns</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget 
          title="Total Earnings" 
          value={mockCreatorStats.totalEarnings} 
          icon={DollarSign} 
          trend="up" 
          trendValue="+14% from last month"
        />
        <StatWidget 
          title="Active Campaigns" 
          value={mockCreatorStats.activeCampaigns} 
          icon={Target} 
        />
        <StatWidget 
          title="Pending Approvals" 
          value={mockCreatorStats.pendingApprovals} 
          icon={PlayCircle} 
        />
        <StatWidget 
          title="Audience Reach" 
          value={mockCreatorStats.reachLimit} 
          icon={ArrowUpRight} 
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
            <CardTitle className="text-lg">Recent Submissions</CardTitle>
            <Link to="/creator/earnings">
              <Button variant="link" size="sm" className="font-bold">
                View all earnings
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">{sub.campaignTitle}</TableCell>
                    <TableCell className="font-bold">{sub.rewardAmt}</TableCell>
                    <TableCell className="text-zinc-500 font-medium">{new Date(sub.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={sub.status === "approved" ? "success" : sub.status === "rejected" ? "danger" : "warning"}
                        className="capitalize px-2.5 py-0.5"
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
            <CardTitle className="text-lg">Recommended For You</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {recommendedCampaigns.map(camp => (
              <div key={camp.id} className="group relative flex items-center gap-4 rounded-xl border border-zinc-100 p-3.5 transition-all hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/50 hover:shadow-sm">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl shadow-sm">
                  <img src={camp.coverImage} alt={camp.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-bold text-zinc-950 dark:text-zinc-50">{camp.title}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="truncate text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">{camp.brandName}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">&middot;</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{camp.rewardAmt}</span>
                  </div>
                </div>
                <Link to={`/creator/campaigns/${camp.id}`} className="absolute inset-0">
                  <span className="sr-only">View Campaign</span>
                </Link>
              </div>
            ))}
            <Link to="/creator/campaigns" className="block mt-4">
              <Button variant="outline" className="w-full">Browse All Campaigns</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
