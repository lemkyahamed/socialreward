import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Building, ImageIcon, ArrowRight, ShieldCheck, Loader2 } from "lucide-react"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input, Label } from "../../components/ui/Input"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../lib/api"

export function BrandOnboardingWizard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Form State
  const [formData, setFormData] = useState({
    companyName: user?.profile?.companyName || "",
    brandName: user?.profile?.brandName || "",
    website: user?.profile?.website || "",
    industry: user?.profile?.industry || "",
    contactName: user?.profile?.contactName || "",
    contactEmail: user?.profile?.contactEmail || user?.email || "",
    logoUrl: user?.profile?.logoUrl || "",
    description: user?.profile?.description || ""
  })

  // Handlers
  const updateData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.companyName) newErrors.companyName = "Company name is required"
    if (!formData.brandName) newErrors.brandName = "Brand name is required"
    if (!formData.website) newErrors.website = "Website is required"
    if (!formData.industry) newErrors.industry = "Please select an industry"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (!formData.contactName) newErrors.contactName = "Contact name is required"
    if (!formData.contactEmail) newErrors.contactEmail = "Contact email is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      // Auto-format website URL if missing http prefix
      const websiteUrl = formData.website;
      let finalWebsite = websiteUrl;
      if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        finalWebsite = `https://${websiteUrl}`;
      }
      
      const payload = { ...formData, website: finalWebsite };
      
      const response = await api.post('/brand/onboarding', payload);
      
      // Update local storage so reload is seamless
      if (response.data?.data?.profile) {
        const storedUserStr = localStorage.getItem('user');
        if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr);
          storedUser.profile = response.data.data.profile;
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
      }

      await new Promise(r => setTimeout(r, 500));
      window.location.href = '/brand'
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || err.message || "Failed to save profile. Please try again.";
      setErrors({ submit: errorMsg })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center py-12 p-4">
      <div className="w-full max-w-3xl space-y-8">
        
        {/* Progress Header */}
        <div className="w-full space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="font-display text-3xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
                Set up your Brand Profile
              </h1>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                Let's get your brand verified and ready for prime time.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Step {step} of 3</span>
            </div>
          </div>
          
          <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-500 transition-all duration-500 ease-in-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <span className={step >= 1 ? "text-brand-600" : ""}>Company Details</span>
            <span className={step >= 2 ? "text-brand-600" : ""}>Contact Info</span>
            <span className={step >= 3 ? "text-brand-600" : ""}>Complete</span>
          </div>
        </div>

        <Card className="shadow-premium border-zinc-100 dark:border-zinc-800">
          <CardContent className="p-8 md:p-10">

            {/* Step 1: Company Profile */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    <Building className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-bold">Company Profile</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Logo Placeholder */}
                  <div className="flex flex-col gap-2">
                    <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Brand Logo</Label>
                    <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 transition-all group">
                      <ImageIcon className="h-6 w-6 text-zinc-400 group-hover:text-brand-500 mb-1" />
                      <span className="text-[10px] font-bold text-zinc-500 group-hover:text-brand-500">Upload</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Legal Company Name</Label>
                        <Input 
                          placeholder="Acme Corp LLC" 
                          value={formData.companyName}
                          onChange={(e) => updateData('companyName', e.target.value)}
                          className={`h-12 rounded-xl border bg-transparent ${errors.companyName ? 'border-red-500 ring-red-500/20' : ''}`}
                        />
                        {errors.companyName && <p className="text-xs text-red-500 font-bold">{errors.companyName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Brand / App Name</Label>
                        <Input 
                          placeholder="Acme App" 
                          value={formData.brandName}
                          onChange={(e) => updateData('brandName', e.target.value)}
                          className={`h-12 rounded-xl border bg-transparent ${errors.brandName ? 'border-red-500 ring-red-500/20' : ''}`}
                        />
                        {errors.brandName && <p className="text-xs text-red-500 font-bold">{errors.brandName}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Company Website</Label>
                    <Input 
                      placeholder="https://acme.com" 
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateData('website', e.target.value)}
                      className={`h-12 rounded-xl border bg-transparent ${errors.website ? 'border-red-500 ring-red-500/20' : ''}`}
                    />
                    {errors.website && <p className="text-xs text-red-500 font-bold">{errors.website}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Industry / Category</Label>
                    <select 
                      value={formData.industry}
                      onChange={(e) => updateData('industry', e.target.value)}
                      className={`w-full h-12 rounded-xl border bg-transparent px-4 text-sm font-medium shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:bg-zinc-950 ${errors.industry ? 'border-red-500 ring-red-500/20' : 'border-zinc-200 dark:border-zinc-800'}`}
                    >
                      <option value="" disabled>Select industry</option>
                      <option value="tech">Tech & Software</option>
                      <option value="ecommerce">E-Commerce & Retail</option>
                      <option value="health">Health & Wellness</option>
                      <option value="finance">Finance & Fintech</option>
                      <option value="gaming">Gaming</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.industry && <p className="text-xs text-red-500 font-bold">{errors.industry}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Company Description (Optional)</Label>
                  <textarea 
                    placeholder="Tell us what you do..."
                    value={formData.description}
                    onChange={(e) => updateData('description', e.target.value)}
                    className="w-full min-h-[100px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent p-4 text-sm font-medium shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:bg-zinc-950"
                  />
                </div>

                <Button onClick={handleNext} className="w-full h-14 rounded-2xl text-lg font-bold shadow-soft group">
                  Continue to Contacts <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-bold">Contact Person</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Full Name</Label>
                    <Input 
                      placeholder="Jane Doe" 
                      value={formData.contactName}
                      onChange={(e) => updateData('contactName', e.target.value)}
                      className={`h-12 rounded-xl border bg-transparent ${errors.contactName ? 'border-red-500 ring-red-500/20' : ''}`}
                    />
                    {errors.contactName && <p className="text-xs text-red-500 font-bold">{errors.contactName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Role / Title (Optional)</Label>
                    <Input 
                      placeholder="Marketing Manager" 
                      className="h-12 rounded-xl border bg-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="uppercase text-[10px] tracking-widest text-zinc-500">Work Email</Label>
                  <Input 
                    type="email"
                    placeholder="jane@acme.com" 
                    value={formData.contactEmail}
                    onChange={(e) => updateData('contactEmail', e.target.value)}
                    className={`h-12 rounded-xl border bg-transparent ${errors.contactEmail ? 'border-red-500 ring-red-500/20' : ''}`}
                  />
                  {errors.contactEmail && <p className="text-xs text-red-500 font-bold">{errors.contactEmail}</p>}
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-900/10 mb-4">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    <strong>Note on Verification:</strong> Your account will undergo a brief automated verification before campaigns can go live to ensure high quality for our creators.
                  </div>
                </div>

                {errors.submit && <p className="text-center text-sm font-bold text-red-500">{errors.submit}</p>}

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={handleBack} disabled={isSubmitting} className="h-14 px-8 rounded-2xl">
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={isSubmitting} className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-soft">
                    Review & Complete
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Completion */}
            {step === 3 && (
              <div className="text-center space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 py-12">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-green-500/10 text-green-600 dark:text-green-500 shadow-sm mb-6 relative">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                
                <h2 className="font-display text-3xl font-black text-zinc-950 dark:text-zinc-50">
                  Ready to Launch!
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mx-auto mb-2">
                  Your brand profile is complete. You can now access your dashboard and start creating campaigns to reach top-tier creators.
                </p>

                {errors.submit && (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4 max-w-sm mx-auto mt-4 text-left">
                    <p className="text-sm font-bold text-red-600">Verification Error:</p>
                    <p className="text-xs font-medium text-red-500 mt-1">{errors.submit}</p>
                  </div>
                )}

                <div className="pt-8 flex gap-4">
                  <Button variant="outline" onClick={handleBack} disabled={isSubmitting} className="h-14 px-8 rounded-2xl border-zinc-200">
                    Back
                  </Button>
                  <Button onClick={handleComplete} disabled={isSubmitting} className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-brand-600/20 group">
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
