# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based personal blog and portfolio website for TechDufus, hosted on GitHub Pages. The site is built using the personal-jekyll-theme and includes sections for blog posts, timeline, setup documentation, and contact information.

## Development Commands

### Docker Development (Preferred Method)
- `docker-compose up` - Run Jekyll in Docker container (recommended)
- `podman-compose up` - Alternative using Podman
- `docker run --rm -it -p 4000:4000 -v "$PWD:/srv/jekyll" jekyll/jekyll jekyll serve --watch --host "0.0.0.0" --config _config.yml,_config.dev.yml`

### Native Development (Fallback)
- `bundle exec jekyll serve` - Build and serve for development (production config)
- `bundle exec jekyll serve --config _config.yml,_config.dev.yml` - Build and serve with development overrides
- `bundle exec jekyll serve --host 0.0.0.0` - Serve across LAN
- `bundle exec jekyll build` - Build the site without serving

### GitHub Actions Deployment
- Uses custom workflow at `.github/workflows/deploy.yml`
- Automatically deploys on push to master branch
- Can manually trigger via Actions tab or: `gh workflow run deploy.yml`

### Testing Commands
- `npm test` - Run all Playwright tests
- `npm run test:headed` - Run tests with browser visible
- `npm run test:ui` - Run tests with Playwright UI mode
- `npm run test:debug` - Run tests in debug mode
- `npm run test:mobile` - Run mobile-specific tests only
- `npm run test:desktop` - Run desktop-specific tests only
- `npm run test:ci` - Run tests with CI reporter (GitHub Actions)
- `npm run install-browsers` - Install Playwright browsers

### Content Management
- `./scripts/newpost <title>` - Create new blog post in _posts/ directory
- `./scripts/generate-categories` - Generate category pages for blog posts
- `./scripts/generate-tags` - Generate tag pages for blog posts
- `./scripts/generate-authors` - Generate author pages for blog posts

## Architecture

### Configuration
- `_config.yml` - Main Jekyll configuration for production
- `_config.dev.yml` - Development overrides (used with serve script)
- Uses Jekyll collections for the setup section with defined ordering

### Content Structure
- `_posts/` - Blog posts in markdown format with YAML frontmatter
- `_setup/` - Setup documentation as Jekyll collection (Hardware, Software, Homelab)
- `_layouts/` - Jekyll layout templates
- `_includes/` - Reusable Jekyll components and partials
- `_sass/` - SCSS stylesheets

### Key Features
- Dynamic typing animation on header with configurable quotes
- Timeline section with events and images
- Social media integration and sharing buttons
- Disqus comments integration
- Google Analytics tracking
- Web app mode with custom icons
- Gesture navigation for mobile

### Styling
- Uses SCSS with compression enabled in production
- FontAwesome icons for social media and UI elements
- Custom timeline and grayscale themes

### Dependencies
- Jekyll with webrick, jekyll-paginate, and jemoji plugins
- Docker support for containerized development (may have platform compatibility issues on ARM64)

## Troubleshooting

### Docker/Podman Issues
If encountering platform compatibility issues (ARM64 vs x86_64) or protobuf errors:
1. Use native Jekyll installation with `bundle exec jekyll serve`
2. For Docker issues, the provided docker-compose.yml uses Ruby Alpine with build tools
3. SCSS compilation errors may occur due to sass-embedded compatibility - consider using sassc gem instead

### Sass Deprecation Warnings
The site uses older Sass syntax that generates deprecation warnings but doesn't break functionality:
- `@import` statements should be updated to `@use`
- `darken()` function calls should use `color.adjust()` instead
- Mixed declaration order in CSS rules
These are warnings only - the site builds and runs correctly.

## Recent Optimizations Applied

### Performance & SEO Improvements
- Fixed critical JavaScript syntax error (site..loop → site.loop)
- Enhanced SEO meta tags with Open Graph and Twitter Card support
- Added DNS prefetch and preload directives for better performance
- Disabled deprecated Google+ sharing functionality

### Accessibility Improvements  
- Added proper alt attributes to profile images
- Enhanced navigation with ARIA labels and roles
- Improved semantic markup for screen readers

### Code Quality
- Fixed canonical URL generation
- Improved meta description handling with page excerpts
- Enhanced social media integration security

## Additional Optimizations Applied

### Security Enhancements
- Updated jQuery from 1.11.3 to 3.6.0 for security patches
- Added Content Security Policy (CSP) headers
- Added security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Added `rel="noopener"` to external social media links
- Fixed Bootstrap version consistency (3.4.1 for both CSS and JS)

### Analytics & Tracking
- Migrated from Universal Analytics to Google Analytics 4 (GA4)
- Updated tracking code to use gtag.js instead of analytics.js
- Note: Replace "G-XXXXXXXXXX" with actual GA4 measurement ID

### Performance Improvements
- Added lazy loading to timeline images
- Enhanced image alt attributes for better accessibility
- Added integrity checks to CDN resources
- Optimized resource loading with DNS prefetch and preload

### User Experience
- Better timeline image descriptions
- Improved social sharing security
- Enhanced meta tag coverage for better social media preview

### Repository Management
- Updated .gitignore with Jekyll best practices
- Added _site/, .sass-cache/, .jekyll-cache/ to ignore list
- Added Bundler and development files to ignore list

### Preferred Development Approach
Use Docker for consistent development environment:
```bash
docker-compose up  # Start development server
```

The site will be available at http://localhost:4000

## Testing Strategy

### Automated Testing
This project uses **Playwright** for comprehensive end-to-end testing. Tests run automatically on every push and pull request via GitHub Actions.

#### Test Coverage
- **Smoke Tests**: Core page functionality (home, blog, setup, contact)
- **Theme Switching**: Dark/light mode persistence and visual correctness
- **Mobile Responsive**: Navigation, layout, and mobile-specific features
- **Terminal Functionality**: Interactive elements and animations
- **Visual Regression**: Screenshots to catch visual regressions
- **Accessibility**: ARIA attributes and keyboard navigation
- **Cross-Browser**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari

#### CI/CD Integration
- `.github/workflows/test.yml` - Main test workflow
- Runs on push to master and PRs
- Tests against production site (techdufus.com)
- Daily scheduled runs to catch production issues
- Parallel execution across browsers and devices
- Automatic screenshot capture on failures
- Lighthouse performance testing
- Test result summaries in GitHub

#### Key Test Areas
1. **Mobile Light Mode**: Specifically tests the mobile light mode color fixes
2. **Theme Persistence**: Ensures theme choices persist across page loads
3. **Navigation**: Both desktop and mobile navigation functionality
4. **Terminal Interface**: Verifies terminal styling and interactions
5. **Responsive Design**: Tests across multiple viewport sizes
6. **Performance**: Lighthouse scores and load times

#### Running Tests Locally
```bash
# Install dependencies
npm ci
npm run install-browsers

# Run all tests
npm test

# Run specific test suites
npm run test:mobile     # Mobile-specific tests
npm run test:desktop    # Desktop-specific tests

# Debug tests
npm run test:headed     # See browser
npm run test:debug      # Step through tests
npm run test:ui         # Playwright UI mode
```

#### Visual Testing
- Screenshots captured for visual regression detection
- Mobile light mode specifically tested (our recent bug fixes)
- Cross-browser visual consistency checks
- Responsive design verification across viewports

This testing setup would have caught the mobile light mode issues automatically, saving significant debugging time.