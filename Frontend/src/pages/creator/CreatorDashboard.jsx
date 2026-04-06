import React from "react"
import { Link } from "react-router-dom"
import { 
  PlayCircle, Target, ArrowUpRight, DollarSign, Loader2, 
  Wallet, Clock, Building, ShieldCheck, CheckCircle2, ChevronRight 
} from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { StatWidget } from "../../components/ui/StatWidget"
import { TrustBadge } from "../../components/shared/TrustBadge"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { useApi } from "../../hooks/useApi"
import { useAuth } from "../../contexts/AuthContext"

export function CreatorDashboard() {
  const { user } = useAuth()
  const { data: stats, loading: statsLoading } = useApi('/creator/dashboard')
  const { data: earningsData, loading: earningsLoading } = useApi('/creator/earnings')
  const { data: campaignsData } = useApi('/public/campaigns?limit=3')

  const recommendedCampaigns = campaignsData?.items?.slice(0, 3) || []
  const recentSubmissions = stats?.recentSubmissions || []
  const isOnboarded = user?.profile?.isOnboarded
  const isPayoutConnected = user?.profile?.payoutConnected

  if (statsLoading || earningsLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    )
  }

  // Fallbacks for data
  const availableToWithdraw = earningsData?.paidOut || 0
  const pendingEarnings = earningsData?.pendingPayout || 0
  const thisMonthEarnings = stats?.recentEarnings?.[stats?.recentEarnings?.length - 1]?.amount || 0
  const trustScore = user?.profile?.trustScore || 0
  const activeTrackedPosts = stats?.activeCampaigns || 0 // Reusing active campaigns as semantic match for now

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Creator Dashboard" 
        description={`Welcome back, ${user?.profile?.displayName || 'Creator'}! Track your revenue and manage your content.`}
      />

      {/* Top Banner - Earning Status */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-950 p-6 md:p-8 text-white shadow-premium">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand-400/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest text-brand-300">Creator Status</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <CheckCircle2 className={`h-4 w-4 ${isOnboarded ? 'text-green-400' : 'text-zinc-600'}`} />
                  Profile {isOnboarded ? 'Verified' : 'Pending'}
                </span>
                <span className="text-brand-700/50">&bull;</span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <Building className={`h-4 w-4 ${isPayoutConnected ? 'text-green-400' : 'text-zinc-600'}`} />
                  Bank {isPayoutConnected ? 'Linked' : 'Not Linked'}
                </span>
              </div>
            </div>

            <div className="h-12 w-px hidden sm:block bg-brand-800"></div>

            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest text-brand-300">Active Content</p>
              <p className="text-2xl font-black">{activeTrackedPosts} <span className="text-sm font-bold text-brand-300">posts earning</span></p>
            </div>
          </div>

          <div className="shrink-0">
            <Link to="/creator/earnings">
              <Button className="h-12 rounded-xl bg-white text-brand-950 hover:bg-zinc-100 hover:text-brand-900 border-none font-bold shadow-lg">
                Withdraw Funds
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Trust & Earnings Matrix */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Row 1 */}
        <StatWidget 
          title="Available to Withdraw" 
          value={`$${availableToWithdraw.toLocaleString()}`} 
          icon={Wallet}
        />
        <StatWidget 
          title="Pending Earnings" 
          value={`$${pendingEarnings.toLocaleString()}`} 
          icon={Clock} 
        />
        <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 line-clamp-1">Payout Status</p>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-inner ${isPayoutConnected ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
              {isPayoutConnected ? <CheckCircle2 className="h-5 w-5" /> : <Building className="h-5 w-5" />}
            </div>
          </div>
          <div>
            <h4 className="font-display text-2xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight mt-2">{isPayoutConnected ? 'Connected' : 'Action Needed'}</h4>
            {!isPayoutConnected && (
              <Link to="/creator/payout-setup" className="text-xs font-bold text-brand-600 mt-1 flex items-center hover:underline">
                Setup now <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            )}
          </div>
        </div>

        {/* Row 2 */}
        <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 line-clamp-1">Trust Mapping</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 shadow-inner">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <TrustBadge 
              label={user?.profile?.trustLabel || "New"} 
              score={user?.profile?.trustScore || 50} 
              showScore={true} 
            />
          </div>
        </div>
        <StatWidget 
          title="Active Tracked Posts" 
          value={activeTrackedPosts} 
          icon={Target} 
        />
        <StatWidget 
          title="This Month's Earnings" 
          value={`$${thisMonthEarnings.toLocaleString()}`} 
          icon={DollarSign} 
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Recent Submissions & Main Activity */}
        <Card className="lg:col-span-2 shadow-soft border-zinc-100 dark:border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 dark:border-zinc-800/50 pb-6 px-8 py-6">
            <CardTitle className="text-xl font-display font-bold">Recent Submissions</CardTitle>
            <Link to="/creator/earnings">
              <Button variant="link" size="sm" className="font-bold text-brand-600">
                View earnings link
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-50 dark:border-zinc-800/50">
                  <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest leading-none">Campaign</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest leading-none">Reward</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest leading-none">Date</TableHead>
                  <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest leading-none">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-zinc-500 py-10">
                      <div className="flex flex-col items-center gap-2">
                        <PlayCircle className="h-8 w-8 text-zinc-300" />
                        <span className="font-bold">No active submissions tracked</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentSubmissions.map((sub) => (
                    <TableRow key={sub._id} className="border-zinc-50 dark:border-zinc-800/50">
                      <TableCell className="px-8 py-5 font-bold text-zinc-900 dark:text-zinc-100">
                        {sub.campaignId?.title || "Campaign"}
                      </TableCell>
                      <TableCell className="py-5 font-display text-lg font-black text-green-600 dark:text-green-400">
                        ${sub.campaignId?.rewardAmount?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-zinc-500 font-bold text-xs">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-8 py-5">
                        <Badge 
                          variant={sub.reviewStatus === "approved" ? "success" : sub.reviewStatus === "rejected" ? "danger" : "warning"}
                          className="capitalize rounded tracking-widest text-[10px]"
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

        {/* Right Column: Recommendations */}
        <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50">
          <CardHeader className="border-b border-zinc-50 dark:border-zinc-800/50 pb-6 px-6 py-6">
            <CardTitle className="text-xl font-display font-bold">Recommended For You</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {recommendedCampaigns.map(camp => (
              <div key={camp._id} className="group relative flex items-center gap-4 rounded-xl border border-zinc-100 p-4 transition-all hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/50 hover:shadow-sm">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl shadow-sm bg-zinc-100">
                  <img 
                    src={camp.coverImage || `https://ui-avatars.com/api/?name=${camp.title}&background=random`} 
                    alt={camp.title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-brand-600 transition-colors">{camp.title}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="truncate text-[10px] font-bold uppercase tracking-wider text-branch-600 dark:text-zinc-400">
                      {camp.brandName || camp.brand?.companyName || "Brand"}
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">&middot;</span>
                    <span className="text-xs font-black text-green-600 dark:text-green-400">${camp.rewardAmount?.toLocaleString()}</span>
                  </div>
                </div>
                <Link to={`/creator/campaigns/${camp._id}`} className="absolute inset-0">
                  <span className="sr-only">View Campaign</span>
                </Link>
              </div>
            ))}
            <Link to="/creator/campaigns" className="block mt-6">
              <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-widest h-12">Browse Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
