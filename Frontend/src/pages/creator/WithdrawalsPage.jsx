import React, { useState } from "react"
import { Link } from "react-router-dom"
import { 
  Building, DollarSign, Clock, CheckCircle2, Loader2, AlertTriangle, AlertCircle, ArrowRightLeft 
} from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { StatWidget } from "../../components/ui/StatWidget"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Input, Label } from "../../components/ui/Input"
import { EmptyState } from "../../components/ui/EmptyState"
import { useAuth } from "../../contexts/AuthContext"
import { useApi } from "../../hooks/useApi"
import api from "../../lib/api"

export function WithdrawalsPage() {
  const { user } = useAuth()
  
  const { data: ledgerResponse, loading: ledgerLoading, refetch } = useApi('/creator/earnings/ledger')
  
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const isPayoutConnected = user?.profile?.payoutConnected
  const payoutSettings = user?.profile?.payoutSettings

  const balances = ledgerResponse?.balances || { available: 0, withdrawn: 0, pending: 0 }
  const transactions = ledgerResponse?.transactions || []
  
  // Filter ledger to only show cash out attempts
  const withdrawalHistory = transactions.filter(t => t.transactionType === 'debit')

  const handleWithdrawalRequest = async (e) => {
    e.preventDefault()
    
    if (!isPayoutConnected) {
      setSubmitError("You must connect a payout provider first.")
      return
    }

    const amount = parseFloat(withdrawAmount)
    
    if (isNaN(amount) || amount < 0.50) {
      setSubmitError("Minimum withdrawal amount is $0.50.")
      return
    }
    
    if (amount > balances.available) {
      setSubmitError(`Insufficient cleared funds. Maximum available: $${balances.available}`)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    
    try {
      await api.post('/creator/earnings/withdraw', { 
        amount, 
        payoutMethod: payoutSettings?.provider || 'stripe' 
      })
      setWithdrawAmount("")
      setSubmitSuccess(true)
      await refetch()
      
      // Auto dismiss success toast
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || "Failed to process withdrawal.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (ledgerLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <p className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase">Retrieving Balances...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      
      {/* Blocking Alert if Not Connected */}
      {!isPayoutConnected && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-500/10 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 shrink-0">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display text-lg font-black text-red-900 dark:text-red-300">
              Payout Method Required
            </h3>
            <p className="text-sm font-medium text-red-700/80 dark:text-red-400/80 mt-1">
              You must configure a valid bank or Stripe account before you can extract your cleared earnings.
            </p>
          </div>
          <div className="shrink-0 w-full sm:w-auto">
            <Link to="/creator/payout-setup">
              <Button variant="primary" className="w-full sm:w-auto font-bold bg-red-600 hover:bg-red-700 border-none dark:text-white">
                Connect Integration
              </Button>
            </Link>
          </div>
        </div>
      )}

      <PageHeader 
        title="Withdrawals" 
        description="Transfer your cleared campaign earnings securely to your bank."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <StatWidget 
          title="Available to Withdraw" 
          value={`$${balances.available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={DollarSign} 
        />
        <StatWidget 
          title="Pending Clearance" 
          value={`$${balances.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={Clock} 
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left Col: Request Form & Details */}
        <div className="lg:col-span-5 space-y-8">
          <Card className={`shadow-premium overflow-hidden transition-colors ${!isPayoutConnected ? 'border-zinc-200 dark:border-zinc-800 opacity-60 pointer-events-none' : 'border-zinc-100 dark:border-zinc-800'}`}>
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 p-6">
              <CardTitle className="font-display text-xl font-bold flex items-center gap-3">
                <ArrowRightLeft className="h-5 w-5 text-brand-600" />
                Transfer Funds
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              
              {/* Active Payout Method Block */}
              <div className="flex flex-col gap-2 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                <span className="uppercase text-[10px] tracking-widest text-zinc-500 font-bold">Destination Network</span>
                <div className="flex items-center justify-between rounded-[1rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 text-brand-500 shadow-inner border border-zinc-100 dark:border-zinc-800 shrink-0">
                      <Building className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 capitalize">{payoutSettings?.provider || 'Stripe Connect'}</h4>
                      <p className="text-xs font-bold text-zinc-400 capitalize truncate mt-0.5 max-w-[120px]">
                        {payoutSettings?.accountName || "Unlinked"}
                      </p>
                    </div>
                  </div>
                  {isPayoutConnected ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-zinc-300" />}
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleWithdrawalRequest} className="space-y-6">
                
                {submitSuccess && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700 dark:border-green-900/30 dark:bg-green-500/10 dark:text-green-400 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> 
                    <div>
                      <span className="block mb-1">Withdrawal successful.</span>
                      <span className="font-medium text-xs">Funds should arrive via {payoutSettings?.provider || 'your processor'} in 2-3 business days.</span>
                    </div>
                  </div>
                )}
                
                {submitError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0" /> {submitError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <Label className="uppercase text-[10px] font-bold tracking-widest text-zinc-500">Withdrawal Amount</Label>
                    <button 
                      type="button"
                      onClick={() => setWithdrawAmount(balances.available.toString())}
                      className="text-[10px] uppercase font-bold tracking-widest text-brand-600 hover:text-brand-700"
                    >
                      Max: ${balances.available.toFixed(2)}
                    </button>
                  </div>
                  
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-brand-500" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0.50"
                      max={balances.available}
                      placeholder="0.00"
                      className="pl-12 h-16 rounded-2xl text-2xl font-black bg-zinc-50 focus:bg-white dark:bg-zinc-900 shadow-inner"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || balances.available < 0.50} 
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-soft shadow-brand-600/20 active:scale-95 transition-all group"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Initiate Transfer"}
                  </Button>
                </div>
              </form>

            </CardContent>
          </Card>
        </div>

        {/* Right Col: Ledger History */}
        <div className="lg:col-span-7">
          <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50 h-full">
            <CardHeader className="p-6 border-b border-zinc-50 dark:border-zinc-800/50">
              <CardTitle className="font-display text-lg font-bold">Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {withdrawalHistory.length === 0 ? (
                <div className="py-16">
                  <EmptyState 
                    title="No cashouts yet" 
                    description="When you initiate a transfer to your bank, the processing status and receipts will log here." 
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
                      <TableHead className="px-6 font-bold text-[10px] uppercase tracking-widest leading-none">Date</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest leading-none">Destination</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest leading-none text-right">Amount</TableHead>
                      <TableHead className="px-6 font-bold text-[10px] uppercase tracking-widest leading-none text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawalHistory.map((ledger) => (
                      <TableRow key={ledger._id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <TableCell className="px-6 py-5 text-sm font-bold text-zinc-500">
                          {new Date(ledger.createdAt).toLocaleDateString()}
                          <div className="text-[10px] font-medium text-zinc-400 mt-1">{new Date(ledger.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </TableCell>
                        <TableCell className="py-5 font-bold text-zinc-950 dark:text-zinc-50 text-sm">
                          {payoutSettings?.provider || 'Stripe Processing'}
                        </TableCell>
                        <TableCell className="py-5 font-display text-lg font-black text-right text-zinc-700 dark:text-zinc-300">
                          ${ledger.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="px-6 py-5 text-right">
                          <Badge 
                            variant={
                              (ledger.status === "cleared" || ledger.status === "withdrawn" ) ? "success" : 
                              ledger.status === "failed" ? "destructive" : 
                              "warning"
                            }
                            className="rounded px-2 font-black capitalize text-[10px] tracking-widest"
                          >
                            {ledger.status === 'pending' ? 'Processing' : ledger.status}
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

      </div>
    </div>
  )
}
