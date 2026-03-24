import React from "react"
import { Link } from "react-router-dom"
import { Target, DollarSign, CheckCircle2, PlayCircle, Plus } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PageHeader } from "../../components/shared/PageHeader"
import { StatWidget } from "../../components/ui/StatWidget"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { mockBrandStats, mockSubmissions } from "../../data/mockData"

export function BrandDashboard() {
  const pendingSubmissions = mockSubmissions.filter(s => s.status === "pending")
  const chartData = mockBrandStats.spendHistory

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Brand Overview" 
        description="Monitor campaign performance and review new creator submissions."
        action={
          <Link to="/brand/campaigns/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget 
          title="Total Spend" 
          value={mockBrandStats.totalSpend} 
          icon={DollarSign} 
          trend="neutral" 
          trendValue="On budget"
        />
        <StatWidget 
          title="Active Campaigns" 
          value={mockBrandStats.activeCampaigns} 
          icon={Target} 
        />
        <StatWidget 
          title="Pending Reviews" 
          value={mockBrandStats.submissionsPending} 
          icon={PlayCircle} 
          className="ring-2 ring-brand-500/20"
        />
        <StatWidget 
          title="Avg. Approval Rate" 
          value={mockBrandStats.avgApprovalRate} 
          icon={CheckCircle2} 
          trend="up"
          trendValue="+2% this week"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
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

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
            <CardTitle className="text-lg">Needs Review</CardTitle>
            <Link to="/brand/submissions">
              <Button variant="link" size="sm" className="font-bold">See all</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {pendingSubmissions.map(sub => (
              <div key={sub.id} className="group relative flex flex-col gap-3 rounded-xl border border-zinc-100 p-4 transition-all hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/50 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">{sub.campaignTitle}</span>
                  <Badge variant="warning" className="px-2 py-0.5">Pending</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <img src={sub.creatorAvatar} alt="" className="h-8 w-8 rounded-full shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800" />
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{sub.creatorName}</span>
                </div>
                <Link to={`/brand/submissions/${sub.id}`} className="absolute inset-0">
                  <span className="sr-only">Review Submission</span>
                </Link>
              </div>
            ))}
            
            {pendingSubmissions.length === 0 && (
              <div className="py-8 text-center text-sm text-zinc-500">
                You're all caught up! No submissions need review.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
