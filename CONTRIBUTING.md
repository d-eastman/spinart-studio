# Contributing to the Gallery

Want to showcase your spin-art creation? Follow these steps to add it to the community gallery.

## Steps

1. **Create your artwork** using [SpinArt Studio](https://d-eastman.github.io/spinart-studio/) and export it as a PNG or GIF.

2. **Fork this repository** and clone your fork locally.

3. **Add your image** to the `public/gallery/` directory.
   - Accepted formats: PNG, GIF
   - Maximum file size: 2 MB
   - Use a descriptive, lowercase filename with hyphens (e.g., `blue-spiral.png`)

4. **Add an entry** to `public/gallery/manifest.json`. Append your entry to the array:

   ```json
   {
     "file": "blue-spiral.png",
     "title": "Blue Spiral",
     "author": "your-github-username"
   }
   ```

   | Field    | Description                          |
   |----------|--------------------------------------|
   | `file`   | Filename matching the image you added |
   | `title`  | A short name for your artwork        |
   | `author` | Your GitHub username or display name |

5. **Commit and push** your changes, then open a pull request against `main`.

## Guidelines

- Submit your own original work only.
- Keep images reasonable in size — the gallery loads all thumbnails on one page.
- One image per entry. You may submit multiple entries in a single PR.
- Make sure `manifest.json` remains valid JSON after your edit.
