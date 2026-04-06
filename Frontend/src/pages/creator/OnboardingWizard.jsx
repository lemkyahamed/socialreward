import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, User, Link as LinkIcon, Sparkles, DollarSign, ArrowRight, ShieldCheck, Loader2 } from "lucide-react"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input, Label } from "../../components/ui/Input"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../lib/api"

export function OnboardingWizard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    displayName: user?.profile?.displayName || "",
    country: "",
    niche: "",
    followerRange: "",
    
    primaryPlatform: "",
    tiktok: "",
    instagram: "",
    youtube: "",
    
    payoutMethod: "",
    accountName: "",
    isPayoutConnected: false
  })

  // Handlers
  const updateData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.fullName) newErrors.fullName = "Full name is required"
    if (!formData.displayName) newErrors.displayName = "Display name is required"
    if (!formData.country) newErrors.country = "Country is required"
    if (!formData.niche) newErrors.niche = "Please select a niche"
    if (!formData.followerRange) newErrors.followerRange = "Follower range is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    
    // Step 2 validation
    if (step === 2) {
      if (!formData.primaryPlatform) {
        setErrors({ primaryPlatform: "Primary platform is required" })
        return
      }
    }

    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const simulatePayoutConnection = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      updateData('isPayoutConnected', true)
      updateData('payoutMethod', 'stripe')
      updateData('accountName', formData.fullName || 'Creator Account')
      setIsSubmitting(false)
    }, 1200)
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    
    try {
      // Hit the new backend endpoint to update creator profile
      await api.post('/creator/onboarding', formData);
      
      // Simulate API saving
      await new Promise(r => setTimeout(r, 1500));
      
      // Navigate to dashboard
      // Note: the backend and contexts would update user.profile.onboardingCompleted in a real app
      // For now, redirect strictly to dashboard
      window.location.href = '/creator'
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center py-12 p-4">
      <div className="w-full max-w-3xl space-y-8">
        
        {/* Progress Bar Header */}
        <div className="w-full space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="font-display text-3xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
                Setup your Creator Profile
              </h1>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                Complete all 3 steps to unlock campaigns and start earning.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Step {step} of 4</span>
            </div>
          </div>
          
          <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-500 transition-all duration-500 ease-in-out" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          
          {/* Step Indicators visually */}
          <div className="flex justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <span className={step >= 1 ? "text-brand-600" : ""}>Profile</span>
            <span className={step >= 2 ? "text-brand-600" : ""}>Socials</span>
            <span className={step >= 3 ? "text-brand-600" : ""}>Payout</span>
            <span className={step >= 4 ? "text-brand-600" : ""}>Complete</span>
          </div>
        </div>

        <Card className="shadow-premium border-zinc-100 dark:border-zinc-800">
          <CardContent className="p-8 md:p-10">

            {/* Step 1: Profile */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    <User className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-bold">Personal Information</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Legal Full Name</Label>
                    <Input 
                      placeholder="e.g. Jane Doe" 
                      value={formData.fullName}
                      onChange={(e) => updateData('fullName', e.target.value)}
                      className={`h-12 rounded-xl ${errors.fullName ? 'border-red-500 ring-red-500/20' : ''}`}
                    />
                    {errors.fullName && <p className="text-xs text-red-500 font-bold">{errors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Display Name</Label>
                    <Input 
                      placeholder="e.g. JaneD Creates" 
                      value={formData.displayName}
                      onChange={(e) => updateData('displayName', e.target.value)}
                      className={`h-12 rounded-xl ${errors.displayName ? 'border-red-500 ring-red-500/20' : ''}`}
                    />
                    {errors.displayName && <p className="text-xs text-red-500 font-bold">{errors.displayName}</p>}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Country</Label>
                    <select 
                      value={formData.country}
                      onChange={(e) => updateData('country', e.target.value)}
                      className={`w-full h-12 rounded-xl border bg-transparent px-4 text-sm font-medium shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:bg-zinc-950 ${errors.country ? 'border-red-500 ring-red-500/20' : 'border-zinc-200 dark:border-zinc-800'}`}
                    >
                      <option value="" disabled>Select your country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="OTHER">Other</option>
                    </select>
                    {errors.country && <p className="text-xs text-red-500 font-bold">{errors.country}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Content Niche</Label>
                    <select 
                      value={formData.niche}
                      onChange={(e) => updateData('niche', e.target.value)}
                      className={`w-full h-12 rounded-xl border bg-transparent px-4 text-sm font-medium shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:bg-zinc-950 ${errors.niche ? 'border-red-500 ring-red-500/20' : 'border-zinc-200 dark:border-zinc-800'}`}
                    >
                      <option value="" disabled>Select your niche</option>
                      <option value="lifestyle">Lifestyle & Vlogs</option>
                      <option value="tech">Tech & Gadgets</option>
                      <option value="beauty">Beauty & Fashion</option>
                      <option value="gaming">Gaming</option>
                      <option value="finance">Finance & Crypto</option>
                      <option value="fitness">Health & Fitness</option>
                    </select>
                    {errors.niche && <p className="text-xs text-red-500 font-bold">{errors.niche}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Total Follower Range</Label>
                  <select 
                    value={formData.followerRange}
                    onChange={(e) => updateData('followerRange', e.target.value)}
                    className={`w-full h-12 rounded-xl border bg-transparent px-4 text-sm font-medium shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:bg-zinc-950 ${errors.followerRange ? 'border-red-500 ring-red-500/20' : 'border-zinc-200 dark:border-zinc-800'}`}
                  >
                    <option value="" disabled>Select your follower range</option>
                    <option value="0-10k">Under 10,000</option>
                    <option value="10k-50k">10,000 - 50,000</option>
                    <option value="50k-500k">50,000 - 500,000</option>
                    <option value="500k+">500,000+</option>
                  </select>
                  {errors.followerRange && <p className="text-xs text-red-500 font-bold">{errors.followerRange}</p>}
                </div>

                <Button onClick={handleNext} className="w-full h-14 rounded-2xl text-lg font-bold shadow-soft group">
                  Continue Form <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            )}

            {/* Step 2: Social Links */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    <LinkIcon className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-bold">Social Platforms</h2>
                </div>

                <div className="space-y-2">
                  <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Primary Social Platform *</Label>
                  <select 
                    value={formData.primaryPlatform}
                    onChange={(e) => updateData('primaryPlatform', e.target.value)}
                    className={`w-full h-12 rounded-xl border bg-transparent px-4 text-sm font-medium shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:bg-zinc-950 ${errors.primaryPlatform ? 'border-red-500 ring-red-500/20' : 'border-zinc-200 dark:border-zinc-800'}`}
                  >
                    <option value="" disabled>Where is your main audience?</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="twitter">Twitter / X</option>
                  </select>
                  {errors.primaryPlatform && <p className="text-xs text-red-500 font-bold">{errors.primaryPlatform}</p>}
                </div>

                <div className="space-y-6 pt-4">
                  <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Optional Form Integrations</Label>
                  
                  <div className="flex flex-col gap-4">
                    {/* Platform Connection Placeholders */}
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                      <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded flex items-center justify-center font-black">TT</div>
                      <div className="flex-1">
                        <Label className="text-xs tracking-wide">TikTok Username</Label>
                        <Input 
                          placeholder="@username" 
                          value={formData.tiktok}
                          onChange={(e) => updateData('tiktok', e.target.value)}
                          className="h-10 mt-1 border-none bg-white shadow-sm dark:bg-zinc-950" 
                        />
                      </div>
                      <Button variant="outline" size="sm" className="hidden sm:flex">Connect OAuth</Button>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                      <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded flex items-center justify-center font-black">IG</div>
                      <div className="flex-1">
                        <Label className="text-xs tracking-wide">Instagram Handle</Label>
                        <Input 
                          placeholder="@username" 
                          value={formData.instagram}
                          onChange={(e) => updateData('instagram', e.target.value)}
                          className="h-10 mt-1 border-none bg-white shadow-sm dark:bg-zinc-950" 
                        />
                      </div>
                      <Button variant="outline" size="sm" className="hidden sm:flex">Connect OAuth</Button>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                      <div className="h-8 w-8 bg-red-100 text-red-600 dark:bg-red-500/20 rounded flex items-center justify-center font-black">YT</div>
                      <div className="flex-1">
                        <Label className="text-xs tracking-wide">YouTube Channel URL</Label>
                        <Input 
                          placeholder="https://youtube.com/c/..." 
                          value={formData.youtube}
                          onChange={(e) => updateData('youtube', e.target.value)}
                          className="h-10 mt-1 border-none bg-white shadow-sm dark:bg-zinc-950" 
                        />
                      </div>
                      <Button variant="outline" size="sm" className="hidden sm:flex">Connect OAuth</Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={handleBack} className="h-14 px-8 rounded-2xl">
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-soft">
                    Continue to Payouts
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payout Setup */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold">Secure Payout Connection</h2>
                  </div>
                </div>

                {!formData.isPayoutConnected ? (
                  <div className="space-y-6">
                    <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-6 dark:bg-zinc-900/50 dark:border-zinc-800/80 text-center space-y-4">
                      <div className="mx-auto w-16 h-16 bg-white dark:bg-zinc-800 shadow-sm rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="h-8 w-8 text-zinc-400" />
                      </div>
                      <h3 className="font-bold text-lg">Connect Stripe Express</h3>
                      <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-md mx-auto">
                        To guarantee seamless and fast campaign payouts, please link your preferred bank using Stripe's secure portal. You'll only need to do this once.
                      </p>
                      
                      <div className="pt-4">
                        <Button 
                          onClick={simulatePayoutConnection} 
                          disabled={isSubmitting}
                          className="h-12 rounded-xl px-8 font-bold shadow-soft group"
                        >
                          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Payout Method"}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      <Button variant="outline" onClick={handleBack} disabled={isSubmitting} className="h-14 px-8 rounded-2xl">
                        Back
                      </Button>
                      {/* Usually they can't skip, but let's gray out next until connected, or allow proceeding with an error */}
                      <Button 
                        onClick={() => setErrors({ payout: "Please authorize a payout method first." })} 
                        className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-soft opacity-50 cursor-not-allowed"
                      >
                        Complete Setup
                      </Button>
                    </div>
                    {errors.payout && <p className="text-center text-xs font-bold text-red-500">{errors.payout}</p>}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-[2rem] border border-green-100 bg-green-50/50 p-6 dark:border-green-500/20 dark:bg-green-500/5 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 shadow-sm mb-4">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h4 className="font-display text-lg font-bold text-green-900 dark:text-green-300">Bank Successfully Linked</h4>
                      <p className="text-sm font-bold text-green-700/80 dark:text-green-400/80 mt-1 uppercase tracking-widest text-[10px]">
                        Account Name: {formData.accountName}
                      </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button variant="outline" onClick={handleBack} className="h-14 px-8 rounded-2xl">
                        Back
                      </Button>
                      <Button onClick={handleNext} className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-soft">
                        Confirm & Continue
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Completion Validation */}
            {step === 4 && (
              <div className="text-center space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 py-12">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-brand-500/10 text-brand-500 shadow-sm mb-6 relative">
                  <Sparkles className="h-12 w-12" />
                  <div className="absolute -top-2 -right-2 h-8 w-8 bg-green-500 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                </div>
                
                <h2 className="font-display text-3xl font-black text-zinc-950 dark:text-zinc-50">
                  You're all set!
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mx-auto">
                  Your creator profile is verified and your payout methods are secure. You are now officially ready to find and submit to campaigns.
                </p>

                <div className="pt-8">
                  <Button onClick={handleComplete} disabled={isSubmitting} className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-brand-600/20 group max-w-sm mx-auto">
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Go to Dashboard <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
