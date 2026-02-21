---
created: 2026-02-18
layout: post
section-type: post
title: "I Deleted My Cloudflare Tunnels: Tailscale Operator for Homelab K8s"
category: kubernetes
tags: [tailscale, kubernetes, homelab, networking, k3s, blog]
summary: "I replaced Cloudflare Tunnels with the Tailscale Kubernetes Operator and went from dashboard-heavy setup to GitOps-native service exposure."
---

# I Deleted My Cloudflare Tunnels: Tailscale Operator for Homelab K8s

I am a tinkerer, not a full-time access policy manager.

Every new app in my homelab meant another Cloudflare Tunnel, another route, another Access policy, and more dashboard clicks. I want everything automated, and yes, I’m lazy, so this is a win-win.

Then I switched to the Tailscale Kubernetes Operator, and everything got delightfully lazy: write YAML, push to git, done.

## What the Operator Actually Does

The [Tailscale Operator](https://tailscale.com/kb/1236/kubernetes-operator) runs inside your cluster and watches for Services/Ingress resources that should be exposed on your tailnet. When it sees one, it automatically handles the machine registration and DNS. No tunnel configs. No route tables. No dashboard clicking.

Here's what exposing a service looks like with the operator installed:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: immich-tailscale
  namespace: immich
  annotations:
    tailscale.com/hostname: "immich"
spec:
  type: LoadBalancer
  loadBalancerClass: tailscale
  ports:
    - port: 80
      targetPort: 2283
      protocol: TCP
      name: http
  selector:
    app.kubernetes.io/name: server
    app.kubernetes.io/instance: immich
```

That's it. A standard Kubernetes Service with `loadBalancerClass: tailscale` and a hostname annotation. The operator picks it up, registers a machine on your tailnet, and within seconds you can hit `immich` from any device on your tailnet. No ingress controller. No certificate management. No DNS records to configure.

Compare that to the Cloudflare approach: create a tunnel, configure routes, set up Access policies, wire up GitHub OAuth, filter by email, deploy the connector, and hope you did not miss a checkbox. Repeat for every service.

## The Flexibility That Sold Me

The real power is the spectrum between fully private and fully public.

Most of my services (Immich, ArgoCD, my dashboard) are private to my tailnet. Only devices on my Tailscale network can reach them. If I want to restrict further, I can use Tailscale ACLs to control access per user, not per IP or per OAuth filter. User-based access control on a homelab is something Cloudflare never gave me without significant effort.

But sometimes you want something public. Mattermost, for example, needs to be reachable from the internet. The operator handles that too with Tailscale Funnel:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mattermost-ingress
  namespace: mattermost
  annotations:
    tailscale.com/funnel: "true"
spec:
  ingressClassName: tailscale
  defaultBackend:
    service:
      name: mattermost
      port:
        number: 8065
  tls:
    - hosts:
        - mattermost
```

One annotation: `tailscale.com/funnel: "true"`. That service is now publicly accessible through Tailscale's infrastructure, with TLS handled automatically. Everything else stays private. This is the exact flexibility I wanted: public when I need it, private by default.

## Setting It Up with ArgoCD

I deploy everything through ArgoCD (GitOps or go home), so the operator is just another Helm chart in my app-of-apps pattern:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: tailscale-operator
  namespace: argocd
spec:
  project: default
  sources:
    - chart: tailscale-operator
      repoURL: https://pkgs.tailscale.com/helmcharts
      targetRevision: "*"
      helm:
        releaseName: tailscale-operator
        valueFiles:
          - $values/kubernetes/argocd/values/tailscale-operator.yaml
    - repoURL: https://github.com/TechDufus/home.io
      targetRevision: main
      ref: values
  destination:
    server: https://kubernetes.default.svc
    namespace: tailscale
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

The values file is minimal:

```yaml
oauth:
  clientId: ""
  clientSecret: ""
```

You create an OAuth client in the Tailscale admin console, plug in the credentials (I manage mine through sealed secrets), and the operator handles the rest.

## What to Know Before You Start

- You need a Tailscale tailnet with admin access to create OAuth clients.
- Funnel requires enabling Funnel on your tailnet first.
- Start private first (`LoadBalancer` + `loadBalancerClass: tailscale`), then selectively expose public endpoints.

## The One Gotcha: OAuth Scoping

This was the hardest part of the whole setup, and it wasn't even a technical problem. It was a permissions problem.

When you create the OAuth client for the operator, you have to define what scopes it gets. Tailscale gives you granular control here, which is great in theory. In practice, it was a lot of trial and error. I'd deploy something, watch it fail, check the operator logs, realize it needed a scope I hadn't granted, extend the OAuth client, and try again.

There's no single "give it everything it needs for a homelab" scope preset. You're figuring out what the operator needs for your specific use case by testing and iterating. Not a dealbreaker, but expect to spend some time on it during initial setup.

## Before and After

**Before (Cloudflare Tunnels):**
- Manual tunnel configuration per service
- Static route management on the Cloudflare dashboard
- GitHub OAuth + email filtering for access control
- Separate certificate management
- Every new service: 15+ minutes of clicking and configuring

**After (Tailscale Operator):**
- One LoadBalancer Service manifest per service
- Automatic DNS and machine registration
- User-based ACLs through Tailscale
- Automatic TLS via Funnel when needed
- Every new service: one YAML file, push to git, done

The entire networking layer for my homelab went from a babysitting job to a background system. New service? Write a manifest, set a hostname, push to git. ArgoCD syncs it, the operator picks it up, and I move on with my life.

That is my favorite kind of infrastructure. Boring, automated, and out of my way.
