import React, { useState } from "react"
import { CheckCircle2, XCircle, Loader2, Building, DollarSign } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Pagination } from "../../components/ui/Pagination"
import { usePagination } from "../../hooks/usePagination"
import api from "../../lib/api"

export function AdminWithdrawals() {
  const { 
    items: withdrawals, 
    pagination, 
    loading, 
    filters, 
    updateFilters,
    page,
    setPage,
    refetch 
  } = usePagination("/admin/withdrawals", { limit: 10 });

  const statusFilter = filters.status || "all";
  const totalPages = pagination.totalPages || 1;

  const [processingId, setProcessingId] = useState(null)

  const handleStatusTransition = async (id, status) => {
    if (!window.confirm(`Are you certain you want to forcefully mark this transaction as ${status.toUpperCase()}? This will mutate the Creator's financial ledger.`)) return;

    setProcessingId(id)
    try {
      await api.patch(`/admin/withdrawals/${id}/status`, { status })
      await refetch()
    } catch(err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-12">
      <PageHeader 
        title="Creator Payouts queue" 
        description="Audit, process, and permanently log creator requested wire transfers."
      />

      <div className="flex flex-col gap-6 sm:flex-row items-center justify-between">
        <div className="flex shrink-0 gap-3">
          <div className="relative">
            <select 
              className="h-14 appearance-none rounded-2xl border border-zinc-200 bg-white px-6 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 cursor-pointer shadow-soft"
              value={statusFilter}
              onChange={(e) => {
                updateFilters({ status: e.target.value === 'all' ? undefined : e.target.value })
                setPage(1)
              }}
            >
              <option value="all">Any Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid / Disbursed</option>
              <option value="rejected">Rejected / Failed</option>
            </select>
          </div>
        </div>
      </div>

      <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
                <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest">Creator Profile</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Destination Platform</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right">Requested Balance</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Pipeline State</TableHead>
                <TableHead className="px-8 text-right font-bold text-[10px] uppercase tracking-widest">Manual Transact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && withdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-500" />
                  </TableCell>
                </TableRow>
              ) : (
                withdrawals.map(req => (
                  <TableRow key={req._id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    
                    <TableCell className="px-8 py-6">
                      <span className="font-bold text-zinc-950 dark:text-zinc-50">{req.creatorId?.email?.split('@')[0]}</span>
                      <span className="block text-[10px] uppercase font-bold text-zinc-400 mt-1">Requested: {new Date(req.createdAt).toLocaleDateString()}</span>
                    </TableCell>

                    <TableCell className="py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900">
                          <Building className="h-4 w-4 text-zinc-500" />
                        </div>
                        <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300 capitalize">{req.payoutMethod?.replace(/_/g, ' ')}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-6">
                      <div className="flex items-center justify-end gap-1 text-lg font-black text-zinc-950 dark:text-zinc-50">
                        <DollarSign className="h-4 w-4 text-zinc-400" />
                        {req.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </TableCell>

                    <TableCell className="py-6">
                      <Badge 
                        variant={req.status === 'paid' ? 'success' : req.status === 'rejected' ? 'danger' : req.status === 'approved' ? 'primary' : 'warning'} 
                        className="rounded-lg px-3 py-1 font-black uppercase tracking-tight"
                      >
                        {req.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-8 py-6 text-right">
                      {req.status !== 'paid' && req.status !== 'rejected' && (
                        <div className="flex items-center justify-end gap-2">
                          {req.status === 'pending' && (
                            <Button 
                              onClick={() => handleStatusTransition(req._id, 'approved')} 
                              disabled={processingId === req._id}
                              variant="ghost" 
                              size="sm" 
                              className="font-bold text-brand-600 hover:bg-brand-50" 
                            >
                              Approve
                            </Button>
                          )}
                          <Button 
                            onClick={() => handleStatusTransition(req._id, 'paid')} 
                            disabled={processingId === req._id || req.status !== 'approved'}
                            variant="primary" 
                            size="sm" 
                            className="font-bold bg-green-600 hover:bg-green-700 text-white shadow-soft" 
                          >
                            Mark Paid
                          </Button>
                          <Button 
                            onClick={() => handleStatusTransition(req._id, 'rejected')} 
                            disabled={processingId === req._id}
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" 
                            title="Reject Transaction & Refund Math"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!loading && withdrawals.length === 0 && (
            <div className="py-20 text-center">
              <span className="font-display text-lg font-bold text-zinc-400">No withdrawal requests queued</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {!loading && withdrawals.length > 0 && (
        <div className="pt-4 flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
