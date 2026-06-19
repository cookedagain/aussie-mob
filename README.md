# Aussie Mob Clan Home

A Kravy-inspired RuneScape clan home page rebuilt for **Aussie Mob** and prepared for review by clan owner **N5W**.

The project keeps the live Aussie Mob clan data work already added, but presents it in a darker clan-dashboard style with a top **Home** menu, hero banner, announcement block, events, activity feed, owners list, progress cards, XP gain table, boss hiscores, rank summary, and RuneMetrics details.

## Live Preview (for N5W)

This project is set up to publish a **live, clickable preview** on **GitHub Pages** automatically.

To turn it on:

1. Push this project to a GitHub repository (use the `main` branch).
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Every time you push to `main`, the site rebuilds and redeploys automatically.

Where to find the link:

- Open the **Actions** tab and click the latest **Deploy live preview** run.
- The public URL appears on the **deploy** step, and also under **Settings → Pages**.
- It usually looks like: `https://<your-username>.github.io/<repository-name>/`

Share that URL with **N5W** so the Aussie Mob home page can be viewed live in any browser, no setup required.

> Tip: You can also trigger a redeploy manually from the **Actions** tab using the **Run workflow** button.

## Highlights

- Kravy-style top navigation with **Home** as the active menu item
- Aussie Mob branding throughout the page
- Local placeholder images only, stored at `/public/assets/placeholder.svg`
- Live RuneScape clan hiscores roster where browser access allows it
- Preview roster fallback so the design still looks complete if public feeds are blocked
- Member search from the top bar
- Clan activity feed generated from the current roster data
- Clan owners / leadership panel
- Clan progress and XP gain panels
- Boss hiscores based on public kill values
- Rank summary and RuneMetrics profile preview
- Live 60-second data refresh with an AEST countdown in the header
- Responsive layout for desktop and mobile screens

## Data Sources

The app uses public RuneScape community data:

- RuneScape clan hiscores member feed
- RuneMetrics public player profile data
- RunePixels profile links for player and clan navigation

No private clan credentials or manual roster uploads are required.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui base setup
- TanStack Query
- Lucide React icons

## Project Structure

```txt
.github/
  workflows/
    deploy.yml         # Auto-publishes the live preview to GitHub Pages
public/
  assets/
    placeholder.svg    # Required local placeholder image
src/
  App.tsx              # App routing
  pages/
    Index.tsx          # Kravy-inspired Aussie Mob home page
  components/
    ui/                # shadcn/ui components
```

## Review Note

This is a fan-made community tracker and is not affiliated with Jagex. RuneScape is a trademark of Jagex.

The current version is designed as a polished proof of concept for showing **N5W** how Aussie Mob could look as a dedicated clan home page.