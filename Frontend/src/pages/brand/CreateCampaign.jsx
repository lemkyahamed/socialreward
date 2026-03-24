import React from "react"
import { UploadCloud } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input, Label } from "../../components/ui/Input"

export function CreateCampaign() {
  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <PageHeader 
        title="Create New Campaign" 
        description="Launch a new opportunity for creators and start receiving high-quality UGC content."
      />

      <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
        <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50">
          <CardContent className="space-y-8 p-10">
            <h3 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50 border-b border-zinc-100 pb-6 dark:border-zinc-800/50 uppercase tracking-widest text-[10px]">
              1. Basic Information
            </h3>
            
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="campaignName" className="font-bold text-xs">Campaign Title</Label>
                <Input id="campaignName" placeholder="e.g. Summer product launch UGC" className="h-12 rounded-xl" />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="platform" className="font-bold text-xs">Target Platform</Label>
                <div className="relative">
                  <select id="platform" className="flex h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 transition-all cursor-pointer">
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
              <Input id="shortDesc" placeholder="Briefly describe what you're looking for..." className="h-12 rounded-xl" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="fullDesc" className="font-bold text-xs">Detailed Brief & Instructions</Label>
              <textarea 
                id="fullDesc" 
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
                  <Input id="reward" type="number" placeholder="250" className="pl-10 h-12 rounded-xl" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="budget" className="font-bold text-xs">Total Campaign Budget Max</Label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400 group-focus-within:text-brand-500 transition-colors">$</span>
                  <Input id="budget" type="number" placeholder="5000" className="pl-10 h-12 rounded-xl" />
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
              <div className="rounded-[2rem] border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center transition-all hover:bg-zinc-50 hover:border-brand-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/80 cursor-pointer shadow-inner group">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 text-brand-600 shadow-soft group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <h4 className="mt-6 font-display text-lg font-bold text-zinc-950 dark:text-zinc-50">Upload Thumbnail</h4>
                <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-500">
                  JPEG, PNG, WEBP up to 5MB. Recommended: 1200x800px.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" type="button" size="lg" className="h-14 rounded-2xl px-8 shadow-soft">Save Draft</Button>
          <Button type="submit" size="lg" className="h-14 rounded-2xl px-12 font-bold shadow-lg shadow-brand-600/20 active:scale-95 transition-all">Launch Campaign</Button>
        </div>
      </form>
    </div>
  )
}
