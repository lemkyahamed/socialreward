import React, { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { 
  ArrowLeft, CheckCircle2, UploadCloud, Link as LinkIcon, 
  Info, Loader2, Activity, Eye, DollarSign, Clock, RefreshCw, XCircle, AlertCircle, MessageSquare
} from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input, Label } from "../../components/ui/Input"
import { Badge } from "../../components/ui/Badge"
import { EmptyState } from "../../components/ui/EmptyState"
import { StatWidget } from "../../components/ui/StatWidget"
import { useApi } from "../../hooks/useApi"
import api from "../../lib/api"

export function SubmissionPage() {
  const { id } = useParams()
  
  const { data: campaignData, loading: campaignLoading, error: campaignError } = useApi(`/public/campaigns/${id}`)
  const { data: submissionsData, loading: subsLoading, refetch } = useApi(`/creator/submissions/${id}`)

  const campaign = campaignData
  const existingSubmission = submissionsData?.items?.[0]

  const [url, setUrl] = useState("")
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setUploading(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append('submission', selectedFile);

    try {
      const response = await api.post('/upload/submission', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFileUrl(response.data.data.url);
      setFile(selectedFile);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url && !fileUrl) {
      setSubmitError("Please provide a post URL or upload a file.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await api.post(`/creator/campaigns/${id}/submit`, {
        submissionType: fileUrl ? (url ? 'both' : 'file') : 'url',
        contentUrl: url || undefined,
        fileUrl: fileUrl || undefined
      });
      await refetch();
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSyncTracking = async () => {
    if (!existingSubmission?._id) return;
    setIsSyncing(true)
    try {
      // Execute REAL API call to backend sync endpoint
      await api.post(`/creator/submissions/${existingSubmission._id}/sync`);
      // Fully refresh state from backend to reflect metrics update
      await refetch();
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false)
    }
  }

  if (campaignLoading || subsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <p className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase">Retrieving Content...</p>
      </div>
    )
  }

  if (campaignError || !campaign) {
    return (
      <div className="py-12">
        <EmptyState title="Campaign not found" description="This campaign may have been closed or removed by the brand." action={<Link to="/creator/campaigns"><Button>Browse Marketplace</Button></Link>} />
      </div>
    )
  }

  // Canonical backend fields for metrics and status
  const reviewStatus = existingSubmission?.reviewStatus || "pending" 
  const trackingStatus = existingSubmission?.trackingStatus || "submitted"
  const metrics = existingSubmission?.metrics || { views: 0, likes: 0, comments: 0, shares: 0 }
  const calculatedEarnings = existingSubmission?.calculatedEarnings ?? 0
  const currentViews = metrics.views ?? 0
  const isApproved = reviewStatus === "approved"
  const isRejected = reviewStatus === "rejected"
  
  const rewardLabelMap = {
    'fixed': 'Fixed Return',
    'per_post': 'Per Post',
    'per_1000_views': 'Per CPM (1k views)',
    'per_engagement': 'Per Engagement'
  }
  const rewardType = campaign.rewardType || "fixed"
  
  // Use backend calculated earnings exclusively for the dashboard
  const estimatedEarnings = calculatedEarnings;

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <div className="flex items-center gap-6">
        <Link to="/creator/campaigns/joined">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader 
          title={existingSubmission ? "Content Live Tracking" : "Submit Content"} 
          description={existingSubmission ? "Monitor your active post's performance and payout clearance." : "Ready to get paid? Submit your final live post link below."}
          className="pb-0"
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {existingSubmission ? (
            /* --- POST SUBMISSION DASHBOARD --- */
            <div className="space-y-6">
              
              {/* Top Banner Status */}
              <div className={`rounded-3xl border p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm transition-all ${
                isApproved ? 'border-green-100 bg-green-50/50 dark:border-green-900/30 dark:bg-green-500/10' : 
                isRejected ? 'border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-500/10' :
                'border-brand-100 bg-brand-50/50 dark:border-brand-900/30 dark:bg-brand-500/10'
              }`}>
                <div className="flex items-center gap-6">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner ${
                    isApproved ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' :
                    isRejected ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' :
                    'bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400'
                  }`}>
                    {isApproved ? <CheckCircle2 className="h-8 w-8" /> : isRejected ? <XCircle className="h-8 w-8" /> : <Activity className="h-8 w-8" />}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-black capitalize tracking-tight text-zinc-900 dark:text-zinc-100">
                      {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Review Required'}
                    </h3>
                    <p className="text-sm font-bold text-zinc-500 mt-1 uppercase tracking-widest text-[10px] flex items-center gap-2">
                       Lifecycle Phase: <Badge variant="outline" className="h-5 px-2 rounded-md tracking-widest text-[9px] border-brand-200 dark:border-brand-900/50 bg-brand-50/50 dark:bg-brand-900/20 text-brand-600">{trackingStatus}</Badge>
                    </p>
                  </div>
                </div>
                
                {isApproved && (
                  <div className="flex flex-col items-end gap-2">
                    {existingSubmission.hasPendingMetricSync && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <span className="text-[9px] uppercase font-bold text-amber-500 tracking-widest">Pending Update</span>
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={handleSyncTracking} disabled={isSyncing || !existingSubmission.hasPendingMetricSync} className="shadow-sm border-green-200 dark:border-green-900">
                      <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> Sync APIs
                    </Button>
                  </div>
                )}
              </div>

              {/* Live Tracking Metrics */}
              {(isApproved || trackingStatus === 'tracking' || trackingStatus === 'live') && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatWidget 
                    title="Views" 
                    value={currentViews.toLocaleString()} 
                    icon={Eye} 
                  />
                  <StatWidget 
                    title="Likes" 
                    value={metrics.likes?.toLocaleString() || '0'} 
                    icon={Activity} 
                  />
                  <StatWidget 
                    title="Engagements" 
                    value={( (metrics.comments || 0) + (metrics.shares || 0) ).toLocaleString()} 
                    icon={MessageSquare} 
                  />
                  <StatWidget 
                    title="Earnings" 
                    value={`$${estimatedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                    icon={DollarSign} 
                  />
                </div>
              )}

              {/* Source Details Card */}
              <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50">
                <CardContent className="p-8 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-3 pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Platform</span>
                      <p className="mt-1 font-bold text-zinc-900 dark:text-zinc-100 capitalize">{campaign.platform}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Submission Date</span>
                      <p className="mt-1 font-bold text-zinc-900 dark:text-zinc-100">{new Date(existingSubmission.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Last Synced</span>
                      <p className="mt-1 font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        {metrics.lastSyncedAt ? <Clock className="h-4 w-4 text-brand-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                        {metrics.lastSyncedAt ? new Date(metrics.lastSyncedAt).toLocaleTimeString() : 'Not synced yet'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="uppercase text-[10px] font-bold tracking-widest text-zinc-500">Active Content URL</Label>
                    <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900 shadow-inner group">
                      <LinkIcon className="h-5 w-5 text-zinc-400 group-hover:text-brand-500 transition-colors" />
                      <a href={existingSubmission.contentUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-brand-600 hover:text-brand-500 transition-colors truncate">
                        {existingSubmission.contentUrl}
                      </a>
                    </div>
                  </div>

                  {existingSubmission.feedback && (
                    <div className="rounded-2xl border border-blue-100 p-6 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 mt-6">
                      <h4 className="mb-2 uppercase text-[10px] font-black tracking-widest text-blue-600 dark:text-blue-400">Feedback from Brand</h4>
                      <p className="text-sm font-medium leading-relaxed text-zinc-700 dark:text-zinc-300 italic">"{existingSubmission.feedback}"</p>
                    </div>
                  )}

                </CardContent>
              </Card>

            </div>
          ) : (
            /* --- SUBMISSION FORM DASHBOARD --- */
            <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50">
              <CardContent className="p-8">
                <h3 className="mb-6 font-display text-2xl font-bold text-zinc-950 dark:text-zinc-50">Upload Content Payload</h3>
                
                <form className="space-y-8" onSubmit={handleSubmit}>
                  {submitError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 flex items-center gap-3">
                      <AlertCircle className="h-5 w-5" /> {submitError}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <Label htmlFor="postUrl" className="uppercase text-[10px] font-bold tracking-widest text-zinc-500">Target Social Platform</Label>
                    <div className="flex gap-2">
                       <Badge variant="primary" className="h-10 px-6 font-bold tracking-widest uppercase">{campaign.platform}</Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="postUrl" className="uppercase text-[10px] font-bold tracking-widest text-zinc-500">Live Post URL *</Label>
                    <div className="relative group">
                      <LinkIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-brand-500" />
                      <Input
                        id="postUrl"
                        placeholder="Paste exactly as copied from the platform (e.g. TikTok / Instagram Web)"
                        className="pl-12 h-14 rounded-2xl bg-zinc-50 focus:bg-white dark:bg-zinc-900 shadow-inner"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-500 flex items-center gap-2 mt-2">
                      <Info className="h-4 w-4" />
                      Double check the URL. If the API cannot read public metrics from it, your payout may be delayed.
                    </p>
                  </div>

                  <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-zinc-50/50 p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/50 group transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-white dark:bg-zinc-800 shadow-sm group-hover:scale-110 transition-transform">
                      {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                      ) : fileUrl ? (
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      ) : (
                        <UploadCloud className="h-8 w-8 text-zinc-400 group-hover:text-brand-500" />
                      )}
                    </div>
                    <h4 className="mt-6 font-display text-lg font-bold text-zinc-950 dark:text-zinc-50">
                      {file ? `File: ${file.name}` : "Supporting Media (Optional)"}
                    </h4>
                    <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-500">
                      {fileUrl ? "File logged for brand manual review!" : "If the brand requested raw files, upload them here (Max 50MB)."}
                    </p>
                    <input
                      type="file"
                      id="rawFile"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,video/*"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg" 
                      className="mt-6 rounded-2xl px-8 shadow-sm font-bold bg-white dark:bg-zinc-950"
                      onClick={() => document.getElementById('rawFile').click()}
                      disabled={uploading}
                    >
                      {fileUrl ? "Replace File" : "Select File"}
                    </Button>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl text-lg font-bold shadow-soft shadow-brand-600/20 active:scale-95 transition-all group">
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Initiate Live Tracking"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Sandbox: Campaign Brief Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50 sticky top-24">
            <CardContent className="p-8">
              <h3 className="mb-6 uppercase text-[10px] font-black tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
                Campaign Binding
              </h3>
              <div className="flex items-center gap-4 mb-8">
                <img src={campaign.coverImage} alt="" className="h-16 w-16 rounded-[1.25rem] object-cover shadow-sm" />
                <div>
                  <h4 className="font-display text-lg font-bold text-zinc-950 dark:text-zinc-50 leading-tight line-clamp-2">{campaign.title}</h4>
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-0.5">{campaign.brandName}</p>
                </div>
              </div>

              <div className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="h-3 w-3" /> Potential Yield
                  </span>
                  <span className="font-display text-2xl font-black text-green-600 dark:text-green-400">${campaign.rewardAmount?.toLocaleString() || campaign.rewardAmt}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="h-3 w-3" /> Reward Model
                  </span>
                  <Badge variant="outline" className="rounded px-2 tracking-widest text-[10px] uppercase font-bold">{rewardLabelMap[rewardType] || rewardType.replace(/_/g, ' ')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
