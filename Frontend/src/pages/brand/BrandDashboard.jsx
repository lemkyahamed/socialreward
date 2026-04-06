import React from "react"
import { Link } from "react-router-dom"
import { Target, DollarSign, CheckCircle2, PlayCircle, Plus, Loader2, ArrowUpRight, BarChart3, AlertCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PageHeader } from "../../components/shared/PageHeader"
import { StatWidget } from "../../components/ui/StatWidget"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { useApi } from "../../hooks/useApi"

export function BrandDashboard() {
  const { data: stats, loading, error } = useApi('/brand/dashboard')

  const pendingSubmissions = stats?.recentSubmissions?.filter(s => s.reviewStatus === "pending") || []
  const chartData = stats?.spendHistory || []

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center py-24 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Failed to load dashboard</h3>
        <p className="text-zinc-500 max-w-sm mt-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PageHeader 
        title="Brand Overview" 
        description="Monitor campaign performance, manage budgets, and review creator submissions."
        action={
          <Link to="/brand/campaigns/create">
            <Button className="rounded-xl font-bold shadow-soft group">
              <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              New Campaign
            </Button>
          </Link>
        }
      />

      {/* Campaigns Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget 
          title="Total Campaigns" 
          value={stats?.totalCampaigns || 0} 
          icon={BarChart3} 
        />
        <StatWidget 
          title="Active Campaigns" 
          value={stats?.activeCampaigns || 0} 
          icon={Target} 
          trend="+2"
          trendLabel="this month"
        />
        <StatWidget 
          title="Draft Campaigns" 
          value={stats?.draftCampaigns || 0} 
          icon={CheckCircle2} 
        />
        <StatWidget 
          title="Pending Reviews" 
          value={stats?.submissionsPending || 0} 
          icon={PlayCircle} 
          className="ring-2 ring-brand-500/20 bg-brand-50/10 dark:bg-brand-900/10"
        />
      </div>

      {/* Submissions & Budget Row */}
      <div className="grid gap-4 sm:grid-cols-3">
         <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50">
           <CardContent className="p-6">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Total Submissions</p>
                 <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{stats?.totalSubmissions || 0}</h4>
               </div>
               <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                 <PlayCircle className="h-5 w-5" />
               </div>
             </div>
             <div className="flex gap-4 text-xs font-medium text-zinc-500">
               <span className="text-green-500">{stats?.approvedSubmissions || 0} Approved</span>
               <span className="text-red-500">{stats?.rejectedSubmissions || 0} Rejected</span>
             </div>
           </CardContent>
         </Card>

         <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-10">
             <DollarSign className="h-24 w-24" />
           </div>
           <CardContent className="p-6 relative z-10">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Amount Spent</p>
                 <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">${(stats?.totalSpend || 0).toLocaleString()}</h4>
               </div>
             </div>
             <p className="text-xs font-medium text-zinc-500">Out of ${(stats?.totalBudget || 0).toLocaleString()} Total Budget</p>
           </CardContent>
         </Card>

         <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50 bg-brand-500 text-white border-0 relative overflow-hidden">
           <div className="absolute -right-4 -top-4 opacity-20">
             <DollarSign className="h-32 w-32" />
           </div>
           <CardContent className="p-6 relative z-10">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <p className="text-xs font-bold uppercase tracking-widest text-brand-100 mb-1">Remaining Budget</p>
                 <h4 className="text-2xl font-black text-white">${(stats?.remainingBudget || 0).toLocaleString()}</h4>
               </div>
             </div>
             <p className="text-xs font-medium text-brand-100">Ready to be allocated</p>
           </CardContent>
         </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft border-zinc-100 dark:border-zinc-800/50">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
            <CardTitle className="text-lg">Spending Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} dx={-10} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{ fill: "#f4f4f5" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
                  formatter={(value) => [`$${value}`, "Spent"]}
                />
                <Bar dataKey="spend" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
            <CardTitle className="text-lg">Quick Review Queue</CardTitle>
            <Link to="/brand/submissions">
              <span className="text-xs font-bold text-brand-500 hover:text-brand-600 uppercase tracking-widest flex items-center group">
                See all <ArrowUpRight className="ml-1 h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {pendingSubmissions.map(sub => (
              <div key={sub._id} className="group relative flex flex-col gap-3 rounded-xl border border-zinc-100 p-4 transition-all hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/50 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">{sub.campaignId?.title}</span>
                  <Badge variant="warning" className="px-2 py-0.5 capitalize">{sub.reviewStatus}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <img src={sub.creatorId?.avatar || `https://ui-avatars.com/api/?name=${sub.creatorId?.email}`} alt="" className="h-8 w-8 rounded-full shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800" />
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{sub.creatorId?.email}</span>
                </div>
                <Link to={`/brand/submissions/${sub._id}`} className="absolute inset-0">
                  <span className="sr-only">Review Submission</span>
                </Link>
              </div>
            ))}
            
            {pendingSubmissions.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-zinc-400" />
                </div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">You're all caught up!</p>
                <p className="text-xs text-zinc-500 mt-1">No submissions need review right now.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
