# CV

A responsive, Swedish-language curriculum vitae for Bjarne Lundqwist. The page is built with plain HTML, CSS, and JavaScript, and loads its content from `cv.json`.

## Run locally

No dependencies or build tools are required. Serve the project directory over HTTP so the browser can load `cv.json`:

```powershell
py -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in a browser. Alternatively, use a local development server extension in your editor.

## Project files

- `index.html` contains the page structure and section navigation.
- `cv.json` contains the personal details, work history, education, and courses displayed on the page.
- `scripts/script.js` loads the JSON and renders the CV, including dates, contact links, and timeline entries.
- `css/style.css` contains the responsive styling and light/dark color themes.
- `assets/photo.jpg` is the optional portrait image. If it is missing or cannot be loaded, the page displays the person's initials instead.

## Update the CV

Edit `cv.json` to change the content. The top-level `basics` object holds the name, title, contact details, and optional photo path. The `work`, `education`, and `courses` arrays supply the timeline sections. Entries can use `from` and `to` month values (`YYYY-MM`); courses can use a `date` (`YYYY`, `YYYY-MM`, or `YYYY-MM-DD`), and work entries may use a `dates` array for individual dates.

Keep the JSON valid when editing it. Refresh the page to see changes; the browser requests a fresh copy of the file each time.