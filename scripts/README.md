# Scripts Directory

This directory contains bash-based content management utilities for the TechDufus blog. All scripts are written in bash and work on any Unix-like system (Linux, macOS, WSL).

## Available Scripts

### `newpost`
Creates a new blog post with proper frontmatter template.

**Usage:**
```bash
./scripts/newpost "Your Post Title"
```

**Features:**
- Generates filename-friendly URLs from titles
- Adds current date automatically
- Prevents overwriting existing posts
- Creates `_posts/` directory if needed

**Output:** Creates a new file like `_posts/2025-01-06-your-post-title.md`

### `generate-categories`
Automatically generates category pages for all categories used in blog posts.

**Usage:**
```bash
./scripts/generate-categories
```

**Features:**
- Parses YAML frontmatter from all posts
- Extracts `category` field from each post
- Creates category pages only if they don't exist
- Handles case conversion automatically

**Output:** Creates HTML files in the `categories/` directory for each unique category found in `_posts/`.

### `generate-tags`
Automatically generates tag pages for all tags used in blog posts.

**Usage:**
```bash
./scripts/generate-tags
```

**Features:**
- Parses YAML frontmatter from all posts
- Extracts `tags` arrays from each post
- Handles multiple tags per post
- Avoids duplicate tag page generation
- Converts tags to lowercase for consistency

**Output:** Creates HTML files in the `tags/` directory for each unique tag found in `_posts/`.

## Development Workflow

Since this project uses Docker/Podman Compose for development, the typical workflow is:

1. **Start development server:**
   ```bash
   docker-compose up
   # or
   podman-compose up
   ```

2. **Create new blog post:**
   ```bash
   ./scripts/newpost "My New Post"
   ```

3. **Generate category/tag pages after adding posts:**
   ```bash
   ./scripts/generate-categories
   ./scripts/generate-tags
   ```

4. **Manual Jekyll commands (if needed):**
   ```bash
   bundle exec jekyll serve --config _config.yml,_config.dev.yml
   ```
