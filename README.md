# { TechDufus }
![license](https://img.shields.io/badge/license-MIT-blue.svg?link=https://github.com/TechDufus/TechDufus.github.io/LICENSE)
[![Deploy Jekyll site to GitHub Pages](https://github.com/TechDufus/techdufus.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/TechDufus/techdufus.github.io/actions/workflows/deploy.yml)

{ TechDufus } is a modern, terminal-themed Jekyll blog and portfolio showcasing DevOps engineering, cloud-native technologies, and personal insights about technology, life, and faith.

🚀 **Live Site**: [TechDufus.com](https://TechDufus.com)

## ✨ Features

- **Terminal-Inspired Design**: Interactive terminal interface with animated command outputs
- **Dark/Light Mode Toggle**: Catppuccin color scheme with seamless theme switching
- **Responsive Layout**: Optimized for desktop, tablet, and mobile viewing
- **Character Profile System**: Gaming-inspired character card with personal stats
- **Professional Sections**: About, Blog, Timeline, Setup documentation, and Contact
- **Social Integration**: Complete social media integration with hover effects
- **Performance Optimized**: Fast loading with modern web optimizations

## 🛠️ Development

### Prerequisites

- Ruby (2.7+ recommended)
- Jekyll
- Bundler

### Local Development

**Install dependencies:**
```bash
bundle install
```

**Development server:**
```bash
bundle exec jekyll serve --config _config.yml,_config.dev.yml
# Serves at http://127.0.0.1:4000 with development config
```

**Production server:**
```bash
JEKYLL_ENV=production bundle exec jekyll serve --config _config.yml
# Serves at http://127.0.0.1:4000 with production config
```

### Content Management

**Create new blog post:**
```bash
./scripts/newpost "Your Post Title"
```

**Generate category/tag/author pages:**
```bash
./scripts/generate-categories
./scripts/generate-tags
./scripts/generate-authors
```

### Docker Development

**Using Docker Compose (recommended):**
```bash
docker-compose up
```

**Direct Docker command:**
```bash
docker run --rm -it -p 4000:4000 -v "$PWD:/srv/jekyll" jekyll/jekyll jekyll serve --watch --host "0.0.0.0" --config _config.yml,_config.dev.yml
```

## 🏗️ Architecture

- **Jekyll**: Static site generator with liquid templating
- **SCSS**: Modular stylesheets with Catppuccin theming
- **FontAwesome**: Icon library for UI elements
- **JavaScript**: Interactive terminal animations and theme switching
- **GitHub Pages**: Hosting and deployment

## 📁 Project Structure

```
├── _config.yml              # Main Jekyll configuration
├── _config.dev.yml          # Development overrides
├── _includes/               # Reusable components
├── _layouts/                # Page templates
├── _posts/                  # Blog posts
├── _sass/                   # SCSS stylesheets
├── _setup/                  # Setup documentation
├── scripts/                 # Development utilities
└── css/                     # Compiled stylesheets
```

## 🎨 Customization

The site uses the Catppuccin color scheme with CSS custom properties for theming. Key customization files:

- `_sass/_variables.scss` - Color definitions and theme variables
- `_config.yml` - Site configuration and social links
- `_includes/header.html` - Terminal interface customization

### Guest Author System

The blog supports guest authors with rich profile information. To create a post with a guest author, add the following frontmatter:

```yaml
---
layout: post
section-type: post
title: "Sample Guest Post"
category: tech
tags: [ 'guest', 'tutorial' ]
guest_author:
  name: "Jane Developer"
  title: "Senior DevOps Engineer at TechCorp"
  bio: "Jane is a seasoned DevOps engineer with 8 years of experience in cloud infrastructure and automation. She's passionate about Kubernetes, CI/CD, and helping teams scale their deployments efficiently."
  image: "https://example.com/jane-avatar.jpg"
  social:
    - platform: "LinkedIn"
      icon: "fa-brands fa-linkedin"
      url: "https://linkedin.com/in/jane-developer"
    - platform: "GitHub"
      icon: "fa-brands fa-github"
      url: "https://github.com/jane-developer"
    - platform: "Twitter"
      icon: "fa-brands fa-x-twitter"
      url: "https://x.com/jane_developer"
---
```

**Features:**
- **Flexible Author System**: Posts can have either the site author or a guest author
- **Rich Author Profiles**: Guest authors can include name, title, bio, image, and social links
- **Custom Social Links**: Each guest author can have their own social media profiles
- **Author Filtering**: Click on any author name in the blog listings to view all their posts
- **Automatic Author Pages**: Run `./scripts/generate-authors` to create author archive pages
- **Fallback to Site Author**: If no guest author is specified, uses the site's default author
- **Backward Compatible**: Existing posts continue to work without modification

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

While this is a personal blog, feel free to:
- Report issues or bugs
- Suggest improvements
- Fork for your own use

---

Built with ❤️ using Jekyll + Neovim^btw
