import React, { useMemo } from "react"
import { DollarSign, ArrowUpRight, ArrowDownRight, FileText, Loader2 } from "lucide-react"
import { EmptyState } from "../../components/ui/EmptyState"
import { PageHeader } from "../../components/shared/PageHeader"
import { StatWidget } from "../../components/ui/StatWidget"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { useApi } from "../../hooks/useApi"
import api from "../../lib/api"

export function PayoutSummary() {
  const { data, loading } = useApi('/brand/payouts')
  const allPayouts = data?.items || []

  const [processingId, setProcessingId] = React.useState(null)

  const handleMarkPaid = async (payoutId) => {
    setProcessingId(payoutId)
    try {
      await api.post(`/brand/payouts/${payoutId}/mark-paid`)
      window.location.reload()
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const metrics = useMemo(() => {
    let disbursed = 0;
    let pending = 0;
    
    allPayouts.forEach(p => {
      if (p.status === 'withdrawn') disbursed += p.amount;
      if (p.status === 'cleared') pending += p.amount;
    });

    return { disbursed, pending, escrow: pending + disbursed };
  }, [allPayouts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    )
  }

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
          value={`$${metrics.disbursed.toLocaleString()}`} 
          icon={ArrowUpRight} 
        />
        <StatWidget 
          title="Escrow Balance" 
          value="$0.00" 
          icon={DollarSign} 
        />
        <StatWidget 
          title="Awaiting Payout" 
          value={`$${metrics.pending.toLocaleString()}`} 
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
              {allPayouts.map((payout) => (
                <TableRow key={payout._id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <img src={payout.creatorId?.avatar || `https://ui-avatars.com/api/?name=${payout.creatorId?.firstName}`} className="h-8 w-8 rounded-full shadow-sm" alt="" />
                      <span className="font-bold text-zinc-950 dark:text-zinc-50">{payout.creatorId?.firstName} {payout.creatorId?.lastName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">{payout.campaignId?.title}</TableCell>
                  <TableCell className="py-5 text-sm font-bold text-zinc-500">{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="py-5 font-display text-lg font-black text-zinc-900 dark:text-zinc-50 text-right">${payout.amount?.toLocaleString()}</TableCell>
                  <TableCell className="py-5">
                    <Badge 
                      variant={payout.status === "withdrawn" ? "success" : payout.status === "cleared" ? "primary" : "outline"}
                      className="rounded-lg font-black capitalize"
                    >
                      {payout.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    {payout.status === 'cleared' ? (
                      <Button onClick={() => handleMarkPaid(payout._id)} disabled={processingId === payout._id} variant="outline" size="sm" className="font-bold border-brand-200 text-brand-600 hover:bg-brand-50">
                        {processingId === payout._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Paid"}
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="font-bold text-zinc-400 hover:text-zinc-600">Invoice</Button>
                    )}
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
