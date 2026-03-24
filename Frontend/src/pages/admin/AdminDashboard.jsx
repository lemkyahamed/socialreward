import React from "react"
import { Users, Target, ShieldAlert, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PageHeader } from "../../components/shared/PageHeader"
import { StatWidget } from "../../components/ui/StatWidget"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { mockAdminStats, mockSystemLogs } from "../../data/mockData"

export function AdminDashboard() {
  const chartData = mockAdminStats.userGrowth
  const recentLogs = mockSystemLogs.slice(0, 5)

  return (
    <div className="space-y-12">
      <PageHeader 
        title="Admin Control Center" 
        description="Platform oversight, user growth, and high-level system diagnostics."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget 
          title="Total Users" 
          value={mockAdminStats.totalUsers} 
          icon={Users} 
          trend="up" 
          trendValue="+12.5% vs LW"
        />
        <StatWidget 
          title="Active Campaigns" 
          value={mockAdminStats.liveCampaigns} 
          icon={Target} 
        />
        <StatWidget 
          title="System Alerts" 
          value={mockAdminStats.suspiciousItems} 
          icon={ShieldAlert} 
          className="ring-2 ring-red-500/10"
        />
        <StatWidget 
          title="Background Jobs" 
          value={mockAdminStats.failedJobs > 0 ? "Failing" : "Healthy"} 
          icon={Activity} 
          trend={mockAdminStats.failedJobs > 0 ? "down" : "up"}
          trendValue={mockAdminStats.failedJobs > 0 ? `${mockAdminStats.failedJobs} errors` : "All operational"}
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <Card className="lg:col-span-8 shadow-premium border-zinc-100 dark:border-zinc-800/50">
          <CardHeader className="p-8 border-b border-zinc-50 dark:border-zinc-800/50">
            <CardTitle className="font-display text-xl font-bold">User Acquisition Velocity</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] p-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E8" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#A1A1AA", fontSize: 12, fontWeight: 700 }} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#A1A1AA", fontSize: 12, fontWeight: 700 }} 
                  dx={-10} 
                />
                <Tooltip 
                  cursor={{ stroke: "#F97316", strokeWidth: 2, strokeDasharray: "4 4" }}
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", padding: "12px" }}
                  labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#F97316" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: "#F97316", strokeWidth: 3, stroke: "#fff" }} 
                  activeDot={{ r: 8, fill: "#F97316", stroke: "#fff", strokeWidth: 4, shadow: "0 0 10px rgba(249,115,22,0.4)" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 shadow-soft border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
          <CardHeader className="p-8 border-b border-zinc-50 dark:border-zinc-800/50">
            <CardTitle className="font-display text-xl font-bold">Live System Logs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
                  <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest">Process</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.map((log) => (
                  <TableRow key={log.id} className="border-zinc-50 dark:border-zinc-800/50">
                    <TableCell className="px-8 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-950 dark:text-zinc-50 truncate max-w-[120px]">{log.jobName}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">System Worker</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge 
                        variant={log.status === "Success" ? "primary" : "outline"}
                        className="rounded-lg font-black text-[10px]"
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t border-zinc-50 dark:border-zinc-800/50">
              <Button variant="link" className="w-full text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-brand-600 transition-colors">View All Infrastructure Logs</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
