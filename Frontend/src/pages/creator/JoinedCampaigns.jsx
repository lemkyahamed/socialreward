import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Search, Filter, Loader2 } from "lucide-react"
import { EmptyState } from "../../components/ui/EmptyState"
import { PageHeader } from "../../components/shared/PageHeader"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { CampaignCard } from "../../components/shared/CampaignCard"
import { Pagination } from "../../components/ui/Pagination"
import { useApi } from "../../hooks/useApi"

export function JoinedCampaigns() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const { data, loading } = useApi('/creator/joined')
  const rawJoins = data?.items || []
  
  const joinedCampaigns = rawJoins.map(join => ({
    ...join.campaignId,
    joinStatus: join.status
  }))

  const filteredCampaigns = joinedCampaigns.filter(c => 
    (statusFilter === "all" || statusFilter === c.joinStatus) &&
    (searchTerm === "" || (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Joined Campaigns" 
        description="Manage your ongoing campaigns and view your submissions."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 group max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-brand-500" />
          <Input 
            type="search" 
            placeholder="Search joined campaigns..." 
            className="pl-10 h-12 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <select 
            className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="joined">Joined</option>
            <option value="submitted">Submitted</option>
            <option value="completed">Completed</option>
          </select>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-zinc-200 dark:border-zinc-800">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign._id} campaign={campaign} role="creator" />
          ))}
        </div>
      ) : (
        <div className="py-12">
          <EmptyState 
            title="No campaigns found" 
            description={searchTerm ? `We couldn't find any joined campaigns matching "${searchTerm}".` : "You haven't joined any campaigns yet. Explore the marketplace to find opportunities!"} 
            action={!searchTerm && (
              <Link to="/creator/campaigns/available">
                <Button variant="outline">Browse Marketplace</Button>
              </Link>
            )}
          />
        </div>
      )}

      {!loading && filteredCampaigns.length > 0 && (
        <div className="mt-8">
          <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
        </div>
      )}
    </div>
  )
}
