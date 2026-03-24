import React from "react"
import { useParams, Link } from "react-router-dom"
import { Users, DollarSign, Activity, CheckCircle2, Clock } from "lucide-react"
import { PageHeader } from "../../components/shared/PageHeader"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Tabs } from "../../components/ui/Tabs"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table"
import { StatWidget } from "../../components/ui/StatWidget"
import { mockCampaigns, mockSubmissions } from "../../data/mockData"
import { EmptyState } from "../../components/ui/EmptyState"

export function ManageCampaign() {
  const { id } = useParams()
  const campaign = mockCampaigns.find(c => c.id === id) || mockCampaigns[0]
  const campaignSubmissions = mockSubmissions.filter(s => s.campaignId === campaign?.id)

  if (!campaign) {
    return <EmptyState title="Campaign not found" />
  }

  const overviewContent = (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-8 space-y-12">
        <div className="grid gap-6 sm:grid-cols-2">
          <StatWidget 
            title="Budget Remaining" 
            value={`$${campaign.budgetTotal - campaign.budgetUsed}`} 
            icon={DollarSign} 
          />
          <StatWidget 
            title="Total Submissions" 
            value={campaignSubmissions.length} 
            icon={CheckCircle2} 
          />
          <StatWidget 
            title="Pending Review" 
            value={campaignSubmissions.filter(s => s.status === 'pending').length} 
            icon={Clock} 
          />
          <StatWidget 
            title="Total Reach" 
            value="342K" 
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
              <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-bold border-zinc-200 dark:border-zinc-800">Increase Budget</Button>
              <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-bold border-red-100 text-red-600 hover:bg-red-50 dark:border-red-900/20 dark:hover:bg-red-900/10 dark:text-red-400">Pause Campaign</Button>
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
                <span className="text-sm font-black text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">{campaign.deadline}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Participants</span>
                <span className="text-sm font-black text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">{campaign.participantsCount} Creators</span>
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
              <TableRow key={sub.id} className="border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <TableCell className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <img src={sub.creatorAvatar} alt="" className="h-8 w-8 rounded-full shadow-sm" />
                    <span className="font-bold text-zinc-950 dark:text-zinc-50">{sub.creatorName}</span>
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  <a href={sub.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-brand-600 hover:text-brand-500 transition-colors max-w-[240px] truncate block">
                    {sub.url}
                  </a>
                </TableCell>
                <TableCell className="py-5 text-sm font-bold text-zinc-500">{new Date(sub.submittedAt).toLocaleDateString()}</TableCell>
                <TableCell className="py-5">
                  <Badge 
                    variant={sub.status === "approved" ? "primary" : sub.status === "rejected" ? "outline" : "outline"}
                    className="rounded-lg font-black"
                  >
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-8 py-5 text-right">
                  <Link to={`/brand/submissions/${sub.id}`}>
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
    </div>
  )
}
