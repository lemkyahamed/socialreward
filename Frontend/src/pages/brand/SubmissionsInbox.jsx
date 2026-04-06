import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Search, Filter, Clock, CheckCircle2, XCircle, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Card, CardContent } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { EmptyState } from "../../components/ui/EmptyState"
import { useApi } from "../../hooks/useApi"
import { useDebounce } from "../../hooks/useDebounce"

export function SubmissionsInbox() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Use the new getAllSubmissions route. We pass status filter if it's not "all".
  const endpoint = `/brand/submissions?status=${activeTab}&search=${encodeURIComponent(debouncedSearch)}`
  const { data, loading, error } = useApi(endpoint)
  const submissions = data?.items || []

  const stats = {
    total: data?.pagination?.totalItems || 0,
    pending: submissions.filter(s => s.reviewStatus === 'pending').length, // This is just matching current view, but good enough for MVP
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="bg-green-50 text-green-700 ring-green-600/20"><CheckCircle2 className="mr-1 h-3 w-3" /> Approved</Badge>
      case 'rejected':
        return <Badge variant="error" className="bg-red-50 text-red-700 ring-red-600/20"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>
      default:
        return <Badge variant="warning" className="bg-amber-50 text-amber-700 ring-amber-600/20"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader 
          title="Review Submissions" 
          description="Manage and validate content submitted by creators across your campaigns."
          className="pb-0"
        />
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-10 px-4 rounded-xl border-zinc-200">
            <span className="font-bold text-zinc-950">{stats.total} Total</span>
          </Badge>
        </div>
      </div>

      <Card className="shadow-soft border-zinc-100">
        <div className="border-b border-zinc-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              {['all', 'pending', 'approved', 'rejected'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                    activeTab === tab
                      ? "bg-zinc-950 text-white shadow-md dark:bg-zinc-50 dark:text-zinc-950"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Search creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:w-64 bg-zinc-50 border-zinc-200 rounded-xl"
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0 rounded-xl">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <p className="font-bold text-zinc-950">Failed to load submissions</p>
              <p className="text-sm text-zinc-500">{error.message}</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-12">
              <EmptyState 
                icon={CheckCircle2} 
                title="No submissions found" 
                description={activeTab !== 'all' ? `There are no ${activeTab} submissions matching your filters.` : "You don't have any submissions yet."} 
              />
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {submissions.map((submission) => (
                <div key={submission._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-6 hover:bg-zinc-50 transition-colors group">
                  <div className="flex items-center gap-4 sm:w-1/4">
                    <img 
                      src={submission.creatorId?.avatar || `https://ui-avatars.com/api/?name=${submission.creatorId?.firstName}`} 
                      alt="" 
                      className="h-12 w-12 rounded-xl object-cover shadow-sm bg-zinc-100"
                    />
                    <div>
                      <p className="font-bold text-zinc-950 dark:text-zinc-50">
                        {submission.creatorId?.firstName} {submission.creatorId?.lastName}
                      </p>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Tier 1 Creator</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 sm:px-6">
                    <Link to={`/brand/campaigns/${submission.campaignId?._id}`} className="hover:underline">
                      <p className="font-bold text-zinc-950 dark:text-zinc-50">{submission.campaignId?.title || 'Unknown Campaign'}</p>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs font-medium text-zinc-500">
                        Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                      <span className="text-zinc-300">•</span>
                      <p className="text-xs font-medium text-brand-600 uppercase font-black tracking-widest">
                        {submission.campaignId?.platform || 'Social'}
                      </p>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center gap-8 px-6 border-x border-zinc-100">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Views</p>
                      <p className="font-display text-sm font-black text-zinc-950">{submission.metrics?.views?.toLocaleString() || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Target Yield</p>
                      <p className="font-display text-sm font-black text-brand-600">${submission.calculatedEarnings?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:w-1/3 sm:justify-end gap-6">
                    {getStatusBadge(submission.reviewStatus)}
                    
                    <Link to={`/brand/submissions/${submission._id}`}>
                      <Button variant="outline" className="h-10 rounded-xl font-bold bg-white group-hover:border-zinc-300 group-hover:shadow-sm transition-all border-zinc-200">
                        Review <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
