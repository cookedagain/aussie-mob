# Aussie Mob Clan Home

A Kravy-inspired RuneScape clan home page rebuilt for **Aussie Mob** and prepared for review by clan owner **N5W**.

The project keeps the live Aussie Mob clan data work already added, but presents it in a darker clan-dashboard style with a top **Home** menu, hero banner, announcement block, events, activity feed, owners list, progress cards, XP gain table, boss hiscores, rank summary, and RuneMetrics details.

## Live Preview (for N5W)

This project is intended to run as a **live, clickable preview** on **Vercel**.

Recommended Vercel settings:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Vercel automatically redeploys the preview whenever the connected repository is updated. Share the generated Vercel URL with **N5W** so the Aussie Mob home page can be viewed live in any browser, no setup required.

## Highlights

- Kravy-style top navigation with **Home** as the active menu item
- Aussie Mob branding throughout the page
- Local placeholder images only, stored at `/public/assets/placeholder.svg`
- Live RuneStats clan roster where browser access allows it
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

- RuneStats clan member data
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