---
layout: post
section-type: post
title: Introducing the BlogQueue GitHub Action
category: powershell
tags: [ 'tutorial','github' ]
---

# Have you ever started a blog, only to find yourself not posting content?

Well, that's been me for the past, while.. So I thought I'd write some PowerShell to help with that!

I've created a new GitHub Action called [BlogQueue](https://github.com/marketplace/actions/blog-queue-workflow) that will compliment my attention span.

You see, I go through seasons of focus. What I mean is, I can knock out a good blog post in an hour or so, but there was no incentive for me to continue that focus on a 2nd post. I would finish up a post, publish it to my blog immediately, and that was it until the next time I found that sharp focus to blog.

With this action, I am able to queue up several blog posts into a directory of my choosing, and GitHub will publish them in a timely manner. That way when I'm motivated to knock out a few posts, even if I don't write a post for 6 months, if I've got 6 queued up, I can still release a post once per month.

## The Action: [BlogQueue](https://github.com/marketplace/actions/blog-queue-workflow)

Here is what you need to get this set up for your blog.

NOTE: This assumes you are hosting your blog in GitHub, and that you have automation around your main/master branch to auto-deploy your site when your repo changes. I use GItHub pages with Jekyll for mine, so this is automatic.

You can see an example workflow on the BlogQUeue page in the GitHub Marketplace. GitHub will automatically see your workflow in GitHub if you create a file in the right place. In your GitHub repo, you will need to place this file in your `.github/workflows` folder. This file needs to be a `.yml` file.

Let's make this file and call it `BlogQueue.yml`. We can then paste the following code therein.

```yml
name: Blog Queue Workflow
#Run every Monday at 10:00am
on:
  schedule:
  - cron: '0 10 * * 1'
  # Enable run on-demand
  workflow_dispatch:

jobs:
  update-sponsors-section:
    name: Publish blog post from queue.
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: matthewjdegarmo/blogqueue@latest
        with:
          queue_path: ./.blogqueue # This will be any repo folder that you want to store your queued blog posts
          destination_path: ./_posts/
          committer_username: ${{ secrets.GH_USER }} # I've created a repo secret in GitHub with my username
          committer_email: ${{ secrets.GH_EMAIL }} # I've created a repo secret in GitHub with my email address
```

Once you save this file and push it up to GitHub, you will notice in your `Actions` tab that this workflow automatically shows up.

Now all I need to do is write posts, and make sure they are stored in the folder specified in `queue_path` and they will be published, 1 at a time, based on my specified schedule.

## The Goal

The goal is to assist and motivate me to post more. Anything I can do to automate away any work, no matter how small, is a step forward. Instead of me having to keep track of writing and publishing each individual post. I can simply write posts and store them in this folder. Anyone who subscribes to my blog's [RSS Feed](https://matthewjdegarmo.com/feed.xml) will be notified of new posts, on a schedule, while I'm working away on other fun projects.

## Thank you!

If you're here, then that means.... well I'm not sure, but I appreciate you nonetheless! I'm simply a young professional trying to grow and share what I learn to help others. If I've helped you, I would LOVE to hear about it! If you have any feedback, I would LOVE to hear it!

Until next time, stay safe, and keep automating all the things! 😎
