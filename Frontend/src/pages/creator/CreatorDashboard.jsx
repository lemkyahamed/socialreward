import React from "react"
import { Link } from "react-router-dom"
import { PlayCircle, Target, ArrowUpRight, DollarSign, Loader2 } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { StatWidget } from "../../components/ui/StatWidget"
import { CampaignCard } from "../../components/shared/CampaignCard"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { useApi } from "../../hooks/useApi"

export function CreatorDashboard() {
  const { data: stats, loading: statsLoading } = useApi('/creator/dashboard')
  const { data: campaignsData } = useApi('/public/campaigns?limit=3')

  const recommendedCampaigns = campaignsData?.items?.slice(0, 3) || []
  const recentSubmissions = stats?.recentSubmissions || []

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Creator Dashboard" 
        description={`Welcome back! You've earned $${(stats?.totalEarnings || 0).toLocaleString()} total on SocialRewards.`}
        action={
          <Link to="/creator/campaigns">
            <Button>Find Campaigns</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget 
          title="Total Earnings" 
          value={`$${(stats?.totalEarnings || 0).toLocaleString()}`} 
          icon={DollarSign}
        />
        <StatWidget 
          title="Active Campaigns" 
          value={stats?.activeCampaigns || 0} 
          icon={Target} 
        />
        <StatWidget 
          title="Pending Approvals" 
          value={stats?.pendingApprovals || 0} 
          icon={PlayCircle} 
        />
        <StatWidget 
          title="Audience Reach" 
          value={stats?.reachLimit || "TBD"} 
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
                {recentSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-zinc-500 py-6">No recent submissions</TableCell>
                  </TableRow>
                ) : (
                  recentSubmissions.map((sub) => (
                    <TableRow key={sub._id}>
                      <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">{sub.campaignId?.title || "Campaign"}</TableCell>
                      <TableCell className="font-bold">${sub.campaignId?.rewardAmount?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-zinc-500 font-medium">{new Date(sub.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={sub.reviewStatus === "approved" ? "success" : sub.reviewStatus === "rejected" ? "danger" : "warning"}
                          className="capitalize px-2.5 py-0.5"
                        >
                          {sub.reviewStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
              <div key={camp._id} className="group relative flex items-center gap-4 rounded-xl border border-zinc-100 p-3.5 transition-all hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/50 hover:shadow-sm">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl shadow-sm bg-zinc-100">
                  <img src={camp.coverImage || `https://ui-avatars.com/api/?name=${camp.title}&background=random`} alt={camp.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-bold text-zinc-950 dark:text-zinc-50">{camp.title}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="truncate text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">{camp.brandName || camp.brand?.companyName || "Brand"}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">&middot;</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">${camp.rewardAmount?.toLocaleString()}</span>
                  </div>
                </div>
                <Link to={`/creator/campaigns/${camp._id}`} className="absolute inset-0">
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
