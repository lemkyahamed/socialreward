export const mockCampaigns = [
  {
    id: "1",
    title: "Summer Vibes TikTok Challenge",
    brandName: "OceanSpray",
    rewardAmt: "$500",
    platform: "TikTok",
    deadline: "Oct 15, 2026",
    participantsCount: 142,
    shortDescription: "Create a refreshing 15s TikTok enjoying our new summer flavor. Must feature the bottle prominently and use trending audio.",
    fullDescription: "OceanSpray is launching a new tropical flavor, and we want YOUR creativity! Create a viral TikTok showing how refreshing our drink is during a hot summer day. Must include a clear shot of the label and the hashtag #OceanSpraySummer.",
    requirements: [
      "Minimum 10k followers on TikTok",
      "Video must be 15-30 seconds long",
      "Product must be shown for at least 3 seconds",
      "Use #OceanSpraySummer in the caption"
    ],
    status: "active",
    coverImage: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&auto=format&fit=crop&q=60",
    hasJoined: true, // For creator view testing
    budgetUsed: 4500,
    budgetTotal: 10000,
    submissionRate: 85
  },
  {
    id: "2",
    title: "Tech Setup Desk Tour",
    brandName: "ErgoDesk",
    rewardAmt: "$1,200",
    platform: "YouTube",
    deadline: "Nov 01, 2026",
    participantsCount: 56,
    shortDescription: "Full desk setup tour featuring the new Ergo Pro standing desk. Highlight the cable management and memory presets.",
    fullDescription: "Show off the ultimate productivity setup. We're looking for high-quality, cinematic desk tours on YouTube featuring the Ergo Pro. Talk about how the standing functionality improves your daily workflow.",
    requirements: [
      "Tech/Productivity niche channel",
      "Dedicated 2-3 minute segment",
      "Links provided in description",
      "Cinematic b-roll required"
    ],
    status: "active",
    coverImage: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop&q=60",
    hasJoined: false,
    budgetUsed: 12000,
    budgetTotal: 30000,
    submissionRate: 42
  },
  {
    id: "3",
    title: "Fitness App Review Reel",
    brandName: "FitTrack",
    rewardAmt: "$250",
    platform: "Instagram",
    deadline: "Sep 30, 2026",
    participantsCount: 320,
    shortDescription: "Quick Instagram Reel showing how you use our app to track your daily macros and workouts.",
    fullDescription: "We need authentic reviews of the latest FitTrack update. Show a typical day of eating and workouts, and smoothly transition into how the app keeps you accountable.",
    requirements: [
      "Fitness/Lifestyle niche",
      "Screen recording of app usage",
      "Tag @FitTrackOfficial",
      "Upbeat, engaging pacing"
    ],
    status: "completed",
    coverImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60",
    hasJoined: true,
    budgetUsed: 8000,
    budgetTotal: 8000,
    submissionRate: 100
  },
  {
    id: "4",
    title: "Gaming Headset Unboxing",
    brandName: "AstroGaming",
    rewardAmt: "$800",
    platform: "Twitch / YouTube",
    deadline: "Dec 10, 2026",
    participantsCount: 89,
    shortDescription: "Unbox the new A50 X headset live on stream, followed by an honest review video.",
    fullDescription: "Looking for energetic gamers to showcase our newest wireless headset. Do an unboxing either live or in a dedicated video, highlighting the spatial audio and comfort.",
    requirements: [
      "Minimum 500 average viewers on Twitch",
      "High quality mic setup for voice comparison",
      "Must show product design clearly"
    ],
    status: "active",
    coverImage: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&auto=format&fit=crop&q=60",
    hasJoined: false,
    budgetUsed: 7200,
    budgetTotal: 15000,
    submissionRate: 60
  }
]

