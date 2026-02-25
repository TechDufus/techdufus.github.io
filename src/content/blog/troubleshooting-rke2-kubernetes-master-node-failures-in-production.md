---
title: Troubleshooting RKE2 Kubernetes Master Node Failures in Production
description: >-
  Well, maybe I didn't break it, but it sure felt like it when I saw that "Not
  Ready" status on one of the master nodes at 2 AM.
pubDate: '2025-06-06'
tags:
  - blog
  - kubernetes
  - rke2
  - troubleshooting
  - devops
category: tech
---
# So I broke a Kubernetes master node in production once (or twice).

Well, maybe I didn't break it, but it sure felt like it when I saw that "Not Ready" status on one of the master nodes at 2 AM.

I've had some experience with RKE2 clusters over the years, and I've learned all sorts of ways they can fail on you. After stumbling through a few of these incidents (and probably making some mistakes along the way), I figured I'd document what I learned. Maybe it'll help someone else who finds themselves staring at a broken cluster at an ungodly hour.

## What I Was Dealing With

So here's what happened during one of these incidents: I was checking on the cluster and saw one of the master nodes showing "Not Ready" in `kubectl get nodes`. Not great, but not panic-time yet since there were multiple masters. But then I started noticing:

- kube-apiserver pods weren't starting up
- Logs were full of "Awaiting connection" messages
- Some services were starting to become unreachable

Yeah, this was becoming a problem.

## What I Learned to Check

I'm definitely not a Kubernetes expert, but here's what I figured out to try when things go sideways. Maybe there are better ways to do this, but this is what worked for me:

### First: Make Sure You Can Actually See What's Going On

I learned this the hard way - you need to make sure you can actually interact with the cluster components:

```bash
# Load kubectl and crictl configurations
export KUBECONFIG=/etc/rancher/rke2/rke2.yaml
export CRI_CONFIG_FILE=/var/lib/rancher/rke2/agent/etc/crictl.yaml
PATH="$PATH:/var/lib/rancher/rke2/bin"
```

### Check if Certificates Are Messed Up

I don't pretend to understand all the certificate stuff in Kubernetes, but I've learned these commands can save you some time:

```bash
# First, see if the certificate files exist
ls -la /var/lib/rancher/rke2/server/tls/kube-controller-manager/kube-controller-manager*

# Actually check certificate expiration dates
openssl x509 -in /var/lib/rancher/rke2/server/tls/kube-controller-manager/kube-controller-manager.crt -text -noout | grep -A2 "Validity"

# Or for a quick check of just the expiration date
openssl x509 -in /var/lib/rancher/rke2/server/tls/kube-controller-manager/kube-controller-manager.crt -enddate -noout
```

### Start Digging Through Logs

This is where I usually spend most of my time trying to figure out what went wrong:

```bash
# Monitor RKE2 service in real-time
journalctl -r -u rke2-server.service

# Check the current status
systemctl status rke2-server.service
```

### Check What Containers Are Actually Running

Sometimes the problem is obvious once you look:

```bash
# List all containers (running and stopped)
crictl ps -a

# If kube-apiserver isn't running, check pod logs
cat /var/log/pods/kube-system_kube-apiserver-<node-name>_*/kube-apiserver/*.log
```

## The Thing That Got Me Every Time: Port Conflicts

I ran into this more times than I'd like to admit. Here's what I usually saw in the logs when this happened:

```
E0821 20:12:50.538566 1 run.go:74] "command failed" err="failed to create listener: failed to listen on 0.0.0.0:6443: bind: address already in use"
```

