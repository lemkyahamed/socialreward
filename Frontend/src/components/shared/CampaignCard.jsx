import React from "react"
import { Link } from "react-router-dom"
import { Users, DollarSign, Calendar, ShieldCheck, Tag, TrendingUp } from "lucide-react"
import { Card, CardContent, CardFooter } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { cn } from "../../utils"

export function CampaignCard({ campaign, role = "public", className }) {
  // role could be 'public', 'creator' (shows 'joined' badge), or 'brand'
  const isJoined = role === "creator" && (campaign.hasJoined || campaign.joinStatus === 'joined');
  const rewardType = campaign.rewardType || "fixed";
  const category = campaign.niche || campaign.category || "General";
  const trustRequirement = campaign.trustRequirement || 0;

  const rewardLabelMap = {
    'fixed': 'Fixed Return',
    'per_post': 'Per Post',
    'per_1000_views': 'Per CPM (1k views)',
    'per_engagement': 'Per Engagement'
  }

  return (
    <Card hoverable className={cn("group flex h-full flex-col overflow-hidden shadow-soft hover:shadow-premium transition-all duration-300", className)}>
      {/* Cover Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        <img 
          src={campaign.coverImage || campaign.bannerUrl || `https://ui-avatars.com/api/?name=${campaign.title || 'C'}&background=random&size=400`} 
          alt={campaign.title || "Campaign"}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Status/Joined Overlays */}
        <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
          {isJoined && (
            <Badge variant="success" className="shadow-lg backdrop-blur-md bg-green-500/90 border-none text-white font-bold tracking-widest text-[10px] uppercase">
              Joined Active
            </Badge>
          )}
          {campaign.status === 'live' && !isJoined && (
            <Badge variant="default" className="shadow-md backdrop-blur-md bg-white/90 text-brand-600 border-none font-bold tracking-widest text-[10px] uppercase dark:bg-zinc-950/90 dark:text-brand-400">
              Accepting Pitches
            </Badge>
          )}
        </div>
        
        {/* Platform & Category */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Badge variant="default" className="bg-zinc-950/80 text-white backdrop-blur-md border border-zinc-800/50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest">
            {campaign.platform || "Any Platform"}
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col justify-between p-6">
        <div>
          {/* Brand & Estimated Payout */}
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-600 dark:text-brand-400">
                {campaign.brandName || campaign.brand?.companyName || "Brand"}
              </span>
              <h3 className="line-clamp-2 font-display text-xl font-bold leading-snug text-zinc-950 dark:text-zinc-50 mt-1">
                {campaign.title}
              </h3>
            </div>
            
            <div className="flex flex-col items-end text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Payout</span>
              <div className="flex items-center gap-0.5 text-lg font-black text-green-600 dark:text-green-400">
                <DollarSign className="h-5 w-5" />
                <span>{campaign.rewardAmount ? campaign.rewardAmount.toLocaleString() : "TBD"}</span>
              </div>
            </div>
          </div>
          
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
            {campaign.shortDescription || campaign.description?.substring(0, 100) + '...'}
          </p>
        </div>

        {/* Opportunity Metrics Matrix */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 text-xs font-bold">
            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <TrendingUp className="h-4 w-4 text-brand-500" />
              <span className="truncate">{rewardLabelMap[rewardType] || rewardType.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <Tag className="h-4 w-4 text-orange-500" />
              <span className="truncate capitalize">{category}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <span>Trust: {trustRequirement}+</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <Calendar className="h-4 w-4 text-rose-500" />
              <span className="truncate">Due {campaign.endAt ? new Date(campaign.endAt).toLocaleDateString() : 'Rolling'}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 border-t border-zinc-50 dark:border-zinc-800/50">
        <Link 
          to={
            role === "brand" 
              ? `/brand/campaigns/${campaign._id || campaign.id}` 
              : role === "creator"
                ? `/creator/campaigns/${campaign._id || campaign.id}`
                : `/campaigns/${campaign.slug || campaign._id || campaign.id}`
          } 
          className="w-full"
        >
          <Button variant={isJoined ? "outline" : "primary"} className="w-full h-12 text-sm tracking-wide shadow-soft group">
            {role === "brand" ? "Manage Campaign" : isJoined ? "View Active Submission" : "View Opportunity"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
