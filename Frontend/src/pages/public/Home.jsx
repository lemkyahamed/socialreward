import React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Star, ShieldCheck, Zap, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "../../components/ui/Button"
import { CampaignCard } from "../../components/shared/CampaignCard"
import { useApi } from "../../hooks/useApi"
import { Card } from "../../components/ui/Card"

export function Home() {
  const { data, loading, error } = useApi('/public/campaigns');
  const featuredCampaigns = data?.campaigns?.slice(0, 3) || [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-950 px-4 py-32 sm:px-6 lg:px-8">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-zinc-950 to-zinc-950"></div>
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-600/20 blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]"></div>
        
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-400 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 mr-2 animate-pulse"></span>
            The #1 Marketplace for Paid UGC
          </div>
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl">
            Get Paid to Post as a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-orange-600">Creator</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg tracking-wide text-zinc-400 sm:text-xl font-medium leading-relaxed">
            Join thousands of creators earning money by producing authentic content for the world's leading brands. No massive following required.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto px-10 shadow-lg shadow-brand-600/20">
                Start Earning Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/campaigns">
              <Button size="lg" variant="outline" className="w-full border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white sm:w-auto px-10">
                Explore Campaigns
              </Button>
            </Link>
          </div>
          
          <div className="mt-24 border-t border-zinc-800/50 pt-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-8">Trusted by innovative brands worldwide</p>
            <div className="flex flex-wrap justify-center gap-10 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 sm:gap-16 lg:gap-20">
              <div className="text-2xl font-black tracking-tighter text-white font-display">TECHCORP</div>
              <div className="text-2xl font-black tracking-tighter text-white font-display">OceanSpray</div>
              <div className="text-2xl font-black tracking-tighter text-white font-display">FITTRACK</div>
              <div className="text-2xl font-black tracking-tighter text-white font-display">NEXUS</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-24 dark:bg-zinc-950 sm:py-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
              Get Paid in 3 Simple Steps
            </h2>
            <p className="mt-6 text-xl text-zinc-500 dark:text-zinc-400 font-medium">
              Stop waiting for sponsorships. Choose the brands you love and start creating.
            </p>
          </div>

          <div className="mt-20 grid gap-8 sm:grid-cols-3">
            {[
              { title: "1. Discover", desc: "Browse hundreds of active campaigns from top brands.", icon: Zap },
              { title: "2. Create", desc: "Follow the guidelines and submit your best content.", icon: Star },
              { title: "3. Get Paid", desc: "Get approved and receive fast payouts directly to your bank.", icon: TrendingUp }
            ].map((step, i) => (
              <Card key={i} className="p-10 text-center flex flex-col items-center group">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-10 w-10" />
                </div>
                <h3 className="mt-8 font-display text-2xl font-bold text-zinc-950 dark:text-zinc-50">{step.title}</h3>
                <p className="mt-3 text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="bg-zinc-50 py-24 dark:bg-zinc-900 sm:py-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
                Featured Campaigns
              </h2>
              <p className="mt-6 text-xl text-zinc-500 dark:text-zinc-400 font-medium">
                High-paying opportunities available right now for talented creators.
              </p>
            </div>
            <Link to="/campaigns" className="shrink-0">
              <Button variant="outline" size="lg">View All Campaigns</Button>
            </Link>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              </div>
            ) : error ? (
              <div className="col-span-full text-center text-red-500 py-12">{error}</div>
            ) : featuredCampaigns.length === 0 ? (
              <div className="col-span-full text-center text-zinc-500 py-12">No campaigns found.</div>
            ) : (
              featuredCampaigns.map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="bg-brand-600 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Protection features you can trust
            </h2>
            <p className="mt-8 text-xl leading-relaxed text-brand-50 font-medium">
              We handle the contracts, escrows, and disputes so you can focus on what you do best: creating content that converts.
            </p>
          </div>
          <div className="mx-auto mt-20 max-w-2xl sm:mt-24 lg:mt-32 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                { title: "Guaranteed Payouts", desc: "Brands pre-fund campaigns, ensuring you get paid on time, every time upon approval." },
                { title: "Clear Requirements", desc: "No more endless revisions. Complete the stated requirements and get approved automatically." },
                { title: "24/7 Support", desc: "Our creator success team is always online to help you with any campaign issues." }
              ].map((feature) => (
                <div key={feature.title} className="flex flex-col">
                  <dt className="flex items-center gap-x-4 font-display text-xl font-bold leading-7 text-white">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                      <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-6 flex flex-auto flex-col text-lg leading-relaxed text-brand-50 font-medium">
                    <p className="flex-auto opacity-90">{feature.desc}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </div>
  )
}
