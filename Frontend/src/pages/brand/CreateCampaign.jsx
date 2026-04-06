import React, { useState } from "react"
import { UploadCloud, Loader2, Link as LinkIcon, ArrowRight, Save, PlayCircle, Settings, Target, DollarSign, ListChecks } from "lucide-react"
import { useNavigate } from "react-router-dom"
import api from "../../lib/api"
import { PageHeader } from "../../components/shared/PageHeader"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input, Label } from "../../components/ui/Input"
import { Badge } from "../../components/ui/Badge"

export function CreateCampaign() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveAction, setSaveAction] = useState(null) // 'draft' or 'publish'
  
  const [bannerUrl, setBannerUrl] = useState("")
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    platform: "tiktok",
    category: "UGC Content",
    shortDescription: "",
    fullDescription: "",
    rewardType: "fixed",
    rewardAmount: "",
    budgetTotal: "",
    trustRequirement: "",
    deadline: "",
    requirementsText: ""
  })

  const [errors, setErrors] = useState({})

  const updateData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.title) newErrors.title = "Required"
    if (!formData.shortDescription) newErrors.shortDescription = "Required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (!formData.rewardAmount || Number(formData.rewardAmount) <= 0) newErrors.rewardAmount = "Required"
    if (!formData.budgetTotal || Number(formData.budgetTotal) <= 0) newErrors.budgetTotal = "Required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors = {}
    if (!formData.fullDescription || formData.fullDescription.length < 20) {
      newErrors.fullDescription = "Brief must be at least 20 characters long"
    }
    if (!formData.deadline) newErrors.deadline = "Required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1)
  }

  const handleBack = () => setStep(step - 1)

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append('campaign', file);

    try {
      const response = await api.post('/upload/campaign', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBannerUrl(response.data.data.url);
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submitCampaign = async (status) => {
    if (status === 'live' && !validateStep3()) return;
    
    setIsSubmitting(true)
    setSaveAction(status)

    const payload = {
      title: formData.title,
      platform: formData.platform,
      category: formData.category,
      shortDescription: formData.shortDescription,
      fullDescription: formData.fullDescription,
      rewardType: formData.rewardType,
      rewardAmount: Number(formData.rewardAmount || 0),
      budgetTotal: Number(formData.budgetTotal || 0),
      maxCreators: Math.floor(Number(formData.budgetTotal || 1000) / Number(formData.rewardAmount || 100)),
      instructions: formData.fullDescription,
      requirements: formData.requirementsText.split('\\n').filter(r => r.trim()),
      trustRequirement: Number(formData.trustRequirement || 0),
      bannerUrl: bannerUrl || undefined,
      startAt: new Date().toISOString(),
      endAt: formData.deadline ? new Date(formData.deadline).toISOString() : new Date(Date.now() + 30*24*60*60*1000).toISOString()
    };

    try {
      const { data } = await api.post('/brand/campaigns', payload);
      const campaignId = data.data.campaign._id;
      
      // If we intended to publish it immediately, update status
      if (status === 'live') {
        await api.patch(`/brand/campaigns/${campaignId}/status`, { status: 'live' });
      }

      navigate('/brand/campaigns');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "An error occurred";
      setErrors({ submit: errorMsg });
    } finally {
      setIsSubmitting(false)
      setSaveAction(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <PageHeader 
        title="Create New Campaign" 
        description="Launch a new opportunity for creators and start receiving high-quality UGC content."
      />

      {/* Progress tracking */}
      <div className="w-full space-y-4">
        <div className="flex justify-between items-end">
          <div className="text-right flex-1">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Step {step} of 3</span>
          </div>
        </div>
        <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 transition-all duration-500 ease-in-out" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
        <div className="flex justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
           <span className={step >= 1 ? "text-brand-600 flex items-center gap-1" : "flex items-center gap-1"}><Target className="h-3 w-3"/> Basic Details</span>
           <span className={step >= 2 ? "text-brand-600 flex items-center gap-1" : "flex items-center gap-1"}><DollarSign className="h-3 w-3"/> Rewards & Budget</span>
           <span className={step >= 3 ? "text-brand-600 flex items-center gap-1" : "flex items-center gap-1"}><ListChecks className="h-3 w-3"/> Brief & Publish</span>
        </div>
      </div>

      <Card className="shadow-premium border-zinc-100 dark:border-zinc-800/50">
        <CardContent className="p-8 md:p-10">

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50 border-b border-zinc-100 pb-4 dark:border-zinc-800/50 flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-500" /> Basic Information
              </h3>
              
              <div className="space-y-3">
                <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Campaign Title</Label>
                <Input 
                  required 
                  placeholder="e.g. Summer product launch UGC" 
                  className={`h-12 rounded-xl ${errors.title ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}`}
                  value={formData.title}
                  onChange={(e) => updateData('title', e.target.value)}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Target Platform</Label>
                  <select 
                    className="flex h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-transparent px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-zinc-800 dark:text-zinc-50 transition-all cursor-pointer"
                    value={formData.platform}
                    onChange={(e) => updateData('platform', e.target.value)}
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube Shorts</option>
                    <option value="instagram">Instagram Reels</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="multi">Cross-Platform</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Content Category</Label>
                  <Input 
                    placeholder="e.g. Beauty, Tech, Lifestyle" 
                    className="h-12 rounded-xl"
                    value={formData.category}
                    onChange={(e) => updateData('category', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Short Summary</Label>
                <Input 
                  required 
                  placeholder="Briefly describe what you're looking for (max 300 chars)..." 
                  className={`h-12 rounded-xl ${errors.shortDescription ? 'border-red-500' : ''}`}
                  value={formData.shortDescription}
                  onChange={(e) => updateData('shortDescription', e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleNext} className="h-14 rounded-2xl text-lg font-bold shadow-soft px-8 group">
                  Rewards Setup <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Rewards & Budget */}
          {step === 2 && (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <h3 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50 border-b border-zinc-100 pb-4 dark:border-zinc-800/50 flex items-center gap-2">
                 <DollarSign className="h-5 w-5 text-brand-500" /> Budget & Rewards
               </h3>
               
               <div className="grid gap-8 sm:grid-cols-2 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                 <div className="space-y-3 col-span-full">
                   <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Reward Structure</Label>
                   <select 
                     className="flex h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-white dark:bg-zinc-950 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-zinc-800 dark:text-zinc-50 transition-all cursor-pointer"
                     value={formData.rewardType}
                     onChange={(e) => updateData('rewardType', e.target.value)}
                   >
                     <option value="fixed">Fixed Rate (Per Approved Submission)</option>
                     <option value="per_post">Per Live Post</option>
                     <option value="per_1000_views">Performance (Per 1000 Views)</option>
                     <option value="per_engagement">Performance (Per Engagement)</option>
                   </select>
                   <p className="text-xs text-zinc-500 mt-1">Defines how creators will be compensated.</p>
                 </div>

                 <div className="space-y-3">
                   <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Reward Amount</Label>
                   <div className="relative group">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400 group-focus-within:text-brand-500 transition-colors">$</span>
                     <Input 
                        required type="number" placeholder="250" 
                        className={`pl-10 h-12 rounded-xl bg-white dark:bg-zinc-950 ${errors.rewardAmount ? 'border-red-500' : ''}`}
                        value={formData.rewardAmount}
                        onChange={(e) => updateData('rewardAmount', e.target.value)}
                     />
                   </div>
                 </div>
                 
                 <div className="space-y-3">
                   <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Total Campaign Budget Maximum</Label>
                   <div className="relative group">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400 group-focus-within:text-brand-500 transition-colors">$</span>
                     <Input 
                        required type="number" placeholder="5000" 
                        className={`pl-10 h-12 rounded-xl bg-white dark:bg-zinc-950 ${errors.budgetTotal ? 'border-red-500' : ''}`}
                        value={formData.budgetTotal}
                        onChange={(e) => updateData('budgetTotal', e.target.value)}
                     />
                   </div>
                 </div>
               </div>

               <div className="flex gap-4 pt-4">
                 <Button variant="outline" onClick={handleBack} className="h-14 px-8 rounded-2xl">Back</Button>
                 <Button onClick={handleNext} className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-soft group">
                   Instructions & Brief <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                 </Button>
               </div>
             </div>
          )}

          {/* STEP 3: Brief & Publish */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <h3 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50 border-b border-zinc-100 pb-4 dark:border-zinc-800/50 flex items-center gap-2">
                 <ListChecks className="h-5 w-5 text-brand-500" /> Brief & Assets
               </h3>

               <div className="space-y-3">
                  <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500 flex justify-between">
                    Detailed Brief & Instructions 
                    <span className="text-zinc-400 font-normal">{formData.fullDescription.length}/20 min chars</span>
                  </Label>
                  <textarea 
                    required
                    rows={6} 
                    className={`flex w-full rounded-2xl border border-zinc-200 bg-transparent px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-zinc-800 dark:text-zinc-50 transition-all ${errors.fullDescription ? 'border-red-500' : ''}`}
                    placeholder="Give creators detailed context, dos and don'ts, and specific requirements..."
                    value={formData.fullDescription}
                    onChange={(e) => updateData('fullDescription', e.target.value)}
                  />
                  {errors.fullDescription && <p className="text-xs text-red-500 font-bold">{errors.fullDescription}</p>}
               </div>

               <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Additional Requirements (One per line)</Label>
                    <textarea 
                      rows={4} 
                      className="flex w-full rounded-2xl border border-zinc-200 bg-transparent px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-zinc-800 dark:text-zinc-50 transition-all"
                      placeholder="Must feature product clearly\nVideo must be 15-30s..."
                      value={formData.requirementsText}
                      onChange={(e) => updateData('requirementsText', e.target.value)}
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                         Minimum Creator Trust Score 
                         <Badge variant="outline" className="text-[10px]">Optional</Badge>
                      </Label>
                      <Input 
                        type="number" placeholder="e.g. 80" max="100" min="0" 
                        className="h-12 rounded-xl"
                        value={formData.trustRequirement}
                        onChange={(e) => updateData('trustRequirement', e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Submission Deadline</Label>
                      <Input 
                        type="datetime-local"  
                        className={`h-12 rounded-xl ${errors.deadline ? 'border-red-500' : ''}`}
                        value={formData.deadline}
                        onChange={(e) => updateData('deadline', e.target.value)}
                      />
                    </div>
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                 <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Campaign Cover Image</Label>
                 <div className="flex gap-4 items-center">
                   <div 
                     className="group relative flex h-32 w-1/3 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 transition-all hover:bg-zinc-100 dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
                     onClick={() => document.getElementById('bannerInput').click()}
                   >
                     {uploading ? (
                       <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                     ) : bannerUrl ? (
                       <img src={bannerUrl} alt="Preview" className="h-full w-full rounded-2xl object-cover" />
                     ) : (
                       <div className="flex flex-col items-center gap-2">
                         <UploadCloud className="h-6 w-6 text-zinc-400 group-hover:text-brand-500 transition-colors" />
                         <span className="text-xs font-bold text-zinc-500 group-hover:text-brand-500">Upload Image</span>
                       </div>
                     )}
                     <input type="file" id="bannerInput" className="hidden" onChange={handleBannerUpload} accept="image/*" />
                   </div>
                   <div className="flex-1 space-y-2">
                     <div className="relative group">
                       <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-brand-500 transition-colors" />
                       <Input 
                         type="url" placeholder="Or paste direct image URL..." 
                         className="pl-12 h-12 rounded-xl" 
                         value={bannerUrl}
                         onChange={(e) => setBannerUrl(e.target.value)}
                       />
                     </div>
                     <p className="text-[10px] uppercase tracking-wider text-zinc-500">Used as marketplace thumbnail</p>
                   </div>
                 </div>
               </div>
               
               {errors.submit && (
                 <div className="rounded-xl border border-red-100 bg-red-50 p-4 mt-4 mb-4 text-left">
                   <p className="text-sm font-bold text-red-600">Failed to Save Campaign</p>
                   <p className="text-xs font-medium text-red-500 mt-1">{errors.submit}</p>
                 </div>
               )}

               <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-zinc-100 dark:border-zinc-800/50">
                 <Button variant="outline" onClick={handleBack} className="h-14 px-8 rounded-2xl">Back</Button>
                 
                 <div className="flex-1 flex gap-4 justify-end">
                   <Button 
                      variant="outline" 
                      onClick={() => submitCampaign('draft')} 
                      disabled={isSubmitting}
                      className="h-14 rounded-2xl px-6 shadow-sm border-zinc-200 dark:border-zinc-800"
                    >
                     {isSubmitting && saveAction === 'draft' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2 text-zinc-500" />} Save Draft
                   </Button>
                   <Button 
                      onClick={() => submitCampaign('live')} 
                      disabled={isSubmitting}
                      className="h-14 rounded-2xl px-12 font-bold shadow-lg shadow-brand-600/20 active:scale-95 transition-all w-full sm:w-auto"
                    >
                     {isSubmitting && saveAction === 'live' ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <PlayCircle className="h-5 w-5 mr-2" />} Publish Campaign
                   </Button>
                 </div>
               </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
