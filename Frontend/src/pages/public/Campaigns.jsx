import React, { useState } from "react"
import { Search, Filter } from "lucide-react"
import { EmptyState } from "../../components/ui/EmptyState"
import { PageHeader } from "../../components/shared/PageHeader"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { CampaignCard } from "../../components/shared/CampaignCard"
import { Pagination } from "../../components/ui/Pagination"
import { mockCampaigns } from "../../data/mockData"

export function Campaigns() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCampaigns = mockCampaigns.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.brandName.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <select className="h-14 appearance-none rounded-2xl border border-zinc-200 bg-zinc-50/50 px-6 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:text-zinc-50 transition-all cursor-pointer">
              <option value="all">All Platforms</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
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

      {filteredCampaigns.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} role="public" />
          ))}
        </div>
      ) : (
        <div className="py-12">
          <EmptyState 
            title="No campaigns found" 
            description={`We couldn't find any campaigns matching "${searchTerm}". Try a different keyword or browse all categories.`} 
            action={<Button onClick={() => setSearchTerm("")} variant="outline">Clear Search</Button>}
          />
        </div>
      )}

      {filteredCampaigns.length > 0 && (
        <div className="mt-12">
          <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
        </div>
      )}
    </div>
  )
}
