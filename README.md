# Nick Cramer's Portfolio Website

A Jekyll-based portfolio and blog website showcasing technical projects, research, and interactive tools in aerospace and robotics.

**Live Site**: https://cram9030.github.io

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Adding New Content](#adding-new-content)
  - [Blog Posts](#blog-posts)
  - [Projects](#projects)
  - [Interactive Tools](#interactive-tools)
  - [Static Pages](#static-pages)
- [Working with Assets](#working-with-assets)
- [Testing Locally](#testing-locally)
- [Advanced Features](#advanced-features)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Ruby (version 2.5.0 or higher)
- Bundler (`gem install bundler`)
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/cram9030/cram9030.github.io.git
   cd cram9030.github.io
   ```

2. **Install dependencies**
   ```bash
   bundle install
   ```

3. **Serve locally**
   ```bash
   bundle exec jekyll serve
   ```

4. **View in browser**
   - Open http://localhost:4000
   - Site auto-rebuilds when files change

## Adding New Content

### Blog Posts

Blog posts are stored in `_posts/` with the naming convention: `YYYY-MM-DD-title.md`

#### Create a New Blog Post

1. Create a new file in `_posts/`:
   ```bash
   touch _posts/2025-10-30-my-new-post.md
   ```

2. Add frontmatter and content:
   ```markdown
   ---
   layout: default
   title: "Your Post Title"
   show_title: true
   date: 2025-10-30
   ---

   Your content here...
   ```

#### Blog Post Frontmatter Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `layout` | Yes | Page layout template | `default` |
| `title` | Yes | Post title | `"TIL: Converting sympy to Latex"` |
| `show_title` | No | Display title on page | `true` |
| `date` | Yes | Publication date | `2025-10-30` |

#### Testing Your Blog Post

1. **Local preview**: `bundle exec jekyll serve`
2. **Check formatting**: Verify markdown renders correctly
3. **Test links**: Click all links to ensure they work
4. **Review on mobile**: Check responsive layout
5. **Verify in blog list**: Visit http://localhost:4000/blog/

### Projects

Projects are stored in `_projects/` as markdown files. They appear on the Projects page and can be featured on the homepage.

#### Create a New Project

1. Create a new file in `_projects/`:
   ```bash
   touch _projects/my-project.md
   ```

2. Add frontmatter and content:
   ```markdown
   ---
   layout: default
   title: "Project Title"
   status: "active"
   featured: true
   description: "Brief one-line description"
   thumbnail: "/assets/images/project-thumbnail.png"
   ---

   ## Project Details

   Your detailed project description...

   ### Related Publications and Links
   1. [Link text](https://example.com)
   ```

#### Project Frontmatter Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `layout` | Yes | Page layout | `default` |
| `title` | Yes | Project name | `"FERVOR Robot"` |
| `status` | No | Project status | `"active"`, `"ended"`, `"ongoing"` |
| `featured` | No | Show on homepage | `true` or `false` |
| `description` | Yes | Short description (1 line) | `"Modular robot platform"` |
| `thumbnail` | Yes | Path to image | `"/assets/images/thumb.png"` |

#### Testing Your Project

1. **Local preview**: `bundle exec jekyll serve`
2. **Check project page**: Visit http://localhost:4000/projects/my-project/
3. **Verify projects list**: Visit http://localhost:4000/projects/
4. **Test featured display**: If `featured: true`, check homepage
5. **Validate thumbnail**: Ensure image loads correctly

### Interactive Tools

Interactive tools are stored in `_tools/` and typically include React-based visualizations.

#### Create a New Tool

1. Create a new file in `_tools/`:
   ```bash
   touch _tools/my-tool.md
   ```

2. Add frontmatter and include your visualization:
   ```markdown
   ---
   layout: default
   title: "Tool Name"
   description: "What the tool does"
   ---

   # Tool Name

   Brief introduction...

   <div id="root"></div>

   <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
   <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
   <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
   <script type="text/babel" src="/assets/js/my-tool.js"></script>
   ```

3. Add your JavaScript in `assets/js/my-tool.js`

#### Testing Your Tool

1. **Local preview**: `bundle exec jekyll serve`
2. **Test functionality**: Interact with all tool features
3. **Check console**: Open browser DevTools for errors
4. **Test edge cases**: Try invalid inputs, edge values
5. **Verify responsive**: Test on different screen sizes

### Static Pages

Static pages are stored in `_pages/` and include main site sections.

#### Create a New Page

1. Create a new file in `_pages/`:
   ```bash
   touch _pages/my-page.md
   ```

2. Add frontmatter and content:
   ```markdown
   ---
   layout: default
   title: "Page Title"
   permalink: /my-page/
   ---

   Your page content...
   ```

3. Update navigation in `_layouts/default.html`:
   ```html
   <a href="/my-page/">My Page</a>
   ```

## Working with Assets

### Images

Store images in `assets/images/`:

```bash
# Add an image
cp ~/Downloads/my-image.png assets/images/

# Reference in markdown
![Alt text](/assets/images/my-image.png)

# Or with HTML for more control
<img src="/assets/images/my-image.png" alt="Description" style="max-width: 100%;">
```

#### Image Best Practices

- Use descriptive filenames: `fervor-robot-assembly.png` not `img1.png`
- Optimize file sizes (aim for < 500KB)
- Use PNG for diagrams, JPG for photos
- Include alt text for accessibility

### Interactive Plots

Store HTML plots in `assets/plots/`:

```bash
# Add a plot
cp ~/Downloads/visualization.html assets/plots/

# Embed in markdown
<iframe src="/assets/plots/visualization.html" width="100%" height="600px" frameborder="0"></iframe>
```

### JavaScript Files

Store custom JavaScript in `assets/js/`:

```bash
# Add a script
cp my-script.js assets/js/

# Reference in markdown
<script src="/assets/js/my-script.js"></script>
```

## Testing Locally

### Basic Testing Workflow

1. **Start local server**
   ```bash
   bundle exec jekyll serve
   ```

2. **Access site**: http://localhost:4000

3. **Auto-reload**: Changes automatically rebuild (except `_config.yml`)

4. **Check all pages**:
   - Homepage: http://localhost:4000/
   - Blog: http://localhost:4000/blog/
   - Projects: http://localhost:4000/projects/
   - Tools: http://localhost:4000/tools/
   - Your new content

### Testing Checklist

Before committing new content:

- [ ] All links work (internal and external)
- [ ] All images load correctly
- [ ] Markdown formatting is correct
- [ ] Code blocks syntax highlight properly
- [ ] Math equations render (if using MathJax)
- [ ] Diagrams display (if using Mermaid)
- [ ] Interactive features work
- [ ] Responsive on mobile (use browser DevTools)
- [ ] No console errors in browser DevTools
- [ ] Content appears in navigation/lists
- [ ] Metadata is correct (title, date, description)

### Troubleshooting Local Server

**Port already in use:**
```bash
bundle exec jekyll serve --port 4001
```

**Force rebuild:**
```bash
bundle exec jekyll serve --force_polling
```

**Clear cache:**
```bash
bundle exec jekyll clean
bundle exec jekyll serve
```

## Advanced Features

### Mathematical Equations (MathJax)

MathJax is enabled site-wide for LaTeX math rendering.

**Inline math:**
```markdown
The equation $E = mc^2$ is famous.
```

**Block math:**
```markdown
$$
\frac{\partial u}{\partial t} = \nabla^2 u
$$
```

**Testing math:**
- Preview locally to ensure equations render
- Check for proper escaping of special characters
- Verify alignment and sizing

### Diagrams (Mermaid.js)

Mermaid.js is available for flowcharts and diagrams.

```html
<div class="mermaid">
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
</div>
```

**Testing diagrams:**
- Verify syntax at https://mermaid.live/
- Check fullscreen toggle works
- Test on mobile devices

### Plotly Charts

Include Plotly visualizations using the custom include:

```liquid
{% include plotly-chart.html
   data='[{"x": [1,2,3], "y": [2,4,6], "type": "scatter"}]'
   layout='{"title": "My Chart"}'
%}
```

### YouTube Videos

Embed YouTube videos using the custom include:

```liquid
{% include youtubePlayer.html id="VIDEO_ID" %}
```

Replace `VIDEO_ID` with the YouTube video ID.

### Code Blocks with Syntax Highlighting

Use fenced code blocks with language specification:

````markdown
```python
def hello():
    print("Hello, World!")
```
````

Supported languages: `python`, `javascript`, `bash`, `ruby`, `html`, `css`, etc.

### Interactive React Components

For complex interactive features:

1. Write React component in `assets/js/your-component.js`
2. Include React, ReactDOM, and Babel from CDN
3. Add container div and script tag to your content

Example:
```html
<div id="my-app"></div>

<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel">
  // Your React code here
  ReactDOM.render(<App />, document.getElementById('my-app'));
</script>
```

## Deployment

### GitHub Pages Automatic Deployment

The site automatically deploys when you push to the main branch.

**Deployment workflow:**

1. **Test locally** (see [Testing Locally](#testing-locally))

2. **Commit changes**:
   ```bash
   git add .
   git commit -m "Add new blog post about topic"
   ```

3. **Push to GitHub**:
   ```bash
   git push origin main
   ```

4. **GitHub builds and deploys**: Usually takes 1-2 minutes

5. **Verify live site**: https://cram9030.github.io

### Branch Workflow

Recommended workflow for larger changes:

1. **Create feature branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make changes and test locally**

3. **Commit and push branch**:
   ```bash
   git add .
   git commit -m "Add feature description"
   git push origin feature/my-new-feature
   ```

4. **Create pull request** on GitHub

5. **Review and merge** to main

6. **Delete feature branch**:
   ```bash
   git branch -d feature/my-new-feature
   git push origin --delete feature/my-new-feature
   ```

### Checking Deployment Status

1. Go to: https://github.com/cram9030/cram9030.github.io/actions
2. Click on the latest workflow run
3. Check if build succeeded
4. If failed, review error logs

## Troubleshooting

### Common Issues

**Issue: Jekyll won't start**
```bash
# Update dependencies
bundle update
bundle install
```

**Issue: Changes not appearing**
- Restart Jekyll server (Ctrl+C, then `bundle exec jekyll serve`)
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check file is saved
- For `_config.yml` changes, always restart server

**Issue: Images not loading**
- Check file path starts with `/assets/images/`
- Verify file exists in correct location
- Check filename matches exactly (case-sensitive)
- Ensure image was committed to git

**Issue: Math equations not rendering**
- Check for proper `$` or `$$` delimiters
- Escape special characters: `\_`, `\{`, `\}`
- Test syntax at https://www.mathjax.org/

**Issue: Page not in navigation**
- Verify permalink in frontmatter
- Check navigation links in `_layouts/default.html`
- Ensure file is in correct directory

**Issue: 404 on live site**
- Check permalink format
- Verify file is committed and pushed
- Wait for GitHub Pages rebuild (1-2 minutes)
- Check build status in GitHub Actions

### Getting Help

- **Jekyll Documentation**: https://jekyllrb.com/docs/
- **GitHub Pages**: https://docs.github.com/en/pages
- **Markdown Guide**: https://www.markdownguide.org/
- **MathJax**: https://www.mathjax.org/
- **Mermaid**: https://mermaid.js.org/

### Site Structure Reference

```
cram9030.github.io/
├── _config.yml           # Site configuration
├── Gemfile               # Ruby dependencies
├── index.html            # Homepage
├── _layouts/             # Page templates
│   └── default.html      # Main layout
├── _includes/            # Reusable components
│   ├── bayesian-visualizer.html
│   ├── plotly-chart.html
│   └── youtubePlayer.html
├── _posts/               # Blog posts (YYYY-MM-DD-title.md)
├── _projects/            # Project pages
├── _tools/               # Interactive tools
├── _pages/               # Static pages
├── assets/
│   ├── css/              # Stylesheets
│   │   └── main.scss
│   ├── js/               # JavaScript files
│   ├── images/           # Images
│   └── plots/            # Interactive HTML plots
└── _site/                # Generated site (git ignored)
```

---

**Questions or issues?** Check the troubleshooting section or review the Jekyll documentation linked above.
