import React from "react"
import { DollarSign, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PageHeader } from "../../components/shared/PageHeader"
import { StatWidget } from "../../components/ui/StatWidget"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { mockCreatorStats, mockSubmissions } from "../../data/mockData"

export function EarningsPage() {
  const approvedSubmissions = mockSubmissions.filter(s => s.status === "approved" || s.status === "pending")
  const chartData = mockCreatorStats.recentEarnings

  return (
    <div className="space-y-12">
      <PageHeader 
        title="Earnings & Payouts" 
        description="Track your revenue and manage your financial growth."
        action={<Button variant="outline" size="lg" className="rounded-2xl h-12 shadow-soft">Download Report</Button>}
      />

      <div className="grid gap-6 sm:grid-cols-3">
        <StatWidget 
          title="Available Balance" 
          value="$1,250.00" 
          icon={DollarSign} 
        />
        <StatWidget 
          title="Pending Clearance" 
          value="$512.45" 
          icon={Clock} 
        />
        <StatWidget 
          title="Life-time Earnings" 
          value={mockCreatorStats.totalEarnings} 
          icon={ArrowUpRight} 
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-12">
          <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50">
            <CardHeader className="p-8 pb-0 border-none">
              <CardTitle className="font-display text-2xl font-bold">Earnings Velocity</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
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
                    tickFormatter={(val) => `$${val}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: "#F8FAFC", radius: 8 }}
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", padding: "12px" }}
                    labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
                    formatter={(value) => [`$${value}`, "Amount"]}
                  />
                  <Bar dataKey="amount" fill="#F97316" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50">
            <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-zinc-50 dark:border-zinc-800/50">
              <CardTitle className="font-display text-2xl font-bold">Recent Transactions</CardTitle>
              <Button variant="link" size="sm" className="font-bold text-brand-600">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
                    <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest">Campaign</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right">Amount</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Date</TableHead>
                    <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedSubmissions.map((sub) => (
                    <TableRow key={sub.id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <TableCell className="px-8 py-5 font-bold text-zinc-950 dark:text-zinc-50">{sub.campaignTitle}</TableCell>
                      <TableCell className="py-5 font-display text-lg font-black text-green-600 dark:text-green-400 text-right">{sub.rewardAmt}</TableCell>
                      <TableCell className="py-5 text-sm font-bold text-zinc-500">{new Date(sub.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="px-8 py-5">
                        <Badge 
                          variant={sub.status === "approved" ? "primary" : "outline"}
                          className="rounded-lg font-black"
                        >
                          {sub.status === "approved" ? "Cleared" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-premium border-brand-100 dark:border-brand-500/20 bg-brand-50/20 dark:bg-brand-500/5">
            <CardContent className="p-8">
              <h3 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50 mb-2">Withdraw Funds</h3>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                Funds are automatically withdrawn on the 1st and 15th of every month to your connected bank.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between rounded-[1.25rem] border border-white dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-inner">
                      <span className="font-black text-xs uppercase">Bank</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-950 dark:text-zinc-50">Chase Checking</h4>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-0.5">•••• 4829</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
              </div>
              
              <div className="grid gap-3">
                <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-brand-600/20 active:scale-95 transition-all">Request Payout</Button>
                <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-bold border-zinc-200 dark:border-zinc-800 shadow-soft">Update Bank Details</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
