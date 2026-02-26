---
title: "The AI Internet Outage We're Not Ready For"
description: "I think we are underestimating how close we are to a tipping-point outage where failure in core internet systems cascades far beyond one provider incident."
pubDate: '2026-02-26'
tags:
  - ai
  - internet
  - infrastructure
  - outage
  - resilience
category: tech
socialImage: "/img/posts/ai-internet-outage-hero.png"
socialImageAlt: "World map with connected internet nodes showing a cascading outage pattern"
socialImageWidth: 1536
socialImageHeight: 1024
---

# The AI Internet Outage We're Not Ready For

![World map with connected internet nodes showing a cascading outage pattern](/img/posts/ai-internet-outage-hero.png)

I’ve been around infrastructure my whole career in one way or another.

I started in IT support, but I have basically been near infrastructure my entire career. Even when I was doing full-stack work, I still had to deploy and operate the stuff we built. Which brings me to my current DevOps / Agentic Engineering season, dealing with every cloud there is. So title or no title, I have been dealing with infrastructure for years, and after that much time and too much coffee, I have earned some opinions from all my buffoonery.

Outages used to feel more contained.

One company had a bad day, their app went down, it hurt, but the rest of the internet mostly kept moving.

Now everything is stacked on everything.

Cloud on cloud, DNS on top of that, cert chains, auth providers, CDNs, APIs, and now AI systems constantly crawling, indexing, scraping, training, and querying. I’m not anti-AI. I’m using it constantly. I’m saying the load is real, the coupling is real, and the blast radius keeps getting bigger.

I think an outage is brewing, and when it lands it won’t look like a normal vendor incident.

## Why this feels different now

The old outage model was: one provider fails, route around it, recover.

I don’t think that model holds like it used to.

We say “redundancy,” but redundant to what exactly? Different logos can still mean the same failure modes underneath. Same DNS assumptions. Same cloud primitives. Same identity dependencies. Same handful of foundational providers carrying way too much of modern life.

And honestly, some failover stories are almost theater.

Like sure, technically we can fail over if a massive natural disaster wipes out half a region. But that is kind of my point. The fact that we would even need that level of failover says something by itself.

I’m not saying failover is bad. I’m saying sometimes the scenario is so extreme that celebrating uptime starts to feel disconnected from reality.

If we have to fail over half the country to different data centers, the last thing you're going to worry about is whether your calorie counting app can still process your macros.

Yes, uptime still matters, but what had to happen for us to get there?

AI stress is one side of this. The other is velocity. More AI-assisted infra changes means more chances for one vibe-coded mistake to hit a critical layer at the wrong time.

## The part I think people underestimate

What I think people underestimate is not that outages happen, but how close we might be to an outage size where it cannot stay contained anymore. So far, even big incidents have still been partial. One DNS provider goes down, not all DNS. One CA has issues, not every certificate authority at once. One CDN has a bad day, not all CDNs globally. That partial behavior is exactly why we keep limping through.

The part that keeps bugging me is the tipping point. There is a size where an outage stops being "just DNS" or "just certificates" and starts cascading through everything built on top of it. If one or two DNS providers fail, internet traffic reroutes and we complain on X (the everything app). If most of global DNS fails at the same time, that does not stay a DNS story. That turns into identity, routing, app dependency, and recovery problems all at once. At that scale, it cannot not cascade.

That is really my point. I think we underestimate how close we might be to that threshold, and we underestimate what a 24-hour global event at that threshold would actually do.

## If the internet fractures for 24 hours

People hear “internet outage” and think websites.

I think payments, comms, logistics, healthcare coordination, navigation, etc..

The hard part isn’t just technical downtime. It’s behavior under uncertainty.

We got a mild preview during early COVID. Not from a global internet outage, just from disruption and uncertainty. That alone was enough to trigger panic behavior, supply shocks, and breakdowns in normal routines.

We didn’t lose the internet, but somehow we had a toilet paper outage.

That might still be the dumbest and most accurate stress test of modern society I’ve ever seen.

So if partial disruption produced that kind of response, what does 24+ hours of serious internet instability look like?

Could some systems stay up? Absolutely. Air-gapped and truly local environments with their own DNS, PKI, time, and local services can survive longer.

Most people and orgs don’t live there.

Most are hybrid by default, which means they seem local until one remote dependency is needed, then everything pauses at once.

## Why I’m writing this

I’m writing this because I think the conversation is overdue.

Not because I have some perfect model. Not because I’m trying to farm fear. Just because from where I sit, the trajectory is obvious: dependency concentration is rising, AI-era traffic pressure is rising, and correlated failure risk is rising with both.

If a large cross-domain outage happens, even with fast recovery, I doubt it will be a one-time event.

I’d rather throw this idea out now, imperfectly, and get people thinking (which I rarely do btw, but it happens)

I’m just one dufus on the internet, but if this gets engineers, leaders, and normal people to pressure-test assumptions before reality does it for us, that’s worth publishing.
