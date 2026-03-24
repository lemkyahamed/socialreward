import React from "react"
import { Button } from "../../components/ui/Button"
import { PageHeader } from "../../components/shared/PageHeader"

export function FAQ() {
  const faqs = [
    {
      q: "How do I get paid?",
      a: "Payments are processed securely via Stripe. Once a brand approves your submission, the funds are released from escrow and sent directly to your connected bank account within 2-3 business days."
    },
    {
      q: "Do I need a massive following?",
      a: "Not necessarily. While some campaigns have minimum follower requirements, many brands are looking for high-quality UGC (User Generated Content) that they can run as ads, where your follower count doesn't matter."
    },
    {
      q: "What happens if a brand rejects my content?",
      a: "Brands can request revisions if your content didn't follow the original brief. If you believe a rejection was unfair and you met all requirements, our moderation team will review the dispute."
    }
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl mb-6">
          Frequently <span className="text-brand-600">Asked</span> Questions
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-zinc-500 font-medium leading-relaxed dark:text-zinc-400">
          Everything you need to know about Social Reward. Can't find an answer? Contact our creator success team.
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className="group rounded-[2rem] border border-zinc-100 bg-white p-8 dark:border-zinc-800/50 dark:bg-zinc-900/50 shadow-soft transition-all hover:shadow-premium hover:-translate-y-1">
            <h3 className="font-display text-2xl font-bold text-zinc-950 dark:text-zinc-50 mb-4">{faq.q}</h3>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 p-10 rounded-3xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-center">
        <h3 className="font-display text-2xl font-bold text-brand-900 dark:text-brand-400 mb-4">Still have questions?</h3>
        <p className="text-brand-700 dark:text-brand-300 font-medium mb-8">We're here to help you succeed on your creator journey.</p>
        <Button className="h-14 px-10 rounded-2xl text-lg font-bold shadow-lg shadow-brand-600/20">Contact Support</Button>
      </div>
    </div>
  )
}
