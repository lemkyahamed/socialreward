import React, { useState } from "react"
import { Search, CheckCircle2, XCircle, Loader2, Edit3, Link as LinkIcon, BarChart3, Trash2 } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Input, Label } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Pagination } from "../../components/ui/Pagination"
import { usePagination } from "../../hooks/usePagination"
import api from "../../lib/api"

export function AdminSubmissions() {
  const { 
    items: submissions, 
    pagination, 
    loading, 
    filters, 
    updateFilters,
    page,
    setPage,
    refetch 
  } = usePagination("/admin/submissions", { limit: 10 });

  const statusFilter = filters.status || "all";
  const totalPages = pagination.totalPages || 1;

  const [processingId, setProcessingId] = useState(null)
  
  // Metric Modal State
  const [metricModal, setMetricModal] = useState({ isOpen: false, data: null })
  const [metricsForm, setMetricsForm] = useState({ views: 0, likes: 0, comments: 0, shares: 0 })

  const handleReview = async (id, status) => {
    // MVP: Immediate action, optionally gather reason if rejected
    const reason = status === "rejected" ? prompt("Optional: Provide a rejection reason to the creator.") : undefined;
    if (status === "rejected" && reason === null) return; // cancelled prompt

    setProcessingId(id)
    try {
      await api.patch(`/admin/submissions/${id}/review`, { status, reason })
      await refetch()
    } catch(err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this submission? This action cannot be undone.")) return;

    setProcessingId(id)
    try {
      await api.delete(`/admin/submissions/${id}`)
      await refetch()
    } catch(err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const openMetricsEdit = (submission) => {
    setMetricsForm({
      views: submission.metrics?.views || 0,
      likes: submission.metrics?.likes || 0,
      comments: submission.metrics?.comments || 0,
      shares: submission.metrics?.shares || 0
    })
    setMetricModal({ isOpen: true, data: submission })
  }

  const handleMetricsSubmit = async (e) => {
    e.preventDefault()
    setProcessingId(metricModal.data._id)
    try {
      await api.patch(`/admin/submissions/${metricModal.data._id}/metrics`, { metrics: metricsForm })
      setMetricModal({ isOpen: false, data: null })
      await refetch()
    } catch(err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-12 relative">
      <PageHeader 
        title="Submission Pipeline" 
        description="Globally audit, verify, and manipulate all Creator submissions across the platform."
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
              <option value="submitted">Submitted (Pending)</option>
              <option value="live">Live / Tracking</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
                <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest">Creator</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Campaign Reference</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Live Metrics</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Tracking State</TableHead>
                <TableHead className="px-8 text-right font-bold text-[10px] uppercase tracking-widest">Quick Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-500" />
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map(sub => (
                  <TableRow key={sub._id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    
                    {/* CREATOR */}
                    <TableCell className="px-8 py-6">
                      <span className="font-bold text-zinc-950 dark:text-zinc-50">{sub.creatorId?.email?.split('@')[0]}</span>
                      <span className="block text-[10px] uppercase font-bold text-zinc-400 mt-1">Platform: {sub.platform}</span>
                    </TableCell>

                    {/* CAMPAIGN */}
                    <TableCell className="py-6">
                      <div className="max-w-[200px]">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate block">{sub.campaignId?.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px] uppercase">{sub.campaignId?.rewardType?.replace(/_/g, ' ')}</Badge>
                        </div>
                      </div>
                    </TableCell>

                    {/* METRICS */}
                    <TableCell className="py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded">
                            {sub.metrics?.views?.toLocaleString() || 0} Views
                          </span>
                          <span className="text-xs font-bold text-zinc-500">
                            {sub.metrics?.likes?.toLocaleString() || 0} Likes
                          </span>
                        </div>
                        <button onClick={() => openMetricsEdit(sub)} className="text-[10px] flex items-center font-bold text-zinc-400 hover:text-brand-500 transition-colors uppercase tracking-widest w-fit">
                          <Edit3 className="h-3 w-3 mr-1" /> Override Stats
                        </button>
                      </div>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell className="py-6">
                      <Badge 
                        variant={sub.trackingStatus === 'completed' ? 'success' : sub.trackingStatus === 'rejected' ? 'danger' : sub.trackingStatus === 'submitted' ? 'warning' : 'primary'} 
                        className="rounded-lg px-3 py-1 font-black uppercase tracking-tight"
                      >
                        {sub.trackingStatus?.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={sub.contentUrl} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 hover:text-brand-600 hover:bg-brand-50 transition-colors dark:hover:bg-zinc-800" title="View Source Post">
                          <LinkIcon className="h-5 w-5" />
                        </a>
                        {sub.trackingStatus !== 'completed' && (
                          <>
                            <Button 
                              onClick={() => handleReview(sub._id, 'approved')} 
                              disabled={processingId === sub._id || sub.trackingStatus === 'rejected'}
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10" 
                              title="Approve Submission"
                            >
                              {processingId === sub._id ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                            </Button>
                            {sub.trackingStatus !== 'rejected' && (
                              <Button 
                                onClick={() => handleReview(sub._id, 'rejected')} 
                                disabled={processingId === sub._id}
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" 
                                title="Reject Submission"
                              >
                                <XCircle className="h-5 w-5" />
                              </Button>
                            )}
                          </>
                        )}
                        <Button 
                          onClick={() => handleDelete(sub._id)} 
                          disabled={processingId === sub._id}
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" 
                          title="Permanently Delete Submission"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!loading && submissions.length === 0 && (
            <div className="py-20 text-center">
              <span className="font-display text-lg font-bold text-zinc-400">No submissions matching criteria</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {!loading && submissions.length > 0 && (
        <div className="pt-4 flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Metrics Override Modal */}
      {metricModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-premium dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Metric Override</h3>
              <p className="mt-2 text-sm font-medium text-zinc-500">Push new metrics into a pending state to be synced by the creator.</p>
            </div>
            
            <form onSubmit={handleMetricsSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Views</Label>
                  <Input 
                    type="number" min="0" required
                    value={metricsForm.views} 
                    onChange={e => setMetricsForm(p => ({...p, views: parseInt(e.target.value, 10)}))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Likes</Label>
                  <Input 
                    type="number" min="0" required
                    value={metricsForm.likes} 
                    onChange={e => setMetricsForm(p => ({...p, likes: parseInt(e.target.value, 10)}))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Comments</Label>
                  <Input 
                    type="number" min="0" required
                    value={metricsForm.comments} 
                    onChange={e => setMetricsForm(p => ({...p, comments: parseInt(e.target.value, 10)}))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shares</Label>
                  <Input 
                    type="number" min="0" required
                    value={metricsForm.shares} 
                    onChange={e => setMetricsForm(p => ({...p, shares: parseInt(e.target.value, 10)}))} 
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-6">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setMetricModal({ isOpen: false, data: null })}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={processingId !== null}>
                  {processingId === metricModal.data._id ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Push Pending Update"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
