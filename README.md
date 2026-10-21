# Naman's portfolio: how to run and update it

## 1. Put it online (one time, about 10 minutes)
1. Create a free account at github.com and make a new **public** repository (for example `portfolio`).
2. Upload everything in this folder to it (drag and drop in the browser works). Make sure the hidden `.github` folder goes too.
3. In the repository: **Settings > Pages > Build from branch > main > Save**. Your site appears at `https://<your-username>.github.io/portfolio/`.
4. In **Settings > Actions > General > Workflow permissions**, choose **Read and write permissions** and save. This lets the daily LeetCode update save its result.
5. Open the **Actions** tab, pick **Update LeetCode stats**, press **Run workflow** once to test it.

Opening `index.html` by double-clicking will not load projects, because browsers block that. Use the hosted address, or Netlify (drag the folder onto app.netlify.com/drop).

## 2. Add or change a project (no code)
1. Open `https://<your-site>/admin.html`.
2. Press **Add project**, fill in the boxes, pick a visual from the list (or give a screenshot path).
3. Press **Download projects.json** and upload it into the repository, replacing the old `projects.json`.
4. Screenshots go in the `images` folder. Refresh the site after about a minute.

## 3. Add a brand-new simulation
Ask Claude: "Write a new simulation for my project X that shows Y." You will get a block of code that starts with `S.something = {`.
1. Open `sims.js` on GitHub and press the pencil icon.
2. Paste the block above the line `window.SIMS=S;`.
3. Commit. The new visual now appears automatically in the dropdown of `admin.html`, and you can choose it for any project.

## 4. Live data
- **GitHub** is read live in the visitor's browser from GitHub's public API. Repos, followers, stars and recent pushes update on their own.
- **LeetCode** has no public browser API, so a GitHub Action (`.github/workflows/update-leetcode.yml`) fetches your stats every day and saves them to `data/leetcode.json`. If LeetCode refuses the request, the site keeps showing the last saved numbers.
- Change the usernames in `index.html` (`GH`) and in the workflow file if they change.
