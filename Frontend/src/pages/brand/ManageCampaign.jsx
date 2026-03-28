import React from "react"
import { useParams, Link } from "react-router-dom"
import { Users, DollarSign, Activity, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Tabs } from "../../components/ui/Tabs"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { StatWidget } from "../../components/ui/StatWidget"
import { EmptyState } from "../../components/ui/EmptyState"
import { Modal } from "../../components/ui/Modal"
import { Input } from "../../components/ui/Input"
import { useApi } from "../../hooks/useApi"
import api from "../../lib/api"

export function ManageCampaign() {
  const { id } = useParams()
  
  const { data: campaignData, loading: campaignLoading } = useApi(`/brand/campaigns/${id}`)
  const { data: submissionsData, loading: subsLoading } = useApi(`/brand/campaigns/${id}/submissions`)

  const campaign = campaignData?.data || campaignData?.campaign; // Depending on exact backend response
  const campaignSubmissions = submissionsData?.data || submissionsData?.submissions || [];

  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = React.useState(false)
  const [newBudget, setNewBudget] = React.useState(0)
  const [isUpdatingBudget, setIsUpdatingBudget] = React.useState(false)

  // Initialize newBudget when campaign data loads
  React.useEffect(() => {
    if (campaign?.budgetTotal) {
      setNewBudget(campaign.budgetTotal)
    }
  }, [campaign])

  const handleToggleStatus = async () => {
    if (!campaign) return;
    const newStatus = campaign.status === 'live' ? 'paused' : 'live'
    setIsUpdatingStatus(true)
    try {
      await api.patch(`/brand/campaigns/${campaign._id || id}/status`, { status: newStatus })
      window.location.reload()
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleUpdateBudget = async () => {
    if (!campaign || newBudget <= campaign.budgetTotal) {
      alert("New budget must be greater than current budget")
      return
    }

    const calculatedMaxCreators = Math.floor(newBudget / campaign.rewardAmount)
    setIsUpdatingBudget(true)

    try {
      await api.patch(`/brand/campaigns/${campaign._id || id}`, {
        budgetTotal: newBudget,
        maxCreators: calculatedMaxCreators
      })
      alert("Campaign budget updated successfully")
      window.location.reload()
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setIsUpdatingBudget(false)
      setIsBudgetModalOpen(false)
    }
  }

  if (campaignLoading || subsLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    )
  }

  if (!campaign) {
    return <EmptyState title="Campaign not found" />
  }

  const overviewContent = (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-8 space-y-12">
        <div className="grid gap-6 sm:grid-cols-2">
          <StatWidget 
            title="Budget Remaining" 
            value={`$${(campaign.rewardAmount * (campaign.maxCreators - (campaign.stats?.joins || 0))).toLocaleString()}`} 
            icon={DollarSign} 
          />
          <StatWidget 
            title="Total Submissions" 
            value={campaignSubmissions.length} 
            icon={CheckCircle2} 
          />
          <StatWidget 
            title="Pending Review" 
            value={campaignSubmissions.filter(s => s.reviewStatus === 'pending').length} 
            icon={Clock} 
          />
          <StatWidget 
            title="Total Reach" 
            value={campaign.stats?.reach || "0"} 
            icon={Activity} 
          />
        </div>
        
        <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50">
          <CardHeader className="p-8 border-b border-zinc-50 dark:border-zinc-800/50">
            <CardTitle className="font-display text-xl font-bold">Campaign Brief</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">{campaign.fullDescription}</p>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-4 space-y-8">
        <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50">
          <CardContent className="p-8">
            <h3 className="mb-6 uppercase text-[10px] font-black tracking-[0.2em] text-zinc-500">
              Operational Actions
            </h3>
            <div className="grid gap-3">
              <Button className="w-full h-12 rounded-xl text-sm font-bold shadow-soft">Edit Brief</Button>
              <Button 
                onClick={() => setIsBudgetModalOpen(true)}
                variant="outline" 
                className="w-full h-12 rounded-xl text-sm font-bold border-zinc-200 dark:border-zinc-800"
              >
                Increase Budget
              </Button>
              <Button 
                onClick={handleToggleStatus} 
                disabled={isUpdatingStatus}
                variant="outline" 
                className={`w-full h-12 rounded-xl text-sm font-bold ${campaign.status === 'live' ? 'border-red-100 text-red-600 hover:bg-red-50 dark:border-red-900/20 dark:hover:bg-red-900/10 dark:text-red-400' : 'border-green-100 text-green-600 hover:bg-green-50 dark:border-green-900/20 dark:hover:bg-green-900/10 dark:text-green-400'}`}
              >
                {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : campaign.status === 'live' ? "Pause Campaign" : "Resume Campaign"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50">
          <CardContent className="p-8">
            <h3 className="mb-6 uppercase text-[10px] font-black tracking-[0.2em] text-zinc-500">
              Live Configuration
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</span>
                <Badge variant="primary" className="rounded-lg px-3 py-1 font-black">{campaign.status}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Deadline</span>
                <span className="text-sm font-black text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">{campaign.endAt ? new Date(campaign.endAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Participants</span>
                <span className="text-sm font-black text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">{campaign.stats?.joins || 0} / {campaign.maxCreators} Creators</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const submissionsContent = (
    <Card className="shadow-soft border-zinc-100 dark:border-zinc-800/50 overflow-hidden">
      <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-zinc-50 dark:border-zinc-800/50">
        <CardTitle className="font-display text-2xl font-bold">Content Submissions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-none">
              <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest">Creator</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest">Live Link</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest">Date</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
              <TableHead className="px-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaignSubmissions.map((sub) => (
              <TableRow key={sub._id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <TableCell className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <img src={sub.creatorId?.avatar || `https://ui-avatars.com/api/?name=${sub.creatorId?.firstName}`} alt="" className="h-8 w-8 rounded-full shadow-sm" />
                    <span className="font-bold text-zinc-950 dark:text-zinc-50">{sub.creatorId?.firstName} {sub.creatorId?.lastName}</span>
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  <a href={sub.contentUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-brand-600 hover:text-brand-500 transition-colors max-w-[240px] truncate block">
                    {sub.contentUrl}
                  </a>
                </TableCell>
                <TableCell className="py-5 text-sm font-bold text-zinc-500">{new Date(sub.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="py-5">
                  <Badge 
                    variant={sub.reviewStatus === "approved" ? "primary" : sub.reviewStatus === "rejected" ? "outline" : "outline"}
                    className="rounded-lg font-black capitalize"
                  >
                    {sub.reviewStatus}
                  </Badge>
                </TableCell>
                <TableCell className="px-8 py-5 text-right">
                  <Link to={`/brand/submissions/${sub._id}`}>
                    <Button variant="outline" size="sm" className="rounded-lg font-bold border-zinc-200 dark:border-zinc-800 px-4">Review</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {campaignSubmissions.length === 0 && (
          <div className="py-16 text-center">
            <EmptyState title="No submissions yet" description="Creators will start submitting content as soon as they're approved for your campaign." />
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6">
        <Link to="/brand">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm transition-transform active:scale-95">
            ←
          </Button>
        </Link>
        <PageHeader 
          title={campaign.title} 
          description={`Comprehensive dashboard for monitoring performance and reviewing content across your campaign.`}
          className="pb-0"
        />
      </div>

      <Tabs 
        tabs={[
          { id: "overview", label: "Analytics & Overview", content: overviewContent },
          { id: "submissions", label: "Incoming UGC", content: submissionsContent }
        ]} 
      />

      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title="Increase Campaign Budget"
        description="Expand your campaign's reach by adding more funds. This will automatically increase the maximum number of creators who can participate."
      >
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">New Total Budget ($)</label>
            <Input 
              type="number"
              min={campaign?.budgetTotal || 0}
              value={newBudget}
              onChange={(e) => setNewBudget(Number(e.target.value))}
              placeholder="Enter new total budget"
              className="h-12 rounded-xl font-bold"
            />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
              Current Budget: ${campaign?.budgetTotal?.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl bg-brand-50/50 dark:bg-brand-500/5 p-6 border border-brand-100 dark:border-brand-500/10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em]">New Participant Limit</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-zinc-950 dark:text-zinc-50">
                  {Math.floor(newBudget / (campaign?.rewardAmount || 1))}
                </span>
                <span className="text-sm font-bold text-zinc-500">Creators</span>
              </div>
              <p className="mt-2 text-xs font-medium text-zinc-500 leading-relaxed">
                Based on your fixed reward of <span className="font-bold text-zinc-950 dark:text-zinc-50">${campaign?.rewardAmount}</span> per creator.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-xl font-bold"
              onClick={() => setIsBudgetModalOpen(false)}
              disabled={isUpdatingBudget}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 h-12 rounded-xl font-bold shadow-soft"
              onClick={handleUpdateBudget}
              disabled={isUpdatingBudget || newBudget <= (campaign?.budgetTotal || 0)}
            >
              {isUpdatingBudget ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Confirm Increase"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
