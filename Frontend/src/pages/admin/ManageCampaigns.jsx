import React, { useState, useEffect } from "react"
import { Search, MoreHorizontal, PauseCircle, PlayCircle, ShieldAlert, Loader2, Trash2 } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Pagination } from "../../components/ui/Pagination"
import { AlertDialog } from "../../components/ui/AlertDialog"
import { useApi } from "../../hooks/useApi"
import { usePagination } from "../../hooks/usePagination"
import api from "../../lib/api"

export function ManageCampaigns() {
  const { 
    items: campaigns, 
    pagination, 
    loading, 
    search: searchTerm, 
    setSearch: setSearchTerm, 
    filters, 
    updateFilters,
    page,
    setPage,
    refetch 
  } = usePagination("/admin/campaigns", { limit: 10 });

  const statusFilter = filters.status || "all";
  const totalPages = pagination.totalPages || 1;

  const [deleteId, setDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleStatusChange = async (campaignId, newStatus) => {
    try {
      await api.patch(`/admin/campaigns/${campaignId}/status`, { status: newStatus });
      alert("Status updated");
      await refetch();
    } catch (err) {
      alert("Failed to change status");
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/admin/campaigns/${deleteId}`);
      setDeleteId(null);
      await refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete campaign");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-12">
      <PageHeader 
        title="Campaign Moderation" 
        description="Global oversight of brand activities and live campaign performance."
      />

      <div className="flex flex-col gap-6 sm:flex-row items-center justify-between">
        <div className="relative flex-1 max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-brand-500 transition-colors" />
          <Input 
            type="search" 
            placeholder="Search campaigns or brand entities..." 
            className="pl-12 h-14 rounded-2xl bg-zinc-50/50 border-zinc-100 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
              <option value="all">Status: All States</option>
              <option value="live">Status: Active</option>
              <option value="paused">Status: Paused</option>
              <option value="draft">Status: Draft</option>
            </select>
          </div>
        </div>
      </div>

      <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
                <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest">Campaign Reference</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Brand Partner</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right">Budget Utilization</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Moderation State</TableHead>
                <TableHead className="px-8 text-right font-bold text-[10px] uppercase tracking-widest">Controls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-500" />
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map(c => (
                  <TableRow key={c._id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <TableCell className="px-8 py-6">
                      <span className="font-bold text-zinc-950 dark:text-zinc-50 max-w-[240px] truncate block">{c.title}</span>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tight mt-1">ID: {c._id.substring(0,8)}</span>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-brand-600">B</div>
                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{c.brandId?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-display text-base font-black text-zinc-950 dark:text-zinc-50">${(c.rewardAmount * (c.stats?.joins || 0)).toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">of ${(c.rewardAmount * c.maxCreators).toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <Badge variant={c.status === 'live' ? 'primary' : 'outline'} className="rounded-lg px-3 py-1 font-black uppercase tracking-tight">
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.status === 'live' ? (
                          <Button onClick={() => handleStatusChange(c._id, 'paused')} variant="outline" size="icon" className="h-10 w-10 rounded-xl border-zinc-200 text-zinc-500 hover:text-amber-600 hover:bg-amber-50" title="Pause Campaign">
                            <PauseCircle className="h-5 w-5" />
                          </Button>
                        ) : (
                          <Button onClick={() => handleStatusChange(c._id, 'live')} variant="outline" size="icon" className="h-10 w-10 rounded-xl border-zinc-200 text-zinc-500 hover:text-green-600 hover:bg-green-50" title="Resume Campaign">
                            <PlayCircle className="h-5 w-5" />
                          </Button>
                        )}
                        <Button 
                          onClick={() => setDeleteId(c._id)} 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl border-zinc-200 text-zinc-500 hover:text-red-600 hover:bg-red-50" 
                          title="Delete Campaign"
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
          {!loading && campaigns.length === 0 && (
            <div className="py-20 text-center">
              <span className="font-display text-lg font-bold text-zinc-400">No matching campaigns found</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {!loading && campaigns.length > 0 && (
        <div className="pt-4 flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Campaign"
        description="Are you sure you want to permanently delete this campaign? This action cannot be undone and will remove all associated data."
        confirmText="Permanently Delete"
      />
    </div>
  )
}
