import React from "react"
import { ShieldAlert, AlertTriangle, ExternalLink, Check, X, Loader2 } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Card, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { useApi } from "../../hooks/useApi"
import api from "../../lib/api"

export function SuspiciousSubmissions() {
  const { data, loading, refetch } = useApi('/admin/suspicious?status=open')
  const flaggedSubmissions = data?.items || []

  const handleAction = async (flag, action) => {
    try {
      if (action === 'block') {
        const creatorId = flag.submissionId?.creatorId?._id;
        if (creatorId) {
          await api.patch(`/admin/users/${creatorId}/status`, { status: 'suspended' });
        }
        await api.patch(`/admin/suspicious/${flag._id}`, { status: 'resolved' });
        alert("User blocked and flag resolved");
      } else {
        await api.patch(`/admin/suspicious/${flag._id}`, { status: 'ignored' });
        alert("Flag ignored");
      }
      await refetch();
    } catch (err) {
      alert("Failed to execute action");
    }
  }

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
        title="Moderation Engine" 
        description="Priority queue for submissions flagged by AI heuristics or manual brand reports."
      />

      <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
                <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest">Risk Analysis</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Target Content</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Creator Identity</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Anomaly Signature</TableHead>
                <TableHead className="px-8 text-right font-bold text-[10px] uppercase tracking-widest">Action Required</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flaggedSubmissions.map(flag => {
                const sub = flag.submissionId;
                if (!sub) return null; // Defensive check
                return (
                  <TableRow key={flag._id} className={`${flag.score >= 80 ? "bg-red-50/20 dark:bg-red-950/20" : ""} border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors`}>
                    <TableCell className="px-8 py-6">
                      <Badge variant={flag.score >= 80 ? "danger" : "warning"} className="flex w-max items-center gap-1.5 rounded-lg font-black uppercase tracking-tight">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {flag.score >= 80 ? "High" : "Medium"} RISK
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-950 dark:text-zinc-50">{sub.campaignId?.title}</span>
                        <a href={sub.contentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-black text-brand-600 hover:text-brand-500 uppercase tracking-widest mt-1">
                          View Live <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-3">
                        <img src={sub.creatorId?.avatar || `https://ui-avatars.com/api/?name=${sub.creatorId?.email}`} className="h-8 w-8 rounded-full shadow-sm" alt="" />
                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{sub.creatorId?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 max-w-[200px]">
                      <span className="text-xs font-medium text-zinc-500 leading-relaxed italic">
                        {flag.reason}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button onClick={() => handleAction(flag, 'ignore')} variant="outline" size="sm" className="h-10 px-4 rounded-xl text-green-600 border-green-50 hover:bg-green-50 font-bold active:scale-95 transition-all" title="Verified Safe">
                          <Check className="h-4 w-4 mr-2" /> False Alarm
                        </Button>
                        <Button onClick={() => handleAction(flag, 'block')} variant="outline" size="sm" className="h-10 px-4 rounded-xl text-red-600 border-red-50 hover:bg-red-50 font-bold active:scale-95 transition-all" title="Revoke & Restrict">
                          <X className="h-4 w-4 mr-2" /> Block User
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {flaggedSubmissions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6">
                <ShieldAlert className="h-10 w-10 text-zinc-200 dark:text-zinc-800" />
              </div>
              <h3 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50">Operational Integrity Intact</h3>
              <p className="text-sm text-zinc-500 mt-2 max-w-[280px]">Excellent work. All high-risk activity has been cleared from the moderation index.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