Basically, something is already using port 6443 (that's the Kubernetes API server port), so the kube-apiserver can't start. In my case, it was usually a Splunk OTEL forwarder that had bounced but didn't properly release the port. The forwarder would try to come back up, but the port was still tied up from the previous instance, creating this annoying cycle where nothing could bind to the port properly.

You can check what's actually using a port with:
```bash
# See what's using port 6443
netstat -tulpn | grep 6443
# Or use ss (more modern)
ss -tulpn | grep 6443
```

## What I Learned to Try When Things Were Broken

So here's what I figured out to try, usually in this order:

### First: The "Maybe It'll Just Work" Restart

I always started with the obvious thing:

```bash
# Try a simple service restart
systemctl restart rke2-server.service

# Watch the logs to see what happens
journalctl -f -u rke2-server.service
```

Sometimes it just worked. Most of the time it didn't, but hey, might as well try.

### Next: The "Kill Everything" Approach

When the gentle restart failed (which was more often than I'd like), I pulled out the big guns:

```bash
# Kill all RKE2 processes
/usr/local/bin/rke2-killall.sh

# Give it a moment to clean up
sleep 10

# Try starting again
systemctl restart rke2-server.service
```

### Last Resort: Drain and Reboot

When nothing else works, sometimes you just have to accept defeat and reboot:

```bash
# From a working master node, drain the problematic node
kubectl drain <problematic-node> --ignore-daemonsets --grace-period 30 --delete-emptydir-data

# SSH to the problematic node and reboot
sudo reboot
```

I learned about that `--delete-emptydir-data` flag the hard way. Without it, you'll get errors about pods with local storage that can't be evicted. Not sure why that's not the default, but whatever.

## Bonus: When the Whole System Goes Weird

Sometimes I found that the master node issues were actually because the whole system was freaking out. Like, really high load averages and commands just hanging forever.

I saw things like:
- Load average hitting 50+ on a 4-core system (yeah, that's not good)
- `ps` commands just hanging and never returning
- Monitoring systems showing big gaps where they can't collect data
- The whole system becoming basically unusable

### What I Learned to Try:

A coworker showed me this trick:

```bash
# Use strace to see what's actually hung
strace ps -ef

# This usually shows you a specific PID that's causing problems
# Once you find it, just kill it
kill -9 <hung_pid>
```

I have no idea why this works, but killing that hung process usually brought the load average back to normal immediately. Sometimes the simple solutions are the best ones.

## What I Learned About Prevention

I'm still learning how to prevent these issues, but here's what I started doing back then:

### Basic Monitoring
I tried to set up alerts for:
- When nodes change status
- When load average gets crazy high (I used 2x the CPU count as a rough guideline)
- When the kube-apiserver pods restart
- Certificate expiration dates (because apparently that's a thing)

### Simple Health Checks
I wrote a basic script to check on things:

```bash
#!/bin/bash
kubectl get nodes
kubectl get pods -n kube-system | grep api-server
systemctl status rke2-server.service
```

Nothing fancy, but it gives me a quick way to see if things are working.

### Certificate Stuff
RKE2 is supposed to handle certificate rotation automatically, but I've learned to keep an eye on expiration dates anyway. Better safe than sorry.

## When You Need to Call for Help

Sometimes things get so broken that you need to involve support. I've learned that having good logs makes this process way less painful. For RKE2 clusters, there's an official log collector:

```bash
# Download and run the Rancher log collector
curl -Ls rnch.io/rancher2_logs | sudo bash

# Or if you want to specify where the logs go
curl -OLs https://raw.githubusercontent.com/rancherlabs/support-tools/master/collection/rancher/v2.x/logs-collector/rancher2_logs_collector.sh
/var/log/rancher2_logs_collector.sh -d /var/log/rancher2_logs
```

This collects way more information than I could ever figure out on my own, which is helpful when you're talking to people who actually know what they're doing.

## What I've Learned So Far

Look, I'm still figuring out a lot of this Kubernetes stuff, but here's what I think I know:

1. Don't panic (easier said than done at 2 AM)
2. Start with the simple stuff first - restart services, check obvious things
3. The "kill everything" approach works more often than it probably should
4. Document what you did, because you'll probably forget and have to deal with this again

Most importantly, write stuff down! I can't tell you how many times I've run into the same problem and had to Google the same solution because I didn't document it the first time.

RKE2 seems pretty solid overall, but like any complex system, it has its quirks. The more I work with it, the more I learn about all the ways it can break (and hopefully how to fix them).

Anyway, that's what I've learned so far. If you've dealt with similar issues, I'd love to hear what worked (or didn't work) for you. I'm always looking to learn better ways to handle this stuff.

Until next time, here's hoping your clusters stay healthy and your pager stays quiet!


