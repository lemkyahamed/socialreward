import React from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Users, DollarSign, Calendar, CheckCircle2, Factory, Loader2 } from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { PageHeader } from "../../components/shared/PageHeader"
import { useApi } from "../../hooks/useApi"
import { EmptyState } from "../../components/ui/EmptyState"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../lib/api"

export function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data, loading, error } = useApi(`/public/campaigns/${id}`)
  const campaign = data

  const [isJoining, setIsJoining] = React.useState(false)
  const [creatorStatus, setCreatorStatus] = React.useState(null)
  const [statusLoading, setStatusLoading] = React.useState(false)

  React.useEffect(() => {
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
    if (!user) {
      navigate(`/login?redirect=/creator/campaigns/${campaign._id || campaign.id}/submit`)
      return
    }
    if (user.role !== 'creator') {
      alert("Only creators can join campaigns.")
      return
    }
    
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

  let ctaText = "Join Campaign"
  let ctaDisabled = isJoining || statusLoading
  let onCtaClick = handleJoin

  const isClosed = campaign && (campaign.status !== 'live' || new Date(campaign.endAt || campaign.deadline) < new Date());

  if (isClosed) {
    ctaText = "Campaign Closed"
    ctaDisabled = true
    onCtaClick = undefined
  } else if (user && user.role !== 'creator') {
    ctaText = "Only Creators Can Join"
    ctaDisabled = true
    onCtaClick = undefined
  } else if (user && user.role === 'creator' && creatorStatus) {
    if (creatorStatus.hasSubmitted) {
      ctaText = "View Submission"
      onCtaClick = () => navigate(`/creator/campaigns/${campaign._id || campaign.id}/submit`)
    } else if (creatorStatus.hasJoined) {
      ctaText = "Submit Work"
      onCtaClick = () => navigate(`/creator/campaigns/${campaign._id || campaign.id}/submit`)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl justify-center p-24">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <EmptyState title="Campaign not found" description="The campaign you are looking for does not exist or has expired." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Banner */}
      <div className="relative mb-12 h-[400px] w-full overflow-hidden rounded-[2.5rem] bg-zinc-900 shadow-premium group">
        <img 
          src={campaign.coverImage || campaign.bannerUrl || `https://ui-avatars.com/api/?name=${campaign.title || 'C'}&background=random&size=1200`} 
          alt={campaign.title}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
        <div className="absolute bottom-10 left-10 right-10">
          <Badge className="mb-4 h-8 px-4 bg-brand-500 text-white border-none text-xs font-bold uppercase tracking-widest">{campaign.platform}</Badge>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">{campaign.title}</h1>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white/90">{campaign.brandName || campaign.brandId?.companyName || "Brand"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12">
          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 mb-6">About the Campaign</h2>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
              <p>{campaign.fullDescription}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-100 bg-zinc-50/50 p-8 dark:border-zinc-800/50 dark:bg-zinc-900/50">
            <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 mb-8">Campaign Requirements</h2>
            <ul className="grid gap-6 sm:grid-cols-2">
              {(campaign.requirements || []).map((req, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 leading-tight">{req}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4">
          <Card className="sticky top-24 shadow-premium border-zinc-100 overflow-hidden dark:border-zinc-800/50">
            <div className="bg-zinc-50/50 dark:bg-zinc-900/50 px-8 py-6 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50">{campaign.rewardAmount ? `$${campaign.rewardAmount.toLocaleString()}` : campaign.rewardAmt}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">Reward</span>
              </div>
            </div>
            <CardContent className="p-8">
              <Button onClick={onCtaClick} disabled={ctaDisabled} size="lg" className="w-full h-14 rounded-2xl text-lg font-bold shadow-soft shadow-brand-600/20 active:scale-95 transition-all">
                {isJoining || statusLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : ctaText}
              </Button>
              
              <div className="mt-10 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 text-sm font-bold text-zinc-500 dark:text-zinc-500">
                    <Calendar className="h-5 w-5 text-brand-600/60" />
                    Deadline
                  </span>
                  <span className="text-sm font-black text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">{campaign.endAt ? new Date(campaign.endAt).toLocaleDateString() : campaign.deadline}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 text-sm font-bold text-zinc-500 dark:text-zinc-500">
                    <Users className="h-5 w-5 text-brand-600/60" />
                    Participants
                  </span>
                  <span className="text-sm font-black text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">{campaign.stats?.joins || campaign.participantsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 text-sm font-bold text-zinc-500 dark:text-zinc-500">
                    <Factory className="h-5 w-5 text-brand-600/60" />
                    Brand Status
                  </span>
                  <Badge variant="primary" className="rounded-lg px-3 py-1 font-black">Verified</Badge>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800/50">
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-500 leading-relaxed text-center">
                  Payments are held in escrow and released upon content approval.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
