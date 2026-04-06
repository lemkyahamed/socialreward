import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  Users, DollarSign, Calendar, CheckCircle2, Factory, Loader2, 
  ShieldCheck, ArrowRight, Wallet, Activity, Target
} from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { useAuth } from "../../contexts/AuthContext"
import { useApi } from "../../hooks/useApi"
import { EmptyState } from "../../components/ui/EmptyState"
import { TrustBadge } from "../../components/shared/TrustBadge"
import api from "../../lib/api"

export function CreatorCampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { data: campaign, loading, error } = useApi(`/public/campaigns/${id}`)

  const [isJoining, setIsJoining] = useState(false)
  const [creatorStatus, setCreatorStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)

  const isOnboarded = user?.profile?.isOnboarded || false
  const isPayoutConnected = user?.profile?.payoutConnected || false
  const trustScore = user?.profile?.trustScore || 0

  useEffect(() => {
    if (user?.role === 'creator' && campaign) {
      const fetchStatus = async () => {
        setStatusLoading(true)
        try {
          const res = await api.get(`/creator/campaigns/${campaign._id || campaign.id}/status`)
          setCreatorStatus(res.data.data)
        } catch (err) {
          console.error("Failed to fetch creator status", err)
        } finally {
          setStatusLoading(false)
        }
      }
      fetchStatus()
    }
  }, [user, campaign])

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      await api.post(`/creator/campaigns/${campaign._id || campaign.id}/join`)
      const res = await api.get(`/creator/campaigns/${campaign._id || campaign.id}/status`)
      setCreatorStatus(res.data.data)
    } catch (err) {
      if (err.response?.data?.message?.includes("already joined")) {
        const res = await api.get(`/creator/campaigns/${campaign._id || campaign.id}/status`)
        setCreatorStatus(res.data.data)
      } else {
        alert(err.response?.data?.message || err.message)
      }
    } finally {
      setIsJoining(false)
    }
  }

  // Determine CTA State
  let ctaText = "Join Campaign"
  let ctaDisabled = isJoining || statusLoading
  let onCtaClick = handleJoin
  let ctaVariant = "primary"

  const isClosed = campaign && (campaign.status !== 'live' || new Date(campaign.endAt || campaign.deadline) < new Date());
  
  // Dynamic CTA matching exact prompt requirements
  if (isClosed) {
    ctaText = "Campaign Closed"
    ctaDisabled = true
    onCtaClick = undefined
  } else if (!isOnboarded) {
    ctaText = "Complete Onboarding"
    onCtaClick = () => navigate('/creator/onboarding')
  } else if (!isPayoutConnected) {
    ctaText = "Connect Payout"
    ctaVariant = "outline"
    onCtaClick = () => navigate('/creator/payout-setup')
  } else if (creatorStatus) {
    if (creatorStatus.hasSubmitted) {
      ctaText = "View Active Submission"
      ctaVariant = "outline"
      onCtaClick = () => navigate(`/creator/campaigns/${campaign._id || campaign.id}/submit`)
    } else if (creatorStatus.hasJoined) {
      ctaText = "Submit Content"
      onCtaClick = () => navigate(`/creator/campaigns/${campaign._id || campaign.id}/submit`)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="mx-auto max-w-4xl py-16">
        <EmptyState title="Campaign not found" description="The earning opportunity you are looking for does not exist or has expired." action={<Button onClick={() => navigate('/creator/campaigns')}>Back to Marketplace</Button>} />
      </div>
    )
  }

  const rewardLabelMap = {
    'fixed': 'Fixed Return',
    'per_post': 'Per Post',
    'per_1000_views': 'Per CPM (1k views)',
    'per_engagement': 'Per Engagement'
  }
  const rewardType = campaign.rewardType || "fixed"
  const rewardModelLabel = rewardLabelMap[rewardType] || rewardType.replace(/_/g, ' ')
  const payoutTiming = campaign.payoutTiming || "Escrow (15 Days Post-Approval)"
  const trustReq = campaign.trustRequirement || 0
  const isEligible = trustScore >= trustReq

  return (
    <div className="space-y-12">
      {/* Premium Opportunity Banner */}
      <div className="relative h-[250px] md:h-[300px] w-full overflow-hidden rounded-[2.5rem] bg-zinc-900 shadow-premium group">
        <img 
          src={campaign.coverImage || campaign.bannerUrl || `https://ui-avatars.com/api/?name=${campaign.title || 'C'}&background=random&size=1200`} 
          alt={campaign.title}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
        <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge className="mb-4 bg-brand-500 text-white border-none font-bold uppercase tracking-widest text-[10px] px-3">{campaign.platform || 'Multi-platform'}</Badge>
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl drop-shadow-sm">{campaign.title}</h1>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/50 backdrop-blur border border-zinc-700/50">
                <Factory className="h-4 w-4 text-zinc-300" />
              </div>
              <span className="text-sm font-bold text-zinc-300 tracking-wider uppercase">{campaign.brandName || campaign.brandId?.companyName || "Brand"}</span>
            </div>
          </div>
          
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-300 mb-1">Earning Potential</span>
            <div className="flex items-center gap-1 text-4xl font-black text-green-400 drop-shadow-sm">
              <DollarSign className="h-8 w-8" />
              <span>{campaign.rewardAmount ? campaign.rewardAmount.toLocaleString() : campaign.rewardAmt}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Col: Main Opportunity Details */}
        <div className="lg:col-span-8 space-y-12">
          
          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 mb-6 flex items-center gap-3">
              <Activity className="h-6 w-6 text-brand-500" /> Campaign Overview
            </h2>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-base leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
              <p>{campaign.fullDescription || campaign.shortDescription || campaign.description}</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 mb-6 flex items-center gap-3">
              <Target className="h-6 w-6 text-brand-500" /> Platform & Requirements
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800/50 shadow-none">
                <CardContent className="p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Platform Specs</span>
                  <p className="mt-2 text-zinc-950 dark:text-zinc-50 font-bold capitalize">{campaign.platform || "Any Platform"}</p>
                  <p className="mt-1 text-xs text-zinc-500 font-medium">Standard vertical or horizontal formats accepted based on platform limits.</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800/50 shadow-none">
                <CardContent className="p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Content Category</span>
                  <p className="mt-2 text-zinc-950 dark:text-zinc-50 font-bold capitalize">{campaign.niche || campaign.category || "General Content"}</p>
                  <p className="mt-1 text-xs text-zinc-500 font-medium">Content must align strictly with brand safety guidelines.</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 rounded-3xl border border-zinc-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-6 uppercase text-[10px] tracking-widest">Required Deliverables</h3>
              <ul className="grid gap-5 sm:grid-cols-2">
                {(campaign.requirements || ['Publish 1 dedicated post', 'Include campaign hashtag', 'Keep content live for 30 days']).map((req, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 leading-tight">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 mb-6 flex items-center gap-3">
              <Wallet className="h-6 w-6 text-brand-500" /> Payout Mechanics
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Payout Formula</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 capitalize">{rewardModelLabel}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Review & Approval</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">Manuel Verification</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Payout Timing</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{payoutTiming}</p>
              </div>
            </div>
          </section>

        </div>

        {/* Right Col: Fixed Sidebar Action Panel */}
        <div className="lg:col-span-4 relative">
          <Card className="sticky top-24 shadow-premium border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
            
            <div className="bg-zinc-50 dark:bg-zinc-900 px-8 py-8 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-2">Estimated Earnings</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-black tracking-tighter text-green-600 dark:text-green-400">
                    {campaign.rewardAmount ? `$${campaign.rewardAmount.toLocaleString()}` : campaign.rewardAmt}
                  </span>
                </div>
                <Badge variant="outline" className="mt-3 w-fit text-[10px] uppercase font-bold tracking-widest">
                  {rewardModelLabel}
                </Badge>
              </div>
            </div>

            <CardContent className="p-8">
              
              {/* Creator Readiness Matrix */}
              <div className="mb-8 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Eligibility Checks</h4>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-zinc-600 dark:text-zinc-400">Profile Onboarded</span>
                    {isOnboarded ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <div className="h-2 w-2 rounded-full bg-amber-500" />}
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-zinc-600 dark:text-zinc-400">Payout Linked</span>
                    {isPayoutConnected ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <div className="h-2 w-2 rounded-full bg-amber-500" />}
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold mt-2">
                    <span className="text-zinc-600 dark:text-zinc-400">Trust Threshold ({trustReq})</span>
                    <TrustBadge 
                      label={user?.profile?.trustLabel || "New"} 
                      score={trustScore} 
                      showScore={true} 
                    />
                  </div>
                </div>
              </div>

              {!isEligible && isOnboarded && isPayoutConnected && !isClosed && !creatorStatus?.hasJoined && (
                <div className="mb-6 rounded-lg bg-red-50 p-3 text-center border border-red-100 dark:bg-red-500/10 dark:border-red-500/20">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">You do not meet the minimum Trust Score requirement for this campaign.</p>
                </div>
              )}

              <Button 
                onClick={onCtaClick} 
                disabled={ctaDisabled || (!isEligible && isOnboarded && isPayoutConnected && !creatorStatus)} 
                variant={ctaVariant}
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-soft shadow-brand-600/20 active:scale-95 transition-all mb-8 group"
              >
                {isJoining || statusLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {ctaText} 
                    {ctaText !== "Campaign Closed" && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                  </span>
                )}
              </Button>
              
              <div className="space-y-5 border-t border-zinc-100 dark:border-zinc-800 pt-8">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <Calendar className="h-4 w-4 text-brand-500" /> Submission Deadline
                  </span>
                  <span className="text-sm font-black text-zinc-950 dark:text-zinc-50">{campaign.endAt ? new Date(campaign.endAt).toLocaleDateString() : campaign.deadline}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <Users className="h-4 w-4 text-brand-500" /> Spots Remaining
                  </span>
                  <span className="text-sm font-black text-green-600 dark:text-green-400 ">{Math.max(0, 100 - (campaign.stats?.joins || 0))} Available</span>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
