import React, { useState } from "react"
import { DollarSign, ArrowUpRight, Clock, CheckCircle2, Loader2, ArrowRightLeft, TrendingUp, AlertCircle, Building } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PageHeader } from "../../components/shared/PageHeader"
import { StatWidget } from "../../components/ui/StatWidget"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { EmptyState } from "../../components/ui/EmptyState"
import { useApi } from "../../hooks/useApi"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../lib/api"

export function EarningsPage() {
  const { user } = useAuth()
  
  // Utilize the new earnings ledger mechanism built in the backend
  const { data: ledgerResponse, loading: ledgerLoading, refetch } = useApi('/creator/earnings/ledger')
  const { data: dashboardData } = useApi('/creator/dashboard')

  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawError, setWithdrawError] = useState(null)
  
  const balances = ledgerResponse?.balances || { available: 0, withdrawn: 0, pending: 0 }
  const transactions = ledgerResponse?.transactions || []
  const chartData = dashboardData?.recentEarnings || []

  const totalEarned = balances.available + balances.withdrawn

  // Aggregate earnings structurally from the fetched ledger logs for high performance
  const earningsByCampaign = transactions
    .filter(t => t.transactionType === 'credit')
    .reduce((acc, t) => {
      const campName = t.campaignId?.title || "Unknown Campaign";
      acc[campName] = (acc[campName] || 0) + t.amount;
      return acc;
    }, {});
    
  const campaignAggregates = Object.keys(earningsByCampaign)
    .map(key => ({ name: key, total: earningsByCampaign[key] }))
    .sort((a, b) => b.total - a.total);

  const handleWithdrawal = async () => {
    if (balances.available < 0.50) return;
    
    setIsWithdrawing(true)
    setWithdrawError(null)
    try {
      await api.post('/creator/earnings/withdraw', { 
        amount: balances.available, 
        payoutMethod: user?.profile?.payoutSettings?.provider || 'stripe' 
      })
      await refetch()
    } catch (err) {
      setWithdrawError(err.response?.data?.message || err.message)
    } finally {
      setIsWithdrawing(false)
    }
  }

  if (ledgerLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <p className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase">Aggregating Ledgers...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <PageHeader 
          title="Earnings & Payouts" 
          description="Track your revenue and maintain an immutable log of all transactions."
          className="pb-0"
        />
        <div className="shrink-0">
          <Button variant="outline" size="lg" className="rounded-2xl h-14 shadow-soft font-bold border-zinc-200">
            Download Tax Ledger (CSV)
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <StatWidget 
          title="Total Lifetime Earned" 
          value={`$${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={ArrowUpRight} 
        />
        <StatWidget 
          title="Available Balance" 
          value={`$${balances.available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={DollarSign} 
        />
        <StatWidget 
          title="Pending Clearance" 
          value={`$${balances.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={Clock} 
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        
        {/* Left Column: Aggregations & Charts */}
        <div className="lg:col-span-8 space-y-12">
          
          <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 p-8">
              <CardTitle className="font-display text-2xl font-bold">Earnings Velocity</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E4E4E8" />
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
                  <Bar dataKey="amount" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Breakdown Rows */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50">
              <CardHeader className="p-6 border-b border-zinc-50 dark:border-zinc-800/50">
                <CardTitle className="font-display text-lg font-bold flex flex-row items-center gap-2"><TrendingUp className="h-4 w-4 text-brand-500" /> Top Campaigns</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {campaignAggregates.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 font-medium text-sm">No campaign earnings mapped yet.</div>
                ) : (
                  <ul className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                    {campaignAggregates.slice(0, 4).map((record, i) => (
                      <li key={i} className="flex justify-between items-center p-5 hover:bg-zinc-50 transition-colors">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate pr-4">{record.name}</span>
                        <span className="font-display font-black text-green-600">${record.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50">
              <CardHeader className="p-6 border-b border-zinc-50 dark:border-zinc-800/50">
                <CardTitle className="font-display text-lg font-bold flex flex-row items-center gap-2"><ArrowRightLeft className="h-4 w-4 text-brand-500" /> Recent Payouts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {transactions.filter(t => t.transactionType === 'debit').length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 font-medium text-sm">No withdrawals initiated yet.</div>
                ) : (
                  <ul className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                    {transactions.filter(t => t.transactionType === 'debit').slice(0, 4).map((t, i) => (
                      <li key={i} className="flex justify-between items-center p-5">
                        <div>
                          <span className="block font-bold text-sm text-zinc-900 dark:text-zinc-50">Stripe Wire</span>
                          <span className="block text-xs font-bold text-zinc-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="block font-display font-black text-zinc-700 dark:text-zinc-300">-${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          <Badge variant={t.status === 'cleared' ? 'success' : 'outline'} className="text-[9px] uppercase mt-1 px-1.5 py-0">{t.status}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50">
            <CardHeader className="p-8 pb-6 flex flex-row items-center justify-between border-b border-zinc-50 dark:border-zinc-800/50">
              <CardTitle className="font-display text-xl font-bold">Earnings Ledger</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="py-16">
                  <EmptyState title="No transactions" description="Once your submissions generate earnings, they will securely log here." />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
                      <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest leading-none">Type</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest leading-none">Description</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest leading-none">Date</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest leading-none text-right">Amount</TableHead>
                      <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest leading-none">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((ledger) => (
                      <TableRow key={ledger._id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <TableCell className="px-8 py-5">
                           <Badge variant={ledger.transactionType === 'credit' ? 'primary' : 'outline'} className="uppercase font-black text-[10px] tracking-widest">{ledger.transactionType}</Badge>
                        </TableCell>
                        <TableCell className="py-5 font-bold text-zinc-950 dark:text-zinc-50 text-sm">{ledger.campaignId?.title || ledger.description}</TableCell>
                        <TableCell className="py-5 text-sm font-bold text-zinc-500">{new Date(ledger.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className={`py-5 font-display text-lg font-black text-right ${ledger.transactionType === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                          {ledger.transactionType === 'credit' ? '+' : '-'}${ledger.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="px-8 py-5">
                          <Badge 
                            variant={(ledger.status === "cleared" || ledger.status === "withdrawn") ? "success" : ledger.status === "failed" ? "destructive" : "outline"}
                            className="rounded px-2 font-black capitalize text-[10px] tracking-widest"
                          >
                            {ledger.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Routing & Request Payout */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-premium border-brand-100 dark:border-brand-500/20 bg-brand-50/20 dark:bg-brand-500/5 sticky top-24">
            <CardContent className="p-8">
              <h3 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50 mb-2 border-b border-brand-200 dark:border-brand-900 pb-4">Withdraw Funds</h3>
              
              <div className="py-8 text-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Target Cashout Balance</span>
                <p className="font-display text-6xl font-black text-zinc-950 dark:text-zinc-50">
                  ${balances.available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between rounded-[1.25rem] border border-white dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 text-brand-500 shadow-inner">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-950 dark:text-zinc-50">Stripe Express</h4>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                        {user?.profile?.payoutSettings?.accountName || "Bank Routing"}
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-brand-500" />
                </div>
              </div>

              {withdrawError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {withdrawError}
                </div>
              )}
              
              <div className="grid gap-4 mt-6 border-t border-brand-200 dark:border-brand-900 pt-6">
                <Button 
                  onClick={handleWithdrawal} 
                  disabled={isWithdrawing || balances.available < 0.50}
                  className="w-full h-14 rounded-2xl text-lg font-bold shadow-soft shadow-brand-600/20 active:scale-95 transition-all"
                >
                  {isWithdrawing ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Request Instant Payout"}
                </Button>
                <p className="text-[10px] text-center font-bold text-zinc-400 uppercase tracking-widest">
                  Limits processing fees applied automatically by provider.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
