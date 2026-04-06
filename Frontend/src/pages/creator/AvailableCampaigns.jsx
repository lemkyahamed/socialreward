import React from "react"
import { Search, Filter, Loader2, Sparkles } from "lucide-react"
import { EmptyState } from "../../components/ui/EmptyState"
import { PageHeader } from "../../components/shared/PageHeader"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { CampaignCard } from "../../components/shared/CampaignCard"
import { Pagination } from "../../components/ui/Pagination"
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
    filters: { 
      platform: "all",
      category: "all",
      rewardModel: "all",
      payoutRange: "all",
      status: "live"
    } 
  });

  const totalPages = pagination.totalPages || 1;
  const availableCampaigns = items.filter(c => c.joinStatus !== 'joined');

  // Helper to handle filter state safely
  const setFilter = (key, value) => {
    updateFilters({ ...filters, [key]: value })
    setPage(1);
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Creator Marketplace" 
        description="Filter and pitch to new earning opportunities matching your platform and audience."
      />

      {/* Primary Filtering Action Bar */}
      <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 p-4 shadow-sm space-y-4">
        
        {/* Top Row: Search & Status */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 transition-colors group-focus-within:text-brand-500" />
            <Input 
              type="search" 
              placeholder="Search by campaign title, brand name, or keywords..." 
              className="pl-12 h-14 rounded-xl border-zinc-200 dark:border-zinc-800 shadow-inner text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="shrink-0 flex gap-2">
            <select 
              className="h-14 rounded-xl border border-zinc-200 bg-zinc-50 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer"
              value={filters.status || "live"}
              onChange={(e) => setFilter("status", e.target.value)}
            >
              <option value="live">Accepting Pitches</option>
              <option value="all">Any Status</option>
            </select>
          </div>
        </div>

        {/* Bottom Row: Detailed Financial/Niche Filters */}
        <div className="flex flex-wrap gap-3">
          <select 
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-bold focus:outline-none focus:border-brand-500 dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer text-zinc-600 dark:text-zinc-400"
            value={filters.platform || "all"}
            onChange={(e) => setFilter("platform", e.target.value)}
          >
            <option value="all">All Platforms</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="twitter">Twitter</option>
          </select>

          <select 
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-bold focus:outline-none focus:border-brand-500 dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer text-zinc-600 dark:text-zinc-400"
            value={filters.category || "all"}
            onChange={(e) => setFilter("category", e.target.value)}
          >
            <option value="all">Any Category</option>
            <option value="tech">Tech & Software</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="gaming">Gaming</option>
            <option value="finance">Finance</option>
            <option value="beauty">Beauty & Fashion</option>
          </select>

          <select 
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-bold focus:outline-none focus:border-brand-500 dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer text-zinc-600 dark:text-zinc-400"
            value={filters.rewardModel || "all"}
            onChange={(e) => setFilter("rewardModel", e.target.value)}
          >
            <option value="all">Any Reward Model</option>
            <option value="fixed">Fixed Return</option>
            <option value="per post">Per Post</option>
            <option value="per 1000 views">Per 1k Views (CPM)</option>
            <option value="per engagement">Per Engagement</option>
          </select>

          <select 
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-bold focus:outline-none focus:border-brand-500 dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer text-zinc-600 dark:text-zinc-400"
            value={filters.payoutRange || "all"}
            onChange={(e) => setFilter("payoutRange", e.target.value)}
          >
            <option value="all">Any Payout</option>
            <option value="10-100">$10 - $100</option>
            <option value="100-500">$100 - $500</option>
            <option value="500-1000">$500 - $1000</option>
            <option value="1000+">$1000+</option>
          </select>

          {/* Quick Clear Target */}
          {Object.values(filters).some(f => f !== 'all' && f !== 'live') && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 rounded-lg text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-500/10"
              onClick={() => {
                setSearchTerm("");
                updateFilters({ platform: 'all', category: 'all', rewardModel: 'all', payoutRange: 'all', status: 'live' });
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
          <p className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase">Scanning Marketplace...</p>
        </div>
      ) : availableCampaigns.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {availableCampaigns.map((campaign) => (
            <CampaignCard key={campaign._id} campaign={campaign} role="creator" />
          ))}
        </div>
      ) : (
        <div className="py-12">
          {Object.values(filters).some(f => f !== 'all' && f !== 'live') || searchTerm ? (
            <EmptyState 
              icon={Filter}
              title="No exact matches found" 
              description="We couldn't find any opportunities matching your exact financial or demographic filters. Try broadening your criteria." 
              action={
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    updateFilters({ platform: 'all', category: 'all', rewardModel: 'all', payoutRange: 'all', status: 'live' });
                  }} 
                  variant="primary"
                  className="mt-2 h-12 shadow-soft font-bold rounded-xl"
                >
                  <Sparkles className="h-4 w-4 mr-2" /> Show All Opportunities
                </Button>
              }
            />
          ) : (
            <EmptyState 
              title="Marketplace is quiet" 
              description="There are no active campaigns accepting pitches right now. Brands are constantly launching new opportunities, so check back tomorrow!" 
            />
          )}
        </div>
      )}

      {!loading && availableCampaigns.length > 0 && (
        <div className="mt-12 flex justify-center border-t border-zinc-100 dark:border-zinc-800/50 pt-8">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
