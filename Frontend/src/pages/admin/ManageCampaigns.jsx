import React, { useState } from "react"
import { Search, MoreHorizontal, PauseCircle, PlayCircle, ShieldAlert } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Pagination } from "../../components/ui/Pagination"
import { mockCampaigns } from "../../data/mockData"

export function ManageCampaigns() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCampaigns = mockCampaigns.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.brandName.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <select className="h-14 appearance-none rounded-2xl border border-zinc-200 bg-white px-6 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 cursor-pointer shadow-soft">
              <option value="all">Status: All States</option>
              <option value="active">Status: Active</option>
              <option value="paused">Status: Paused</option>
              <option value="flagged">Status: Flagged</option>
            </select>
          </div>
          <Button variant="outline" className="h-14 px-6 rounded-2xl font-bold border-zinc-200 dark:border-zinc-800 shadow-soft">Advanced Sort</Button>
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
              {filteredCampaigns.map(c => (
                <TableRow key={c.id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <TableCell className="px-8 py-6">
                    <span className="font-bold text-zinc-950 dark:text-zinc-50 max-w-[240px] truncate block">{c.title}</span>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tight mt-1">ID: {c.id.substring(0,8)}</span>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-brand-600">B</div>
                      <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{c.brandName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 px-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-display text-base font-black text-zinc-950 dark:text-zinc-50">${c.budgetUsed}</span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">of ${c.budgetTotal}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <Badge variant={c.status === 'active' ? 'primary' : 'outline'} className="rounded-lg px-3 py-1 font-black uppercase tracking-tight">
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {c.status === 'active' ? (
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-zinc-200 text-zinc-500 hover:text-amber-600 hover:bg-amber-50" title="Pause Campaign">
                          <PauseCircle className="h-5 w-5" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-zinc-200 text-zinc-500 hover:text-green-600 hover:bg-green-50" title="Resume Campaign">
                          <PlayCircle className="h-5 w-5" />
                        </Button>
                      )}
                      
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-red-50 text-red-500 hover:bg-red-50 hover:border-red-100 dark:border-red-900/10 dark:hover:bg-red-900/20" title="Flag manually">
                        <ShieldAlert className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredCampaigns.length === 0 && (
            <div className="py-20 text-center">
              <span className="font-display text-lg font-bold text-zinc-400">No matching campaigns found</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {filteredCampaigns.length > 0 && (
        <div className="pt-4">
          <Pagination currentPage={1} totalPages={24} onPageChange={() => {}} />
        </div>
      )}
    </div>
  )
}
