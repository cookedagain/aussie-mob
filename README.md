# Aussie Mob Clan Tracker

A clean, RunePixels-inspired clan tracker built for **Aussie Mob** and prepared for review by clan owner **N5W**.

The project presents the clan roster in a polished web interface with live RuneScape clan data, member statistics, leadership highlights, and RuneMetrics profile enrichment for top players.

## Overview

This app is designed as a dedicated clan hub for Aussie Mob. It focuses on making public clan data easier to browse, search, and present in a modern dashboard-style layout.

Key goals:

- Show the full public Aussie Mob clan roster where available
- Display important clan stats at a glance
- Highlight leadership and top-performing members
- Keep the design clean, dark, and RuneScape-community friendly
- Provide a professional preview that can be shared with N5W

## Features

- **Live clan roster** from RuneScape public clan hiscores
- **Automatic refresh** every 300 seconds
- **Member search** by name or rank
- **Total clan XP** and public kill totals
- **Top player card** based on total XP
- **Leadership section** for Owner, Deputy Owner, Overseer, Coordinator, Organiser, and Admin ranks
- **Rank summary** showing clan structure counts
- **Boss hiscores preview** sorted by public kill values
- **RuneMetrics profile cards** for top XP members
- **RunePixels-style external links** for player and clan profile navigation
- **Responsive layout** for desktop and mobile screens

## Data Sources

The tracker uses public RuneScape community data:

- RuneScape clan hiscores member feed
- RuneMetrics public player profile data
- RunePixels profile links for convenient player navigation

The app does not require private credentials, clan login access, or manual roster uploads.

## Current Clan Focus

- **Clan:** Aussie Mob
- **Owner:** N5W
- **Roster cap:** Up to 500 public clan members
- **Refresh interval:** 300 seconds
- **Main public fields:** Clanmate, Clan Rank, Total XP, Kills
- **RuneMetrics fields:** Combat Level, Total Level, Quest Counts, Recent Activity

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- TanStack Query
- Lucide React icons

## Project Structure

```txt
src/
  App.tsx              # App routing
  pages/
    Index.tsx          # Main Aussie Mob tracker page
  components/
    ui/                # shadcn/ui components
public/
  assets/              # Static assets
```

## Notes for Review

This is a fan-made community tracker and is not affiliated with Jagex. RuneScape is a trademark of Jagex.

The design is intentionally inspired by RunePixels-style clan pages while giving Aussie Mob its own dedicated presentation. It is suitable as a proof of concept for a clan homepage, roster tracker, or community stats dashboard.

## Status

Ready for review by **N5W**.