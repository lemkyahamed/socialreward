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

export function Campaigns() {
  const { 
    items: campaigns, 
    pagination, 
    loading, 
    search: searchTerm, 
    setSearch: setSearchTerm, 
    filters, 
    updateFilters,
    page,
    setPage 
  } = usePagination("/public/campaigns", { 
    limit: 12,
    filters: { platform: "all" } 
  });

  const platform = filters.platform || "all";
  const totalPages = pagination.totalPages || 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader 
        title="Discover Campaigns" 
        description="Find exactly the right opportunities to monetize your audience."
        className="mb-12"
      />

      <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 transition-colors group-focus-within:text-brand-500" />
          <Input 
            type="search" 
            placeholder="Search campaigns, brands, or niches..." 
            className="pl-12 h-14 rounded-2xl shadow-soft"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex shrink-0 gap-3">
          <div className="relative">
            <select 
              className="h-14 appearance-none rounded-2xl border border-zinc-200 bg-zinc-50/50 px-6 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:text-zinc-50 transition-all cursor-pointer"
              value={platform}
              onChange={(e) => updateFilters({ platform: e.target.value })}
            >
              <option value="all">All Platforms</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
              <option value="other">Other</option>
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <Filter className="h-4 w-4" />
            </div>
          </div>
          <Button variant="outline" size="lg" className="h-14 px-6 rounded-2xl">
            Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign._id} campaign={campaign} role="public" />
          ))}
        </div>
      ) : (
        <div className="py-12">
          <EmptyState 
            title="No campaigns found" 
            description={`We couldn't find any campaigns matching your criteria. Try adjusting filters.`} 
            action={<Button onClick={() => { setSearchTerm(""); updateFilters({ platform: "all" }); }} variant="outline">Clear Filters</Button>}
          />
        </div>
      )}

      {!loading && campaigns.length > 0 && (
        <div className="mt-12">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
