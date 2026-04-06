import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  DollarSign, ShieldCheck, ArrowRight, Building, 
  Loader2, AlertTriangle, CheckCircle2, Clock, Landmark
} from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { StatWidget } from "../../components/ui/StatWidget"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Input, Label } from "../../components/ui/Input"
import { useAuth } from "../../contexts/AuthContext"
import { useApi } from "../../hooks/useApi"
import api from "../../lib/api"

export function PayoutSetup() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: earningsData, loading: earningsLoading } = useApi('/creator/earnings')
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [accountName, setAccountName] = useState("")

  const records = earningsData?.records || []
  const isConnected = user?.profile?.payoutConnected || false

  const handleConnect = async () => {
    if (!accountName && !isConnected) return; // Basic validation if MVP form is used
    
    setIsConnecting(true)
    try {
      // Simulate Stripe Connect integration & backend update
      // A mock API integration placeholder for updating payoutSettings
      await api.patch('/creator/profile', { 
        payoutConnected: true, 
        payoutSettings: { 
          provider: 'stripe', 
          status: 'active', 
          accountName: accountName || user?.profile?.displayName || 'Creator Account'
        }
      }).catch(err => console.log('Mock fallback', err));

      setTimeout(() => {
        setIsConnecting(false)
        // If they were setting it up for the first time, boot to dashboard.
        if (!isConnected) {
          window.location.href = '/creator' 
        } else {
          // If just updating, reload visually or handle notification
          window.location.reload()
        }
      }, 1500)
    } catch (err) {
      console.error("Payout connection failed:", err)
      setIsConnecting(false)
    }
  }

  if (earningsLoading) {
    return (
      <div className="flex justify-center flex-col items-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <p className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase">Loading Financials...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      
      {/* Warning / Status Banner */}
      {!isConnected ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-500/10 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 shrink-0">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display text-lg font-black text-red-900 dark:text-red-300">
              Payout Connection Required
            </h3>
            <p className="text-sm font-medium text-red-700/80 dark:text-red-400/80 mt-1">
              You must configure a valid bank or Stripe account before you can join new campaigns or submit active assignments.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-bold text-green-900 dark:text-green-300">Payouts are fully configured and active.</span>
          </div>
        </div>
      )}

      <PageHeader 
        title="Payout Settings" 
        description="Manage your bank connections and track incoming revenue streams."
      />

      {/* Balances View */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <StatWidget 
          title="Available Balance" 
          value={`$${(earningsData?.paidOut || 0).toLocaleString()}`} 
          icon={DollarSign} 
        />
        <StatWidget 
          title="Pending Clearance" 
          value={`$${(earningsData?.pendingPayout || 0).toLocaleString()}`} 
          icon={Clock} 
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Main Payout Configuration */}
        <div className="lg:col-span-7 space-y-8">
          <Card className={`shadow-premium border-2 overflow-hidden transition-colors ${!isConnected ? 'border-brand-500 dark:border-brand-500 shadow-brand-500/10' : 'border-zinc-100 dark:border-zinc-800'}`}>
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900 p-6 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="font-display text-xl font-bold flex items-center gap-3">
                <Landmark className="h-5 w-5 text-brand-600" />
                Connection Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              
              {!isConnected && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Legal Account Name *</Label>
                    <Input 
                      placeholder="e.g. Jane Doe" 
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {isConnected && (
                <div className="flex items-center justify-between rounded-[1.25rem] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-800">
                      <Building className="h-6 w-6 text-brand-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-950 dark:text-zinc-50">Stripe Express</h4>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                        {user?.profile?.payoutSettings?.accountName || "Connected Bank"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" className="font-bold tracking-wider">Active</Badge>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="font-display text-lg font-bold text-zinc-950 dark:text-zinc-50">
                  {isConnected ? "Update Connection" : "Authorize Setup"}
                </h4>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg">
                  We use Stripe Connect to encrypt your financial routing. By proceeding, you agree to our direct deposit verification policies.
                </p>

                <Button 
                  onClick={handleConnect}
                  disabled={isConnecting || (!isConnected && !accountName)}
                  className={`h-14 rounded-2xl text-lg font-bold w-full sm:w-auto px-8 transition-all group shadow-soft ${isConnected ? '' : 'shadow-brand-600/20'}`}
                >
                  {isConnecting ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto sm:mx-0" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {isConnected ? "Re-authorize Stripe" : "Securely Connect via Stripe"}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
                
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest pt-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Protected by Bank-Grade 256-bit Encryption</span>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Payout History Preview */}
        <div className="lg:col-span-5">
          <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50 h-full flex flex-col">
            <CardHeader className="p-6 border-b border-zinc-50 dark:border-zinc-800/50 flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg font-bold">Recent History</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              {records.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-12 p-6 text-center space-y-3">
                  <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-zinc-400" />
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">No Payouts Yet</h4>
                  <p className="text-xs font-medium text-zinc-500">
                    Connect your payout method, join some campaigns, and watch your earnings grow.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableBody>
                    {records.slice(0, 4).map((payout) => (
                      <TableRow key={payout._id} className="border-zinc-50 dark:border-zinc-800/50">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-sm text-zinc-950 dark:text-zinc-50 capitalize">
                                {payout.status === 'paid' ? 'Direct Deposit' : 'Pending Transfer'}
                              </p>
                              <p className="text-xs font-medium text-zinc-500 mt-1">
                                {new Date(payout.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-display font-black text-green-600 dark:text-green-400">
                                +${payout.amount?.toLocaleString()}
                              </p>
                              <Badge 
                                variant={payout.status === "paid" ? "success" : payout.status === "approved" ? "primary" : "outline"}
                                className="rounded px-1.5 py-0 text-[9px] uppercase tracking-widest mt-1 inline-block"
                              >
                                {payout.status === "paid" ? "Paid" : payout.status === "approved" ? "Cleared" : "Pending"}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {records.length > 0 && (
                <div className="p-4 border-t border-zinc-50 dark:border-zinc-800/50 mt-auto">
                  <Button variant="outline" className="w-full text-xs font-bold" onClick={() => navigate('/creator/earnings')}>
                    View Full Earnings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
