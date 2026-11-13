# 🍦 Times Table Scoops

A multiplication tracker for kids. Master a times table → pick a flavor → earn a scoop.
Get all 12 scoops on the cone → real ice cream!

## How it works

- **Pick a kid** on the start screen (grown-ups add names under **Grown-ups**).
- Each kid works on one multiplier at a time, starting at **1×**.
- **Test:** all 12 facts in order (`n × 1` through `n × 12`), **2-minute** countdown in the corner.
  Answers are only marked after the test is submitted (or when time runs out).
  - **12/12:** the kid picks a flavor and a scoop labeled `n×` goes on the cone. They move on to the next multiplier.
  - **Anything less:** the test locks until they finish **2 practice sessions**.
- **Practice ("Scoop Stacker"):** one fact at a time in a random order. Each right answer stacks a scoop on a practice cone, and 3+ right in a row starts a 🔥 streak.
  If they miss one, the app shows the answer and they type it back. That fact comes back later in the round. A session is done when all 12 are right.
- **Grown-ups** screen: add/rename/delete kids, reset progress, unlock a test early, and see recent activity.

Progress is saved in the browser's local storage, so it stays on the device and browser you use.

## Run it in GitHub Codespaces

1. Create a new **empty** repository on GitHub (check "Add a README" so it isn't blank).
2. Click **Code → Codespaces → Create codespace on main**.
3. Drag `times-table-scoops.zip` into the Codespace file explorer, then in the terminal run:
   ```bash
   unzip times-table-scoops.zip && cp -r times-table-scoops/. . && rm -rf times-table-scoops times-table-scoops.zip
   git add . && git commit -m "Times Table Scoops" && git push
   ```
4. Run **Codespaces: Rebuild Container** from the command palette (Ctrl/Cmd+Shift+P).
   After that, `npm install` and `npm run dev` start on their own each time you open the Codespace, and the app opens in a preview tab.
   You can also run it yourself: `npm install` then `npm run dev`. Open the **Ports** tab and click the globe icon on port 5173.

## Put it online with GitHub Pages (always available)

The repo has a workflow (`.github/workflows/deploy.yml`) that builds the app and publishes it every time you push to `main`.

1. On GitHub, go to your repo's **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**.
2. Push any change (or go to **Actions → Deploy to GitHub Pages → Run workflow**).
3. When the run finishes (about a minute), the app is live at
   `https://<your-username>.github.io/<repo-name>/`
   The link also appears under **Settings → Pages**.

Bookmark that link on the kids' devices. On an iPad or phone, use **Share → Add to Home Screen** so it opens like an app.

Notes:
- Progress is saved on each device and browser separately. Use the same device and browser for each kid so their scoops stay put.
- On the free GitHub plan, Pages needs the repo to be **public**. Kids' names show only inside the app on their own device, not in the code, so nothing personal ends up in the repo.
- Changes you make in the Codespace go live after you `git push`.

## Project layout

```
src/
  App.jsx               screens + all progress rules
  storage.js            save/load + settings (test length, timer, practices after a fail)
  flavors.js            the 12 ice cream flavors
  components/
    Cone.jsx            the SVG cone and scoops
    KidPicker.jsx       "Who's scooping today?"
    KidHome.jsx         kid dashboard: cone + Practice / Test
    Test.jsx            timed test
    Practice.jsx        Scoop Stacker game
    FlavorPicker.jsx    choose your scoop flavor
    Grownups.jsx        parent settings
```

Settings you can change are at the top of `src/storage.js`: `TEST_SECONDS`, `PRACTICE_AFTER_FAIL`, `TOTAL_LEVELS`.
