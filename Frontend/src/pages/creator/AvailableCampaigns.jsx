import React, { useState, useEffect } from "react"
import { Search, Filter, Loader2 } from "lucide-react"
import { EmptyState } from "../../components/ui/EmptyState"
import { PageHeader } from "../../components/shared/PageHeader"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { CampaignCard } from "../../components/shared/CampaignCard"
import { Pagination } from "../../components/ui/Pagination"
import api from "../../lib/api"

import { usePagination } from "../../hooks/usePagination"

export function AvailableCampaigns() {
  const { 
    items, 
    pagination, 
    loading, 
    search: searchTerm, 
    setSearch: setSearchTerm, 
    filters, 
    updateFilters,
    page,
    setPage 
  } = usePagination("/creator/campaigns", { 
    limit: 12,
    filters: { platform: "all" } 
  });

  const platform = filters.platform || "all";
  const totalPages = pagination.totalPages || 1;
  const availableCampaigns = items.filter(c => c.joinStatus !== 'joined');

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Available Campaigns" 
        description="Browse and join new campaigns to start earning rewards."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 group max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-brand-500" />
          <Input 
            type="search" 
            placeholder="Search active campaigns..." 
            className="pl-10 h-12 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <select 
            className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 cursor-pointer"
            value={platform}
            onChange={(e) => { setPlatform(e.target.value); setPage(1); }}
          >
            <option value="all">All Platforms</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="twitter">Twitter</option>
            <option value="other">Other</option>
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
      ) : availableCampaigns.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {availableCampaigns.map((campaign) => (
            <CampaignCard key={campaign._id} campaign={campaign} role="creator" />
          ))}
        </div>
      ) : (
        <div className="py-12">
          <EmptyState 
            title="No campaigns found" 
            description={searchTerm ? `We couldn't find any available campaigns matching "${searchTerm}".` : "There are no campaigns available for you right now. Check back soon!"} 
            action={searchTerm && <Button onClick={() => setSearchTerm("")} variant="outline">Clear Search</Button>}
          />
        </div>
      )}

      {!loading && availableCampaigns.length > 0 && (
        <div className="mt-8">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