export const mockSubmissions = [
  {
    id: "sub_1",
    campaignId: "1",
    campaignTitle: "Summer Vibes TikTok Challenge",
    creatorName: "Alex Rivers",
    creatorAvatar: "https://ui-avatars.com/api/?name=Alex+Rivers",
    url: "https://tiktok.com/@alexr/video/1234567",
    status: "approved", // approved, pending, rejected
    submittedAt: "2026-10-01T14:32:00Z",
    rewardAmt: "$500",
    feedback: "Great energy and perfect product placement!",
    views: "124K",
    engagement: "5.2%",
    riskScore: "Low"
  },
  {
    id: "sub_2",
    campaignId: "2",
    campaignTitle: "Tech Setup Desk Tour",
    creatorName: "Sarah Tech",
    creatorAvatar: "https://ui-avatars.com/api/?name=Sarah+Tech",
    url: "https://youtube.com/watch?v=tech123",
    status: "pending",
    submittedAt: "2026-10-12T09:15:00Z",
    rewardAmt: "$1,200",
    feedback: "",
    views: "-",
    engagement: "-",
    riskScore: "Medium"
  },
  {
    id: "sub_3",
    campaignId: "3",
    campaignTitle: "Fitness App Review Reel",
    creatorName: "Mike Fit",
    creatorAvatar: "https://ui-avatars.com/api/?name=Mike+Fit",
    url: "https://instagram.com/p/fit456",
    status: "rejected",
    submittedAt: "2026-09-28T16:45:00Z",
    rewardAmt: "$250",
    feedback: "Video was too blurry and didn't tag the brand account.",
    views: "1.2K",
    engagement: "1.1%",
    riskScore: "High"
  }
]

export const mockUsers = [
  {
    id: "usr_1",
    name: "Alex Rivers",
    email: "alex@example.com",
    role: "creator",
    status: "active",
    joinedAt: "2025-03-10"
  },
  {
    id: "usr_2",
    name: "OceanSpray Marketing",
    email: "marketing@oceanspray.com",
    role: "brand",
    status: "active",
    joinedAt: "2024-11-22"
  },
  {
    id: "usr_3",
    name: "Admin Super",
    email: "admin@socialrewards.com",
    role: "admin",
    status: "active",
    joinedAt: "2024-01-01"
  },
  {
    id: "usr_4",
    name: "Suspicious Bot",
    email: "bot1234@spam.com",
    role: "creator",
    status: "suspended",
    joinedAt: "2026-10-10"
  }
]

export const mockSystemLogs = [
  {
    id: "log_1",
    jobName: "Sync TikTok API Stats",
    type: "CRON",
    status: "Success",
    timestamp: "2026-10-14T02:00:00Z",
    result: "Processed 1250 videos."
  },
  {
    id: "log_2",
    jobName: "Process Payouts Batch #92",
    type: "WORKER",
    status: "Failed",
    timestamp: "2026-10-13T18:30:00Z",
    result: "Stripe API timeout on #usr_129."
  },
  {
    id: "log_3",
    jobName: "Fraud Detection Scan",
    type: "AI_JOB",
    status: "Success",
    timestamp: "2026-10-13T12:00:00Z",
    result: "Flagged 4 submissions."
  }
]

export const mockCreatorStats = {
  activeCampaigns: 3,
  pendingApprovals: 1,
  totalEarnings: "$4,250",
  reachLimit: "1.2M",
  recentEarnings: [
    { month: "May", amount: 400 },
    { month: "Jun", amount: 800 },
    { month: "Jul", amount: 1200 },
    { month: "Aug", amount: 950 },
    { month: "Sep", amount: 1500 },
    { month: "Oct", amount: 2400 },
  ]
}

export const mockBrandStats = {
  activeCampaigns: 4,
  submissionsPending: 12,
  totalSpend: "$24,500",
  avgApprovalRate: "82%",
  spendHistory: [
    { month: "May", spend: 2000 },
    { month: "Jun", spend: 3500 },
    { month: "Jul", spend: 5000 },
    { month: "Aug", spend: 4200 },
    { month: "Sep", spend: 8500 },
    { month: "Oct", spend: 6500 },
  ]
}

export const mockAdminStats = {
  totalUsers: "12,450",
  liveCampaigns: 342,
  suspiciousItems: 18,
  failedJobs: 2,
  userGrowth: [
    { month: "May", users: 8000 },
    { month: "Jun", users: 9500 },
    { month: "Jul", users: 10200 },
    { month: "Aug", users: 11000 },
    { month: "Sep", users: 11800 },
    { month: "Oct", users: 12450 },
  ]
}
