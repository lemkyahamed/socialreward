import React, { useState } from "react"
import { Search, ShieldBan, MoreHorizontal } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Pagination } from "../../components/ui/Pagination"
import { mockUsers } from "../../data/mockData"

export function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = mockUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-12">
      <PageHeader 
        title="Account Management" 
        description="Monitor and moderate platform creators, brand entities, and system administrators."
      />

      <div className="flex flex-col gap-6 sm:flex-row items-center justify-between">
        <div className="relative flex-1 max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-brand-500 transition-colors" />
          <Input 
            type="search" 
            placeholder="Identity search by name or email..." 
            className="pl-12 h-14 rounded-2xl bg-zinc-50/50 border-zinc-100 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex shrink-0 gap-3">
          <div className="relative">
            <select className="h-14 appearance-none rounded-2xl border border-zinc-200 bg-white px-6 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 cursor-pointer shadow-soft">
              <option value="all">Global (All Roles)</option>
              <option value="creator">Creators Only</option>
              <option value="brand">Brand Partners</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
          <Button variant="outline" className="h-14 px-6 rounded-2xl font-bold border-zinc-200 dark:border-zinc-800 shadow-soft">Apply Filters</Button>
        </div>
      </div>

      <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
                <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest">User Profile</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Platform Role</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Registration</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Account Status</TableHead>
                <TableHead className="px-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xs text-brand-600">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-950 dark:text-zinc-50">{user.name}</span>
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <Badge 
                      variant={user.role === 'admin' ? 'primary' : user.role === 'brand' ? 'outline' : 'outline'} 
                      className="rounded-lg px-3 py-1 font-black uppercase tracking-tight"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6 text-sm font-bold text-zinc-500">{new Date(user.joinedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="py-6">
                    <Badge 
                      variant={user.status === 'active' ? 'primary' : 'outline'} 
                      className="rounded-lg px-3 py-1 font-black uppercase tracking-tight"
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-zinc-100 transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <span className="font-display text-lg font-bold text-zinc-400">No matching accounts located</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {filteredUsers.length > 0 && (
        <div className="pt-4">
          <Pagination currentPage={1} totalPages={12} onPageChange={() => {}} />
        </div>
      )}
    </div>
  )
}
