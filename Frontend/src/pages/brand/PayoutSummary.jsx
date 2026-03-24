import React from "react"
import { DollarSign, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react"
import { EmptyState } from "../../components/ui/EmptyState"
import { PageHeader } from "../../components/shared/PageHeader"
import { StatWidget } from "../../components/ui/StatWidget"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { mockSubmissions } from "../../data/mockData"

export function PayoutSummary() {
  const allPayouts = mockSubmissions.filter(s => s.status !== "rejected")

  return (
    <div className="space-y-12">
      <PageHeader 
        title="Payout Summary" 
        description="Comprehensive overview of all processed and pending creator compensations."
        action={<Button variant="outline" size="lg" className="rounded-2xl h-12 shadow-soft font-bold border-zinc-200 dark:border-zinc-800"><FileText className="mr-2 h-4 w-4" /> Export Statement</Button>}
      />

      <div className="grid gap-6 sm:grid-cols-3">
        <StatWidget 
          title="Life-time Disbursed" 
          value="$24,500.00" 
          icon={ArrowUpRight} 
        />
        <StatWidget 
          title="Escrow Balance" 
          value="$12,042.80" 
          icon={DollarSign} 
        />
        <StatWidget 
          title="Awaiting Payout" 
          value="$1,450.00" 
          icon={ArrowDownRight} 
          className="ring-2 ring-brand-500/10"
        />
      </div>

      <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <CardHeader className="p-8 border-b border-zinc-50 dark:border-zinc-800/50">
          <CardTitle className="font-display text-2xl font-bold">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
                <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest">Creator</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Campaign Reference</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Date</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right">Amount</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="px-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPayouts.map((sub) => (
                <TableRow key={sub.id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <img src={sub.creatorAvatar} className="h-8 w-8 rounded-full shadow-sm" alt="" />
                      <span className="font-bold text-zinc-950 dark:text-zinc-50">{sub.creatorName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">{sub.campaignTitle}</TableCell>
                  <TableCell className="py-5 text-sm font-bold text-zinc-500">{new Date(sub.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="py-5 font-display text-lg font-black text-zinc-900 dark:text-zinc-50 text-right">{sub.rewardAmt}</TableCell>
                  <TableCell className="py-5">
                    <Badge 
                      variant={sub.status === "approved" ? "primary" : "outline"}
                      className="rounded-lg font-black"
                    >
                      {sub.status === "approved" ? "Settled" : "Processing"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    <Button variant="ghost" size="sm" className="font-bold text-brand-600 hover:text-brand-500">Invoice</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {allPayouts.length === 0 && (
            <div className="py-16 text-center">
              <EmptyState title="No transactions yet" description="History of payments to creators will appear here." />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
