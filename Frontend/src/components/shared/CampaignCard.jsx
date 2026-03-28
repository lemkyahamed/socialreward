import React from "react"
import { Link } from "react-router-dom"
import { Users, DollarSign, Calendar } from "lucide-react"
import { Card, CardContent, CardFooter } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { cn } from "../../utils"

export function CampaignCard({ campaign, role = "public", className }) {
  // role could be 'public', 'creator' (shows 'joined' badge), or 'brand'
  const isJoined = role === "creator" && (campaign.hasJoined || campaign.joinStatus === 'joined');

  return (
    <Card hoverable className={cn("flex h-full flex-col overflow-hidden", className)}>
      {/* Cover Image Placeholder */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        <img 
          src={campaign.coverImage || campaign.bannerUrl || `https://ui-avatars.com/api/?name=${campaign.title || 'C'}&background=random&size=400`} 
          alt={campaign.title || "Campaign"}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {isJoined && (
          <div className="absolute right-4 top-4">
            <Badge variant="success" className="shadow-lg backdrop-blur-md bg-green-500/90 border-none text-white">Joined</Badge>
          </div>
        )}
        <div className="absolute bottom-4 left-4">
          <Badge variant="default" className="bg-zinc-950/80 text-white backdrop-blur-md border-none px-3 py-1">
            {campaign.platform || "Multi-platform"}
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-600 dark:text-brand-400">
              {campaign.brandName || campaign.brand?.companyName || "Brand"}
            </span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500" />
              <span>{campaign.rewardAmount ? campaign.rewardAmount.toLocaleString() : campaign.rewardAmt}</span>
            </div>
          </div>
          <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug text-zinc-950 dark:text-zinc-50">
            {campaign.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {campaign.shortDescription}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 opacity-70" />
            <span>{campaign.stats?.joins || campaign.participantsCount || 0} participants</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 opacity-70" />
            <span>Due {campaign.endAt ? new Date(campaign.endAt).toLocaleDateString() : campaign.deadline}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6">
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
          <Button variant={isJoined ? "outline" : "primary"} className="w-full">
            {role === "brand" ? "Manage Campaign" : isJoined ? "View Submission" : "View Details"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
