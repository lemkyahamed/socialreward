import React from "react"
import { useApi } from "../../hooks/useApi"
import { PageHeader } from "../../components/shared/PageHeader"
import { Card, CardContent } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Loader2, RefreshCw, Eye, ThumbsUp, MessageSquare, Share2, ExternalLink } from "lucide-react"
import { EmptyState } from "../../components/ui/EmptyState"
import api from "../../lib/api"

export function MySubmissions() {
  const { data, loading, refetch } = useApi('/creator/submissions')
  const submissions = data?.items || []

  const handleSync = async (id) => {
    try {
      await api.post(`/creator/submissions/${id}/sync`)
      await refetch()
    } catch (err) {
      console.error(err)
      alert("Sync failed")
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'payout_ready':
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>
      case 'validating':
      case 'tracking':
        return <Badge variant="warning">Tracking</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader 
        title="My Submissions" 
        description="Track the performance and earnings of your submitted content."
      />

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState 
          title="No submissions yet" 
          description="You haven't submitted any content yet. Join a campaign to get started!"
        />
      ) : (
        <div className="grid gap-6">
          {submissions.map((submission) => (
            <Card key={submission._id} className="overflow-hidden border-zinc-100 shadow-soft">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail / Info */}
                  <div className="flex items-center gap-6 p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-zinc-100">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                      {submission.submissionType === 'file' ? (
                        <div className="flex h-full w-full items-center justify-center bg-brand-50 text-brand-600">
                          <Share2 className="h-8 w-8" />
                        </div>
                      ) : (
                        <img 
                          src={`https://api.dicebear.com/7.x/shapes/svg?seed=${submission._id}`} 
                          alt="" 
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-950">{submission.campaignId?.title}</h3>
                      <p className="text-sm font-medium text-zinc-500 capitalize">{submission.platform} • {submission.submissionType}</p>
                      <div className="mt-2">
                        {getStatusBadge(submission.trackingStatus)}
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex-1 p-6">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <MetricItem icon={Eye} label="Views" value={submission.metrics?.views || 0} />
                      <MetricItem icon={ThumbsUp} label="Likes" value={submission.metrics?.likes || 0} />
                      <MetricItem icon={MessageSquare} label="Comments" value={submission.metrics?.comments || 0} />
                      <MetricItem icon={Share2} label="Shares" value={submission.metrics?.shares || 0} />
                    </div>
                  </div>

                  {/* Earnings & Actions */}
                  <div className="flex flex-col justify-center gap-4 p-6 md:w-1/4 bg-zinc-50/50">
                    <div className="text-center md:text-right">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Est. Earnings</p>
                      <p className="text-2xl font-black text-brand-600">${submission.calculatedEarnings?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={() => handleSync(submission._id)} 
                        variant="outline" 
                        size="sm" 
                        className="w-full rounded-xl bg-white"
                      >
                        <RefreshCw className="mr-2 h-3.5 w-3.5" /> Sync Metrics
                      </Button>
                      {submission.contentUrl && (
                        <a href={submission.contentUrl} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm" className="w-full rounded-xl">
                            <ExternalLink className="mr-2 h-3.5 w-3.5" /> View Content
                          </Button>
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-center md:text-right text-zinc-400 font-medium">
                      Last synced: {submission.metrics?.lastSyncedAt ? new Date(submission.metrics.lastSyncedAt).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function MetricItem({ icon: Icon, label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-zinc-400">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-black text-zinc-950">{value.toLocaleString()}</p>
    </div>
  )
}
