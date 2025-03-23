---
title: "Deploying My Portfolio Website on Netlify"
date: 2025-03-20T16:10:00-04:00
hero: images/posts/homelab-09/netlify.gif
menu: 
  sidebar:
    name: Deploying My Portfolio Website on Netlify
    identifier: netlify-02
    parent: Homelab
    weight: 10
---
This is how I set up Netlify to host my portfolio website. Previously, I used a static website deployed via Ansible with this GitHub repository: `https://github.com/apigban/alain.apigban.com` and the `update-playbook.yaml` from this repository: `https://github.com/apigban/webhost-playbook`.

My decision to use Netlify was driven by several factors:
- **Reducing Homelab Dependency**: I wanted to eliminate my site's reliance on my homelab hardware, which I take offline every two weeks for maintenance, cleaning, and cold archives.
- **Improving Latency**: Netlify's Content Delivery Network (CDN) infrastructure helps decrease latency and improves site load times for users.
- **Multi-Platform Series**: This is the first in a series of blog posts where I'll explore deploying my portfolio website on various static site hosting platforms, including Cloudflare, Vercel, and others.

The initial setup using Netlify's web UI took me about 22 minutes and four attempts, mainly due to my own errors.

The process involved importing an existing project from my website's Git repository (https://github.com/apigban/alain.apigban.com) and deploying it on Netlify. A key advantage is that Netlify now automatically updates my website whenever I push changes to the repository.

## Configuration Steps

### Pre-task: Homelab Loadbalancer configuration
Before diving into Netlify, I needed to prepare my load balancer to proxy requests correctly to the Netlify app. You can find the details of this setup in this post: https://alain.apigban.com/posts/homelab/08/netlify-01/

### Importing My Blog's Repository to Netlify
Here's a breakdown of the steps I followed:

- Import Project: On my Netlify account's "Sites" page, I clicked "Import an existing project."

- Authorize GitHub: I authorized Netlify to access my website's GitHub repository.

- Configure Build Settings: I configured the following build settings:

**Site name**: `alainigbanblog.netlify.app`

**Base directory**: `.`

**Package directory**: Not set

**Build command**: `hugo`

**Publish directory**: `./public`

**Set Environment Variables**: I configured the necessary environment variables. These are the ones that worked for my setup:

```bash
        GO_VERSION=1.23
        HUGO_ENV=production
        HUGO_VERSION=0.138.0
        TZ=Asia/Dubai
```

## Deployment Process
Netlify's deployment process consists of five distinct phases:

- Initializing
- Building
- Deploying
- Cleanup
- Post-processing

### Initializing
This is the starting phase of the deployment process. Based on the logs, Netlify prepares the environment. This involves:

- **Setting up the build environment**: Netlify configures the environment with the necessary tools and versions.

        `2:46:14 AM: buildbot version: cb2083XXXXXXXXX`
- **Fetching cached dependencies**: Netlify retrieves and extracts cached dependencies to accelerate the build process.

        `2:46:14 AM: Fetching cached dependencies`
- **Preparing the Git repository**: Netlify prepares the Git repository for the build.

        `2:46:24 AM: Starting to prepare the repo for build`
- **Installing project dependencies**: Netlify installs the project's dependencies using npm.

        `2:46:36 AM: v22.14.0 is already installed.`
        `2:46:37 AM: Now using node v22.14.0 (npm v10.9.2)`

### Building

In this phase, Netlify transforms the source content (my Hugo website's repository) into static files. The logs show the command used to generate static files and build statistics.

```bash
        2:46:41 AM: $ hugo
        2:46:41 AM: Start building sites …
        2:46:41 AM: hugo v0.138.0-ad82998d54b3f9f8c2741b67356813b55b3134b9+extended linux/amd64 BuildDate=2024-11-06T11:22:34Z VendorInfo=gohugoio
        2:46:43 AM: | EN
        2:46:43 AM: -------------------+------
        2:46:43 AM: Pages | 61
        2:46:43 AM: Paginator pages | 1
        2:46:43 AM: Non-page files | 20
        2:46:43 AM: Static files | 251
        2:46:43 AM: Processed images | 26
        2:46:43 AM: Aliases | 8
        2:46:43 AM: Cleaned | 0
        2:46:43 AM: Total in 2158 ms
        2:46:43 AM: ​
        2:46:43 AM: (build.command completed in 2.2s)
```

### Deploying

During this phase, Netlify transfers the built website files from the build environment to its hosting infrastructure. This process only took **545ms**.

The logs indicate that the `./public` folder is the source of the files. This is the default output directory for Hugo:  https://gohugo.io/getting-started/usage/#build-your-site

```bash
        2:46:43 AM: Starting to deploy site from public
        Files are uploaded to Netlify's CDN.

        2:46:43 AM: Calculating files to upload
        2:46:43 AM: 30 new file(s) to upload
        2:46:43 AM: 0 new function(s) to upload
        2:46:44 AM: Section completed: deploying
        2:46:44 AM: Site deploy was successfully initiated
        2:46:44 AM: ​
        2:46:44 AM: (Deploy site completed in 545ms)
```

### Cleanup
This phase focuses on caching build artifacts to optimize future builds. Netlify cached various dependencies and build outputs, including Node.js modules, build plugins, the mise cache, and the Corepack cache.

```bash
        2:46:44 AM: Netlify Build Complete
        2:46:44 AM: ────────────────────────────────────────────────────────────────
        2:46:44 AM: ​
        2:46:44 AM: Caching artifacts
        2:46:44 AM: Started saving node modules
        2:46:44 AM: Finished saving node modules
        2:46:44 AM: Started saving build plugins
        2:46:44 AM: Finished saving build plugins
        2:46:44 AM: Started saving mise cache
        2:46:44 AM: Finished saving mise cache
        2:46:44 AM: Started saving corepack cache
        2:46:44 AM: Finished saving corepack cache
        2:46:44 AM: Build script success
        2:47:09 AM: Uploading Cache of size 450.0MB
        2:47:11 AM: Section completed: cleanup
```

### Post-Processing

This phase includes Netlify-specific deployment actions that aren't typically seen in other continuous deployment pipelines:

- **Form Detection**: `2:46:44 AM: Skipping form detection`

Here Netlify skipped **form detection**. Netlify can handle forms and submissions if a <form> tag is present in the website.

- **Header and Redirect Rules Processing**:

Header and redirect rules can be configured in the netlify.toml file.

`2:46:44 AM: Post processing - header rules`: I didn't use custom headers, so there was no action. For more information, see the Netlify documentation: https://docs.netlify.com/routing/headers/

`2:46:44 AM: Post processing - redirect rules`: I didn't use redirects or rewrites, so there was no action. For more information, see the Netlify documentation: https://docs.netlify.com/routing/redirects/

### Next Steps

My next step is to create a simple monitoring dashboard for my custom domain and the Netlify subdomain using Grafana.
