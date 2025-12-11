# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hugo static site project for Alain Igban's personal blog and portfolio (alain.apigban.com). It uses the Toha Hugo theme (v4) and focuses on technical blog posts about homelab projects, DevOps, and practical solutions to technical challenges.

## Development Commands

### Local Development
```bash
# Start development server with live reload
hugo server --bind 192.168.2.234 --baseURL http://192.168.2.234 -w

# For local development without network binding
hugo server -D
```

### Building
```bash
# Build the site for production
hugo

# Build including drafts
hugo -D
```

### Dependency Management
```bash
# Install Node.js dependencies
npm install

# Update Hugo theme module
hugo mod get -u github.com/hugo-toha/toha/v4
```

## Content Structure

- **Blog posts**: Create in `content/posts/` directory with subdirectories acting as categories
- **Static files**: Place in `static/` directory
- **Data files**: Configuration in `data/en/` directory (author info, sections, etc.)
- **Archetypes**: Default content templates in `archetypes/`

### Creating New Blog Posts

1. Create new markdown file in `content/posts/category-name/post-title.md`
2. Use the archetype template for frontmatter (automatic with `hugo new` command)
3. Categories are derived from the subdirectory structure under `content/posts/`

## Architecture

### Theme Configuration
- Uses Hugo Toha theme v4 as a Go module
- Theme imports configured in `hugo.yaml` under `module.imports`
- Custom parameters and feature flags in `params` section

### Key Features Enabled
- Blog posts with table of contents
- Portfolio section
- Dark mode support
- Analytics (Umami)
- Font Awesome icons
- KaTeX for math rendering
- Mermaid diagrams
- Syntax highlighting with highlight.js

### Deployment
The site is deployed using an external Ansible playbook from the `webhost-playbook` repository. The deployment process involves:
1. Committing changes to the local Forgejo repository
2. Changes sync to a remote GitHub repository
3. Running the `update-blog.yml` Ansible playbook to deploy

## File Organization

- `hugo.yaml`: Main Hugo configuration file
- `package.json`: Node.js dependencies for the theme
- `go.mod/go.sum`: Go modules for Hugo theme
- `content/posts/`: Blog content organized by categories
- `static/files/`: Static assets
- `data/en/`: Site configuration and structured data
- `assets/images/`: Image assets managed by Hugo pipelines
