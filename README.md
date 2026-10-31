# Project Arcade

A static showcase site for Flash (`.swf`), HTML and other projects. No build step, no server code: it works on GitHub Pages, Netlify, Cloudflare Pages, itch.io or any plain web host.

- **Two-pane layout** (`index.html`): a searchable project list on the left, and the selected project playing on the right with fullscreen, details and a download link. On phones the list and the player take turns on screen.
- **Direct links**: each project has its own address, e.g. `index.html#my-game`
- **Flash** runs in the browser through [Ruffle](https://ruffle.rs) 0.7.1, bundled in `assets/ruffle/`, so visitors need no plugin
- **HTML** projects run in an iframe; video, images and PDFs are shown inline; anything else gets a download button

## Adding a project

1. Put the files in their own folder, e.g. `projects/my-game/`.
2. Add an entry to `projects.json`:

```json
{
  "id": "my-game",
  "title": "My Game",
  "description": "What it is, in a sentence or two.",
  "file": "projects/my-game/game.swf",
  "thumbnail": "projects/my-game/thumb.png",
  "year": 2010,
  "tags": ["flash", "platformer"],
  "width": 550,
  "height": 400,
  "controls": "Arrow keys to move, Space to jump"
}
```

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Unique, used in the URL (`index.html#my-game`) |
| `title` | yes | |
| `file` | yes* | Path to the `.swf`, `.html`, `.mp4`, `.png`, `.pdf`, `.zip`... |
| `url` | * | Use instead of `file` to link to a project hosted elsewhere |
| `type` | no | Detected from the file extension. Set it to override: `swf`, `html`, `video`, `image`, `pdf`, `link`, `download` |
| `width`, `height` | no | Native size; sets the player's aspect ratio (default 800×600) |
| `thumbnail` | no | Square image for the list. Without one, the list shows a type icon |
| `description`, `year`, `tags`, `controls` | no | Shown in the list and the viewer |
| `background` | no | SWF only: stage colour, e.g. `"#000000"` |
| `ruffle` | no | SWF only: extra [Ruffle options](https://github.com/ruffle-rs/ruffle/wiki/Using-Ruffle#configuration-options), e.g. `{ "quality": "low" }` |

For an HTML project, point `file` at its `index.html`; relative paths inside it keep working.

Site title, tagline, author and header links are set in the `site` block at the top of `projects.json`.

## Previewing locally

The pages load `projects.json` with `fetch`, which browsers block on `file://`, so serve the folder:

```sh
cd showcase
python3 -m http.server 8000
# open http://localhost:8000
```

## Publishing

**GitHub Pages:** push this folder to a repository, then Settings → Pages → Deploy from branch → `main` / root. The site appears at `https://<user>.github.io/<repo>/`. The empty `.nojekyll` file stops GitHub from processing the files.

**Netlify / Cloudflare Pages:** drag the folder onto the dashboard, or connect the repository with no build command and the root as the publish directory.

## Notes

- Ruffle supports most ActionScript 1/2 content and a large and growing share of ActionScript 3. Check a specific SWF at https://ruffle.rs/demo if it misbehaves.
- SWFs that load other files (levels, music, XML) need those files next to them, at the same relative paths.
- To upgrade Ruffle, replace the contents of `assets/ruffle/` with the files from a newer `@ruffle-rs/ruffle` npm package (`npm pack @ruffle-rs/ruffle`).
- The sample projects (`projects/starfield`, `projects/bounce`) can be deleted along with their `projects.json` entries.
