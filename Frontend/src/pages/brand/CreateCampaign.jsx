import React from "react"
import { UploadCloud, Loader2, Link as LinkIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import api from "../../lib/api"
import { PageHeader } from "../../components/shared/PageHeader"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input, Label } from "../../components/ui/Input"

export function CreateCampaign() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [bannerUrl, setBannerUrl] = React.useState("")
  const [uploading, setUploading] = React.useState(false)

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('campaign', file);

    try {
      const response = await api.post('/upload/campaign', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setBannerUrl(response.data.data.url);
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.target);
    
    // Add 30 days to current date for default end date
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    const payload = {
      title: fd.get('campaignName'),
      platform: fd.get('platform'),
      shortDescription: fd.get('shortDesc'),
      fullDescription: fd.get('fullDesc'),
      category: 'UGC Content',
      rewardType: 'fixed',
      rewardAmount: Number(fd.get('reward') || 0),
      budgetTotal: Number(fd.get('budget') || 0),
      maxCreators: Math.floor(Number(fd.get('budget') || 1000) / Number(fd.get('reward') || 100)),
       instructions: fd.get('fullDesc'),
      bannerUrl: bannerUrl || fd.get('bannerUrl') || undefined,
      startAt: new Date().toISOString(),
      endAt: endDate.toISOString()
    };

    try {
      await api.post('/brand/campaigns', payload);
      navigate('/brand/campaigns');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <PageHeader 
        title="Create New Campaign" 
        description="Launch a new opportunity for creators and start receiving high-quality UGC content."
      />

      <form className="space-y-12" onSubmit={handleSubmit}>
        <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50">
          <CardContent className="space-y-8 p-10">
            <h3 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50 border-b border-zinc-100 pb-6 dark:border-zinc-800/50 uppercase tracking-widest text-[10px]">
              1. Basic Information
            </h3>
            
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="campaignName" className="font-bold text-xs">Campaign Title</Label>
                <Input id="campaignName" name="campaignName" required placeholder="e.g. Summer product launch UGC" className="h-12 rounded-xl" />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="platform" className="font-bold text-xs">Target Platform</Label>
                <div className="relative">
                  <select id="platform" name="platform" className="flex h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 transition-all cursor-pointer">
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram Shorts/Reels</option>
                    <option value="multi">Cross-Platform</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="shortDesc" className="font-bold text-xs">Short Summary</Label>
              <Input id="shortDesc" name="shortDesc" required placeholder="Briefly describe what you're looking for..." className="h-12 rounded-xl" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="fullDesc" className="font-bold text-xs">Detailed Brief & Instructions</Label>
              <textarea 
                id="fullDesc" 
                name="fullDesc"
                required
                rows={6} 
                className="flex w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 transition-all"
                placeholder="Give creators detailed context, dos and don'ts, and specific requirements..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50">
          <CardContent className="space-y-8 p-10">
            <h3 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50 border-b border-zinc-100 pb-6 dark:border-zinc-800/50 uppercase tracking-widest text-[10px]">
              2. Budget & Rewards
            </h3>
            
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="reward" className="font-bold text-xs">Creator Reward (Fixed)</Label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400 group-focus-within:text-brand-500 transition-colors">$</span>
                  <Input id="reward" name="reward" required type="number" placeholder="250" className="pl-10 h-12 rounded-xl" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="budget" className="font-bold text-xs">Total Campaign Budget Max</Label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400 group-focus-within:text-brand-500 transition-colors">$</span>
                  <Input id="budget" name="budget" required type="number" placeholder="5000" className="pl-10 h-12 rounded-xl" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50">
          <CardContent className="space-y-8 p-10">
            <h3 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50 border-b border-zinc-100 pb-6 dark:border-zinc-800/50 uppercase tracking-widest text-[10px]">
              3. Visual Identity
            </h3>
            
            <div className="space-y-4">
              <Label className="font-bold text-xs">Campaign Cover Image</Label>
              <div 
                className="group relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-zinc-200 bg-zinc-50/50 transition-all hover:bg-zinc-100 dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
                onClick={() => document.getElementById('bannerInput').click()}
              >
                {uploading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
                ) : bannerUrl ? (
                  <img src={bannerUrl} alt="Preview" className="h-full w-full rounded-[2.5rem] object-cover" />
                ) : (
                  <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-soft dark:bg-zinc-800 group-hover:scale-110 transition-transform">
                      <UploadCloud className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-zinc-900 dark:text-zinc-50">Click to upload campaign banner</p>
                    <p className="mt-1 text-xs font-medium text-zinc-500">Max 5MB. JPEG, PNG, WEBP</p>
                  </>
                )}
                <input 
                  type="file" 
                  id="bannerInput" 
                  className="hidden" 
                  onChange={handleBannerUpload}
                  accept="image/*"
                />
              </div>
              
              <div className="relative group mt-6">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-brand-500 transition-colors" />
                <Input 
                  id="bannerUrl" 
                  name="bannerUrl" 
                  type="url" 
                  placeholder="Or paste direct image URL..." 
                  className="pl-12 h-14 rounded-2xl" 
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" type="button" size="lg" className="h-14 rounded-2xl px-8 shadow-soft">Save Draft</Button>
          <Button disabled={isSubmitting} type="submit" size="lg" className="h-14 rounded-2xl px-12 font-bold shadow-lg shadow-brand-600/20 active:scale-95 transition-all">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Launch Campaign"}
          </Button>
        </div>
      </form>
    </div>
  )
}
