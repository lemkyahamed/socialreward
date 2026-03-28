import React from "react"
import { Activity, Clock, FileText, Loader2 } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Card, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { useApi } from "../../hooks/useApi"

export function SystemJobLogs() {
  const { data, loading, refetch } = useApi('/admin/jobs')
  
  const sortedLogs = data?.items || []

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
        title="Infrastructure Logs" 
        description="Low-level audit trail for scheduled background tasks and automated system events."
        action={
          <div className="flex gap-3">
            <Button onClick={() => refetch()} variant="outline" size="lg" className="h-12 rounded-2xl font-bold border-zinc-200 dark:border-zinc-800 shadow-soft"><Activity className="mr-2 h-4 w-4" /> Refresh Base</Button>
            <Button variant="outline" size="lg" className="h-12 rounded-2xl font-bold border-zinc-200 dark:border-zinc-800 shadow-soft"><FileText className="mr-2 h-4 w-4" /> Export Audit</Button>
          </div>
        }
      />

      <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
                <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest">Temporal Marker</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Process Identifier</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Subsystem</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Operational Output</TableHead>
                <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLogs.map(log => (
                <TableRow key={log._id} className={`${log.status === "failed" ? "bg-red-50/20 dark:bg-red-950/20" : ""} border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors`}>
                  <TableCell className="px-8 py-5 text-zinc-500 font-mono text-[10px] font-bold whitespace-nowrap tracking-tighter">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-zinc-400" />
                      {new Date(log.createdAt).toLocaleTimeString()} · {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="py-5 font-bold text-zinc-950 dark:text-zinc-50">
                    {log.jobName}
                  </TableCell>
                  <TableCell className="py-5">
                    <Badge variant="outline" className="font-mono text-[9px] font-black tracking-[0.1em] border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase">
                      {log.jobType}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                    {typeof log.result === 'object' ? JSON.stringify(log.result) : log.result || 'N/A'}
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <Badge 
                      variant={log.status === "success" ? "primary" : "outline"}
                      className="rounded-lg font-black text-[10px] uppercase"
                    >
                      {log.status === "success" ? "COMPLETE" : log.status === "failed" ? "EXCEPTION" : log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {sortedLogs.length === 0 && (
            <div className="py-24 text-center">
              <span className="font-display text-lg font-bold text-zinc-400">Log buffers are currently empty</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
