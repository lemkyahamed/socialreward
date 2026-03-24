import React from "react"
import { useParams, Link } from "react-router-dom"
import { Check, X, ExternalLink, AlertTriangle, MessageSquare } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { mockSubmissions } from "../../data/mockData"
import { EmptyState } from "../../components/ui/EmptyState"

export function SubmissionReview() {
  const { id } = useParams()
  const submission = mockSubmissions.find(s => s.id === id) || mockSubmissions[0]

  if (!submission) {
    return <EmptyState title="Submission not found" />
  }

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <div className="flex items-center gap-6">
        <Link to={`/brand/campaigns/${submission.campaignId}`}>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm transition-transform active:scale-95">
            ←
          </Button>
        </Link>
        <PageHeader 
          title="Review Content"
          description={`Validating submission from ${submission.creatorName} for ${submission.campaignTitle}`}
          className="pb-0"
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* Main Content Area */}
        <div className="lg:col-span-7 space-y-8">
          <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
            <CardHeader className="p-8 border-b border-zinc-50 dark:border-zinc-800/50 flex flex-row items-center justify-between">
              <CardTitle className="font-display text-xl font-bold">Content Preview</CardTitle>
              <a href={submission.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-500 dark:text-brand-400 transition-colors">
                View Source <ExternalLink className="h-4 w-4" />
              </a>
            </CardHeader>
            <CardContent className="p-0 bg-zinc-950">
              <div className="flex aspect-[9/16] w-full items-center justify-center overflow-hidden bg-zinc-900 shadow-inner">
                {/* Simulated high-end video player look */}
                <div className="text-center group cursor-pointer">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md group-hover:scale-110 transition-transform">
                    <PlayCircleIcon className="h-12 w-12" />
                  </div>
                  <p className="text-sm font-bold text-white/60 tracking-widest uppercase">Content Stream Preview</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50">
            <CardHeader className="p-8 border-b border-zinc-50 dark:border-zinc-800/50">
              <CardTitle className="font-display text-xl font-bold">Final Verdict</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Internal Review Notes</Label>
                <textarea 
                  rows={4} 
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 transition-all"
                  placeholder="Summarize your review or leave feedback for the creator..."
                />
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl text-red-600 border-red-100 hover:bg-red-50 font-bold shadow-soft">
                  <X className="mr-2 h-5 w-5" /> Reject Submission
                </Button>
                <Button className="flex-1 h-14 rounded-2xl font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 active:scale-95 transition-all">
                  <Check className="mr-2 h-5 w-5" /> Approve & Payout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="shadow-premium border-brand-100 dark:border-brand-500/20 bg-brand-50/20 dark:bg-brand-500/5">
            <CardContent className="p-8">
              <h3 className="mb-6 uppercase text-[10px] font-black tracking-[0.2em] text-brand-600 dark:text-brand-400">
                Creator Profile
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img src={submission.creatorAvatar} className="h-14 w-14 rounded-2xl shadow-premium" alt="" />
                  <div>
                    <h4 className="font-display text-lg font-bold text-zinc-950 dark:text-zinc-50 leading-tight">{submission.creatorName}</h4>
                    <p className="text-sm font-bold text-zinc-500">Tier 1 Creator</p>
                  </div>
                </div>
                
                <div className="border-t border-brand-200/50 dark:border-brand-500/20 pt-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-zinc-500 text-xs uppercase tracking-widest">Current Status</span>
                    <Badge variant="primary" className="rounded-lg font-black uppercase tracking-tight">
                      {submission.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-zinc-500 text-xs uppercase tracking-widest">Locked Reward</span>
                    <span className="font-display text-lg font-black text-brand-600 dark:text-brand-400">{submission.rewardAmt}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-zinc-500 text-xs uppercase tracking-widest">Risk Index</span>
                    <span className="flex items-center gap-1.5 font-display text-lg font-black text-amber-600 dark:text-amber-500">
                      {submission.riskScore}% <AlertTriangle className="h-4 w-4" />
                    </span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-bold border-brand-200 bg-white/50 dark:border-brand-500/30 dark:bg-zinc-900/50">
                  <MessageSquare className="mr-2 h-4 w-4" /> Reach out to Creator
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50">
            <CardContent className="p-8">
              <h3 className="mb-6 uppercase text-[10px] font-black tracking-[0.2em] text-zinc-500">
                Initial Performance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="font-display text-2xl font-black text-zinc-950 dark:text-zinc-50">{submission.views}</span>
                  <p className="mt-1 text-xs font-bold text-zinc-500 uppercase tracking-widest">Unique Views</p>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="font-display text-2xl font-black text-zinc-950 dark:text-zinc-50">{submission.engagement}</span>
                  <p className="mt-1 text-xs font-bold text-zinc-500 uppercase tracking-widest">Eng. Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PlayCircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  )
}
