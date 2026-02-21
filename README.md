# StoryBuilder

Create immersive, scroll-driven visual stories with photos, videos, and text.

**[Sign up for the beta](https://marcuschan.github.io/storybuilder-v1-static/)** | **[View example story](https://mchan-fr.github.io/mount-whitney-story/)**

## What is StoryBuilder?

StoryBuilder is a visual editor for creating rich multimedia narratives. It lets you combine full-bleed images, video backgrounds, text blocks, and galleries into scroll-driven stories that export as standalone HTML files.

### Features

- **Block-based editing** - Drag and drop blocks to build your story
- **Multiple layout types** - Heroes, galleries, split layouts, full-bleed media, and more
- **Live preview** - See your story as readers will see it while you edit
- **Export to HTML** - Generate standalone files you can host anywhere
- **No dependencies** - Exported stories are self-contained with no external requirements

## Getting Started

### Try the Demo

When you first access StoryBuilder after signing up, you'll find a demo project called "Hiking Mt. Whitney" that showcases different block types. Load it to explore what's possible.

### Creating Your First Story

1. **Set up your project folder** - Create a folder in `/projects/your_project_name/` with a `media/` subfolder for your images and videos
2. **Add blocks** - Use the dropdown to select a block type and click "Add Block"
3. **Configure each block** - Click a block to edit its content, media paths, and styling
4. **Preview your work** - The right panel shows a live preview of your story
5. **Export** - Click "Export HTML" to download your finished story

### Media Paths

When adding images or videos, use relative paths from the project root:
```
projects/your_project/media/photo.jpg
projects/your_project/media/video.mp4
```

## Example Story

Check out the [Hiking Mt. Whitney](https://mchan-fr.github.io/mount-whitney-story/) story to see a complete example of what you can build with StoryBuilder.

## Block Types

| Block | Description |
|-------|-------------|
| **Hero** | Full-screen image/video with headline overlay |
| **Full-Bleed Media** | Edge-to-edge photos or videos |
| **Gallery** | 2-4 image layouts with multiple templates |
| **Split Layout** | Image + text panel side by side |
| **Text** | Paragraphs with subheads, pull quotes, and drop caps |
| **Photo Lede** | Feature image above text content |
| **Photo Lede Side** | Feature image beside text content |
| **Zoom on Photo** | Scroll-triggered zoom effect |
| **Split Panel** | Side-by-side content panels |

## Exporting Your Story

1. Click **Export HTML** to download a standalone HTML file
2. Upload the HTML file and your `media/` folder to any web host
3. Share the URL!

For local testing, use a local server (the exported HTML requires serving, not opening directly).

## Saving Your Work

- **Save JSON** - Download your project as a JSON file for backup
- **Load JSON** - Reload a previously saved project
- **Cloud Storage** - Sign in to save projects to the cloud (optional)

## Feedback & Issues

We'd love to hear from you! Please submit:

- **Bug reports** - Something not working? [Open an issue](https://github.com/marcuschan/storybuilder-v1-static/issues/new?template=bug_report.md)
- **Feature requests** - Have an idea? [Suggest a feature](https://github.com/marcuschan/storybuilder-v1-static/issues/new?template=feature_request.md)
- **General feedback** - [Share your thoughts](https://github.com/marcuschan/storybuilder-v1-static/issues/new?template=feedback.md)

## Development

### Running Locally

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

Output is in the `dist/` folder.

## License

MIT

---

Built by [Marcus Chan](https://github.com/mchan-fr)
