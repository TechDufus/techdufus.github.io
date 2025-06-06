---
layout: post
section-type: post
title: 'Working with Private Container Registries: Nexus and Kubernetes'
category: tech
tags: ['docker', 'kubernetes', 'nexus', 'rancher', 'containers']
---

# Working with private container registries in enterprise environments

If you're working in an enterprise environment, you've probably encountered the need to use private container registries instead of pulling everything from Docker Hub. This introduces additional complexity around authentication and security that can be tricky to navigate.

I spent some time working with Nexus as our private Docker registry, integrated with Kubernetes through Rancher. It took me a while to figure out all the pieces, so I figured I'd document what I learned. Maybe it'll save someone else the time of piecing this together from scattered documentation.

## The Setup I Was Working With

Here's what I was dealing with:
- **Nexus Repository Manager** as our private Docker registry
- **Kubernetes clusters** managed through **Rancher**
- Need to build, push, and deploy container images that aren't available on public registries
- Multiple authentication steps between Docker, Nexus, and Kubernetes

The goal was to establish a workflow where I could build images locally, push them to our internal registry, and then deploy them to Kubernetes without authentication failures.

## The Basic Workflow I Figured Out

After some trial and error, here's the process that worked for me:

### Step 1: Getting Your Registry Credentials

First, you need to get your Nexus credentials. In my case, these were provided through some internal documentation, but you'll need:

- `NEXUS_DOCKER_REGISTRY_USR` - your username
- `NEXUS_DOCKER_REGISTRY_PSW` - your password
- `NEXUS_DOCKER_REGISTRY_HOST` - the registry hostname (without https://)

I stored these as environment variables to make life easier:

```bash
export NEXUS_DOCKER_REGISTRY_USR=your_username
export NEXUS_DOCKER_REGISTRY_PSW=your_password
export NEXUS_DOCKER_REGISTRY_HOST=nexus.company.com:8443
```

### Step 2: Login to the Registry

This part is straightforward, just like logging into Docker Hub:

```bash
docker login -u $NEXUS_DOCKER_REGISTRY_USR -p $NEXUS_DOCKER_REGISTRY_PSW $NEXUS_DOCKER_REGISTRY_HOST
```

One issue I encountered: this didn't work in WSL due to an untrusted x509 certificate issue, but worked fine when I SSHed into an Ubuntu server to run the commands. I never fully resolved why, but found the workaround was sufficient for my needs.

### Step 3: Build Your Image

Nothing special here, just make sure you're in the directory with your Dockerfile:

```bash
docker build -t folder_path/image:tag .
```

The key is to think about your naming convention. You'll need to prefix this with your registry host when you push, so plan accordingly.

### Step 4: Tag and Push to Nexus

Here's where it gets specific to your private registry:

```bash
# Tag your image with the full registry path
docker tag folder_path/image:tag $NEXUS_DOCKER_REGISTRY_HOST/folder_path/image:tag

# Push to your private registry
docker push $NEXUS_DOCKER_REGISTRY_HOST/folder_path/image:tag
```

The important thing is that full path: `$NEXUS_DOCKER_REGISTRY_HOST/folder_path/image:tag`. That's what tells Docker (and later Kubernetes) where to find your image.

## The Kubernetes Side: Making Rancher Play Nice

Now comes the fun part - getting Kubernetes to actually pull from your private registry. If you just try to deploy a pod with a private registry image, it'll fail with an `ImagePullBackOff` error because Kubernetes doesn't know how to authenticate.

### Creating Registry Secrets in Rancher

I was using Rancher to manage our Kubernetes clusters, so here's how I set up the authentication:

1. **Navigate to your namespace** in the Rancher UI
2. **Click "Create"** and select **"Registry"**
3. **Under "Data"**, select **"Custom"**
4. **For "Registry Domain Name"**, enter your registry URL **without** the `http://` or `https://` prefix
5. **Username**: Your `NEXUS_DOCKER_REGISTRY_USR`
6. **Password**: Your `NEXUS_DOCKER_REGISTRY_PSW`
7. **Click "Create"**

The tricky part here is remembering not to include the protocol in the registry domain name. I made that mistake a few times.

### Adding the Secret to Deployments

Once you've created the registry secret, you need to tell your deployments to use it:

1. **Navigate to your deployment** in Rancher
2. **Find the "Pull Secrets" section** in the deployment configuration
3. **Add your registry secret** to the Pull Secrets list

Now when Kubernetes tries to pull your image, it'll use those credentials to authenticate with your private registry.

## Common Issues I Encountered

### WSL Certificate Issues
As mentioned earlier, Docker login didn't work in WSL due to certificate trust issues. I ended up SSHing into an Ubuntu server and doing my Docker builds and pushes from there instead. Not ideal, but it provided a workable solution.

### Registry URL Format
I made the mistake several times of including `https://` in the registry domain name when creating secrets. Kubernetes expects just the hostname and port, not the full URL.

### Image Naming Convention
It took me some time to understand the correct image naming convention. You need to include the full registry path in your image name, not just add it when pushing.

### Namespace Scope
Registry secrets are namespace-scoped, so you need to create them in each namespace where you want to deploy private images. I discovered this when my deployment worked in one namespace but failed in another.

## A Slightly Better Way (If You're Using kubectl)

If you're more comfortable with kubectl than the Rancher UI, you can create registry secrets from the command line:

```bash
kubectl create secret docker-registry my-registry-secret \
  --docker-server=$NEXUS_DOCKER_REGISTRY_HOST \
  --docker-username=$NEXUS_DOCKER_REGISTRY_USR \
  --docker-password=$NEXUS_DOCKER_REGISTRY_PSW \
  --docker-email=your-email@company.com
```

Then reference it in your deployment YAML:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      imagePullSecrets:
      - name: my-registry-secret
      containers:
      - name: my-app
        image: nexus.company.com:8443/my-team/my-app:v1.0.0
```

## What I Learned About Enterprise Registries

Working with private registries taught me several things:

**Security adds complexity**: There are significantly more moving parts compared to public registries. Authentication, certificates, and network policies all need to work together.

**Documentation becomes critical**: Good naming conventions and documentation are essential when multiple teams are pushing to the same registry.

**Testing is important**: Testing deployments in a development environment first helps catch authentication issues before they reach production.

**Automation provides value**: Once you understand the workflow, automating it through CI/CD pipelines reduces manual errors and makes the process more reliable.

## Wrapping Up

Private container registries introduce more complexity than you might initially expect. The authentication flow between Docker, your registry, and Kubernetes requires careful coordination to work correctly.

The key things that helped me:
- Establishing credentials and environment variables first
- Understanding registry URL formatting requirements
- Properly configuring Kubernetes secrets
- Testing the complete workflow in a development environment

If you're working with similar setups, I hope this documentation helps you avoid some of the issues I encountered. If you've found better approaches to any of these challenges, I'd be interested to learn about them.

This workflow served my needs well, though I'm sure there are improvements and alternative approaches that others have discovered.

