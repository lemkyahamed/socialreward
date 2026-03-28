import React, { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, CheckCircle2, UploadCloud, Link as LinkIcon, Info, Loader2 } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input, Label } from "../../components/ui/Input"
import { Badge } from "../../components/ui/Badge"
import { EmptyState } from "../../components/ui/EmptyState"
import { useApi } from "../../hooks/useApi"
import api from "../../lib/api"

export function SubmissionPage() {
  const { id } = useParams()
  
  const { data: campaignData, loading: campaignLoading } = useApi(`/public/campaigns/${id}`)
  const { data: submissionsData, loading: subsLoading, refetch } = useApi(`/creator/campaigns/${id}/submissions`)

  const campaign = campaignData?.campaign
  const existingSubmission = submissionsData?.submissions?.[0]

  const [url, setUrl] = useState("")
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setUploading(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append('submission', selectedFile);

    try {
      const response = await api.post('/upload/submission', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
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
      await api.post(`/creator/campaigns/${id}/submissions`, {
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

  if (campaignLoading || subsLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    )
  }

  if (!campaign) {
    return <EmptyState title="Campaign not found" />
  }

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <div className="flex items-center gap-6">
        <Link to="/creator/campaigns/joined">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm transition-transform active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader 
          title="Submit Content" 
          description="Ready to get paid? Submit your final live post link below."
          className="pb-0"
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* Submission Form */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50">
            <CardContent className="p-8">
              <h3 className="mb-6 font-display text-2xl font-bold text-zinc-950 dark:text-zinc-50">Content Submission</h3>
              
              {existingSubmission ? (
                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-green-100 bg-green-50/50 p-6 dark:border-green-500/20 dark:bg-green-500/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 shadow-sm">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-display text-lg font-bold text-green-900 dark:text-green-300 tracking-tight">Submission received</h4>
                        <p className="text-sm font-medium text-green-700/80 dark:text-green-400/80">
                          Your post is under review. Status: <span className="font-black uppercase tracking-widest text-[10px] ml-1 px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-500/20">{existingSubmission.status}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Live Post URL</Label>
                    <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/50 group transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
                      <LinkIcon className="h-5 w-5 text-zinc-400 group-hover:text-brand-500 transition-colors" />
                      <a href={existingSubmission.contentUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-brand-600 hover:text-brand-500 transition-colors truncate">
                        {existingSubmission.contentUrl}
                      </a>
                    </div>
                  </div>

                  {existingSubmission.feedback && (
                    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/30">
                      <h4 className="mb-3 font-display text-base font-bold text-zinc-950 dark:text-zinc-50">Feedback from Brand</h4>
                      <p className="text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400 italic">"{existingSubmission.feedback}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <form className="space-y-8" onSubmit={handleSubmit}>
                  {submitError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                      {submitError}
                    </div>
                  )}
                  <div className="space-y-4">
                    <Label htmlFor="postUrl" className="uppercase text-[10px] tracking-widest text-zinc-500">Live Post URL</Label>
                    <div className="relative group">
                      <LinkIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-brand-500" />
                      <Input
                        id="postUrl"
                        placeholder="e.g. https://tiktok.com/@yourname/video/123"
                        className="pl-12 h-14 rounded-2xl"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 flex items-center gap-2">
                      <Info className="h-3.5 w-3.5" />
                      Make sure your account is public so the brand can verify the post.
                    </p>
                  </div>

                  <div className="rounded-[2rem] border border-dashed border-zinc-200 bg-zinc-50/50 p-10 text-center dark:border-zinc-800/50 dark:bg-zinc-900/50 group transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-inner">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-white dark:bg-zinc-800 shadow-soft group-hover:scale-110 transition-transform">
                      {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                      ) : fileUrl ? (
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      ) : (
                        <UploadCloud className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                      )}
                    </div>
                    <h4 className="mt-6 font-display text-lg font-bold text-zinc-950 dark:text-zinc-50">
                      {file ? `File: ${file.name}` : "Optional: Raw File Upload"}
                    </h4>
                    <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-500">
                      {fileUrl ? "File uploaded successfully!" : "Some brands require the raw video file. Max 50MB."}
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
                      className="mt-6 rounded-2xl px-8 shadow-sm"
                      onClick={() => document.getElementById('rawFile').click()}
                      disabled={uploading}
                    >
                      {fileUrl ? "Change File" : "Select File"}
                    </Button>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl text-lg font-bold shadow-soft shadow-brand-600/20 active:scale-95 transition-all">
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Submit to Brand"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Campaign Brief Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50 sticky top-24">
            <CardContent className="p-8">
              <h3 className="mb-6 uppercase text-[10px] font-black tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
                Campaign Brief
              </h3>
              <div className="flex items-center gap-4 mb-8">
                <img src={campaign.coverImage} alt="" className="h-16 w-16 rounded-[1.25rem] object-cover shadow-sm" />
                <div>
                  <h4 className="font-display text-lg font-bold text-zinc-950 dark:text-zinc-50 leading-tight">{campaign.title}</h4>
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-0.5">{campaign.brandName}</p>
                </div>
              </div>

              <div className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest text-[10px]">Reward</span>
                  <span className="font-display text-2xl font-black text-zinc-950 dark:text-zinc-50">${campaign.rewardAmount?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest text-[10px]">Platform</span>
                  <Badge variant="primary" className="rounded-lg px-3 py-1 font-black">{campaign.platform}</Badge>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-amber-50 p-5 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-start gap-3 text-amber-900 dark:text-amber-400">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="text-xs font-bold leading-relaxed">
                    Reminder: Double check that you've included all required tags and hashtags as specified in the brief before submitting!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
