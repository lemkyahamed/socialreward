import React, { useState, useEffect } from "react"
import { Search, ShieldBan, MoreHorizontal, Loader2, Play, Trash2 } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { Badge } from "../../components/ui/Badge"
import { Pagination } from "../../components/ui/Pagination"
import { useApi } from "../../hooks/useApi"
import { usePagination } from "../../hooks/usePagination"
import { UserDeleteModal } from "./UserDeleteModal"
import api from "../../lib/api"

export function ManageUsers() {
  const { 
    items: users, 
    pagination, 
    loading, 
    search: searchTerm, 
    setSearch: setSearchTerm, 
    filters, 
    updateFilters,
    page,
    setPage,
    refetch 
  } = usePagination("/admin/users", { limit: 10 });

  const roleFilter = filters.role || "all";
  const totalPages = pagination.totalPages || 1;

  const [deleteUser, setDeleteUser] = useState(null)

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      alert("User status updated");
      await refetch();
    } catch(err) {
      alert("Failed to update status");
    }
  }

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
            <select 
              className="h-14 appearance-none rounded-2xl border border-zinc-200 bg-white px-6 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 cursor-pointer shadow-soft"
              value={roleFilter}
              onChange={(e) => {
                updateFilters({ role: e.target.value === 'all' ? undefined : e.target.value })
                setPage(1)
              }}
            >
              <option value="all">Global (All Roles)</option>
              <option value="creator">Creators Only</option>
              <option value="brand">Brand Partners</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
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
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-500" />
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user._id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xs text-brand-600">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-950 dark:text-zinc-50">{user.email.split('@')[0]}</span>
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
                    <TableCell className="py-6 text-sm font-bold text-zinc-500">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="py-6">
                      <Badge 
                        variant={user.status === 'active' ? 'primary' : 'outline'} 
                        className="rounded-lg px-3 py-1 font-black uppercase tracking-tight"
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      {user.status === 'active' ? (
                        <Button onClick={() => handleStatusChange(user._id, 'suspended')} variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Suspend User">
                          <ShieldBan className="h-5 w-5" />
                        </Button>
                      ) : (
                        <Button onClick={() => handleStatusChange(user._id, 'active')} variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors" title="Activate User">
                          <Play className="h-5 w-5" />
                        </Button>
                      )}
                      <Button 
                        onClick={() => setDeleteUser(user)} 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" 
                        title="Permanently Delete User"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!loading && users.length === 0 && (
            <div className="py-20 text-center">
              <span className="font-display text-lg font-bold text-zinc-400">No matching accounts located</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {!loading && users.length > 0 && (
        <div className="pt-4 flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <UserDeleteModal 
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        userId={deleteUser?._id}
        userEmail={deleteUser?.email}
        userRole={deleteUser?.role}
        onDeleteSuccess={refetch}
      />
    </div>
  )
}
