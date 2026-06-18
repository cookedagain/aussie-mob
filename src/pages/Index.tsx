import type { ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  ExternalLink,
  KeyRound,
  LogIn,
  Search,
  Shield,
  Swords,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";

const navItems = ["Home", "Members", "Progress", "Events"];

const events = [
  {
    title: "Boss Mass - Zamorak & Snacks",
    date: "Tomorrow",
    time: "08:00 PM AEST",
    copy:
      "Bring your best gear and your worst jokes. Learners welcome for a relaxed Aussie Mob boss night.",
  },
  {
    title: "Citadel Capping & Clan Banter",
    date: "Saturday",
    time: "06:30 PM AEST",
    copy:
      "Weekly skilling session at the citadel with raffles, voice chat, and a few cheeky drop parties.",
  },
];

const activity = [
  ["Boomerang", "Skills", "142,000,000 XP in Fishing", "18/06/2026, 15:42", "just now"],
  ["Drop Bear", "Boss Kills", "I killed 7 Ambassadors.", "18/06/2026, 15:35", "7 minutes ago"],
  ["Koala K0", "Misc", "Solved an archaeological mystery.", "18/06/2026, 15:27", "12 minutes ago"],
  ["Wattle", "Boss Loot", "I found a dragon rider lance", "18/06/2026, 15:18", "21 minutes ago"],
  ["Aussie Gaz", "Boss Kills", "I killed 24 Rakshas.", "18/06/2026, 15:10", "29 minutes ago"],
  ["Dingo Dan", "Skills", "Levelled up Strength.", "18/06/2026, 14:56", "43 minutes ago"],
  ["Lamington", "Skills", "125,000,000 XP in Archaeology", "18/06/2026, 14:43", "56 minutes ago"],
  ["Bondi Mage", "Boss Kills", "I killed 5 Amascuts.", "18/06/2026, 14:41", "58 minutes ago"],
  ["Vegemite", "Quests", "Quest complete: City of Senntisten", "18/06/2026, 14:07", "1 hour ago"],
  ["Outbacked", "Boss Loot", "I found a dormant anima core helm", "18/06/2026, 13:55", "1 hour ago"],
  ["Platypus", "Boss Kills", "I killed 32 Arch-Glacors.", "18/06/2026, 13:48", "1 hour ago"],
  ["SouthernX", "Boss Loot", "I found a seers' ring", "18/06/2026, 13:24", "2 hours ago"],
  ["Nullarbor", "Boss Kills", "I killed 29 King Black Dragons.", "18/06/2026, 13:17", "2 hours ago"],
  ["Gumleaf", "Boss Loot", "I found a dragon hatchet", "18/06/2026, 13:16", "2 hours ago"],
];

const owners = [
  ["Wombat", "Founder"],
  ["Aussie Belle", "Deputy Owner"],
  ["Kangaroo Jack", "Deputy Owner"],
  ["Tas Devil", "Coordinator"],
  ["Bluey", "Overseer"],
  ["Bindi", "Admin"],
  ["Servo", "Admin"],
];

const leaderboard = [
  ["Billabong", "22.0M"],
  ["Prevented", "5.8M"],
  ["Gumnut", "5.6M"],
  ["Toastie", "4.5M"],
  ["N i g e l", "4.5M"],
  ["Belgi", "3.9M"],
  ["BeastoEast", "3.0M"],
  ["Trajas", "3.0M"],
  ["Trioz", "2.8M"],
  ["Navee", "2.5M"],
  ["Leng Spec", "2.5M"],
  ["Fjolleh", "2.4M"],
  ["Kevinke6", "2.4M"],
  ["Spirit Sabre", "2.4M"],
  ["Kwik Chat", "2.4M"],
];

const tabs = ["All", "Boss Kills", "Boss Loot", "Pets", "Skills", "Quests", "Clue Scrolls", "Citadel"];

function SectionTitle({ children, right }: { children: string; right?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--am-border)] pb-3">
      <h2 className="font-serif text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--am-gold)]">
        {children}
      </h2>
      {right && <span className="text-[11px] text-slate-500">{right}</span>}
    </div>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-[var(--am-border)] bg-[var(--am-panel)] shadow-[0_18px_50px_rgba(0,0,0,0.45)] ${className}`}>
      {children}
    </section>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const Icon = type === "Skills" ? Zap : type === "Boss Loot" ? Trophy : type === "Quests" ? Shield : Swords;
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--am-panel-soft)] text-[var(--am-gold)] ring-1 ring-[var(--am-border)]">
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

function ActivityRow({ item }: { item: string[] }) {
  const [name, type, detail, date, ago] = item;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-[var(--am-line)] py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 gap-3">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-[var(--am-panel-soft)] ring-1 ring-[var(--am-border)]">
          <img src="/assets/placeholder.svg" alt="placeholder" className="h-full w-full object-cover opacity-35" />
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[var(--am-gold)]">
            {name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <p className="truncate text-[12px] font-bold text-slate-200">{name}</p>
            <span className="text-[10px] text-slate-500">{date}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
            <ActivityIcon type={type} />
            <span className="truncate">{detail}</span>
          </div>
        </div>
      </div>
      <div className="self-start whitespace-nowrap text-right text-[10px] text-slate-500 sm:pt-1">{ago}</div>
    </div>
  );
}

const Index = () => {
  return (
    <main className="min-h-screen bg-[var(--am-bg)] text-slate-300 selection:bg-[var(--am-gold)] selection:text-[var(--am-bg)]">
      <div className="pointer-events-none fixed inset-0 bg-[var(--am-bg)] opacity-95" />

      <header className="sticky top-0 z-30 border-b border-[var(--am-line)] bg-[var(--am-header)]/95 backdrop-blur">
        <div className="mx-auto flex h-10 max-w-[1120px] items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-full border border-[var(--am-gold)]/60 bg-[var(--am-panel)] text-[12px] shadow-[0_0_20px_rgba(216,171,79,0.18)]">
              🦘
            </div>
            <span className="font-serif text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--am-gold-bright)]">Aussie Mob</span>
          </div>

          <nav className="hidden items-center md:flex">
            {navItems.map((item, index) => (
              <a
                href="#"
                key={item}
                className={`border-x border-transparent px-5 py-3 text-[10px] uppercase tracking-[0.18em] transition hover:bg-[var(--am-panel-soft)] hover:text-[var(--am-gold-bright)] ${index === 0 ? "bg-[var(--am-panel-soft)] text-[var(--am-gold-bright)]" : "text-slate-500"}`}
              >
                {item} {index > 1 && <ChevronDown className="ml-1 inline h-3 w-3" />}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden h-7 items-center rounded-lg border border-[var(--am-border)] bg-[var(--am-bg)] px-2 lg:flex">
              <Search className="mr-2 h-3 w-3 text-slate-600" />
              <span className="w-28 text-[10px] text-slate-600">Search player...</span>
            </div>
            <button className="inline-flex h-7 items-center gap-1 rounded-lg border border-[var(--am-gold-dim)] bg-[var(--am-brown)] px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--am-gold-bright)] hover:bg-[var(--am-brown-light)]">
              <LogIn className="h-3 w-3" /> Login
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[var(--am-line)] bg-[var(--am-panel-soft)]">
        <div className="absolute inset-0 opacity-20">
          <img src="/assets/placeholder.svg" alt="placeholder" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-[var(--am-bg)]/70" />
        <div className="relative mx-auto grid max-w-[1120px] gap-6 px-3 py-8 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-center gap-5">
            <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full border-2 border-[var(--am-gold)] bg-[var(--am-panel)] shadow-[0_0_45px_rgba(216,171,79,0.28)]">
              <div className="absolute inset-2 rounded-full border border-white/10" />
              <span className="text-4xl">🦘</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.42em] text-slate-500">Welcome to</p>
              <h1 className="mt-1 font-serif text-5xl font-black uppercase tracking-[0.08em] text-[var(--am-gold-bright)] drop-shadow md:text-6xl">
                Aussie Mob
              </h1>
              <button className="mt-3 rounded-lg border border-[var(--am-gold-dim)] bg-[var(--am-gold)] px-5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--am-bg)] shadow-[0_6px_22px_rgba(216,171,79,0.2)] hover:bg-[var(--am-gold-bright)]">
                Apply to join Aussie Mob
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-xl border border-[var(--am-border)] bg-[var(--am-header)]/85 p-4 backdrop-blur md:min-w-[330px]">
            {[
              [Users, "Members", "499"],
              [Crown, "Citadel Tier", "7"],
              [Trophy, "Total Level", "3,168"],
            ].map(([Icon, label, value]) => {
              const StatIcon = Icon as typeof Users;
              return (
                <div key={String(label)} className="text-center">
                  <StatIcon className="mx-auto mb-1 h-5 w-5 text-[var(--am-gold)]" />
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{String(label)}</p>
                  <p className="mt-1 font-serif text-2xl font-bold text-slate-100">{String(value)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="relative mx-auto grid max-w-[1120px] gap-3 px-3 py-5 lg:grid-cols-[1fr_250px]">
        <div className="space-y-3">
          <Panel className="p-4">
            <div className="flex gap-3">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[var(--am-gold)]" />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--am-gold)]">Announcement</p>
                <h3 className="mt-1 text-sm font-bold text-white">New Aussie Mob Look</h3>
                <p className="mt-1 text-[12px] text-slate-400">Website is fully functioning again and back with a fresh Southern Cross shine!</p>
              </div>
              <button className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-[var(--am-panel-soft)] text-slate-500 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          </Panel>

          <Panel className="p-4">
            <SectionTitle right="Show All (10)">Upcoming Events</SectionTitle>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {events.map((event) => (
                <article key={event.title} className="group relative min-h-[112px] overflow-hidden rounded-xl border border-[var(--am-border)] bg-[var(--am-panel-soft)]">
                  <img src="/assets/placeholder.svg" alt="placeholder" className="absolute inset-0 h-full w-full object-cover opacity-25 transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[var(--am-bg)]/78" />
                  <div className="relative p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-black uppercase text-white">{event.title}</h3>
                      <span className="rounded-md bg-[var(--am-gold)] px-2 py-1 text-[9px] font-black uppercase text-[var(--am-bg)]">{event.date}</span>
                    </div>
                    <p className="mb-2 flex items-center gap-1 text-[11px] font-bold text-[var(--am-gold-bright)]"><CalendarDays className="h-3 w-3" /> {event.time}</p>
                    <p className="line-clamp-2 text-[11px] leading-5 text-slate-400">“{event.copy}”</p>
                    <a href="#" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--am-gold-bright)] hover:text-white">
                      View Event <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel className="p-4">
            <SectionTitle>Clan Activity</SectionTitle>
            <div className="mt-3 flex flex-wrap gap-1 border-b border-[var(--am-line)] pb-3">
              {tabs.map((tab, index) => (
                <button key={tab} className={`rounded-md px-2.5 py-1 text-[10px] font-bold ${index === 0 ? "bg-[var(--am-brown)] text-[var(--am-gold-bright)]" : "text-slate-500 hover:bg-[var(--am-panel-soft)] hover:text-slate-300"}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid gap-x-8 md:grid-cols-2">
              {activity.map((item) => <ActivityRow key={`${item[0]}-${item[2]}`} item={item} />)}
            </div>
            <div className="mt-4 flex justify-center gap-1">
              {["‹", "1", "2", "3", "4", "5", "›", "»"].map((page) => (
                <button key={page} className={`grid h-7 min-w-7 place-items-center rounded-md border border-[var(--am-border)] px-2 text-[10px] ${page === "1" ? "bg-[var(--am-brown-light)] text-[var(--am-gold-bright)]" : "bg-[var(--am-header)] text-slate-500 hover:text-white"}`}>
                  {page}
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-3">
          <Panel className="p-4">
            <SectionTitle>Clan Owners</SectionTitle>
            <ul className="mt-3 divide-y divide-[var(--am-line)]">
              {owners.map(([name, role], index) => (
                <li key={name} className="flex items-center gap-3 py-3">
                  <KeyRound className={`h-3.5 w-3.5 ${index === 0 ? "text-[var(--am-gold)]" : "text-slate-500"}`} />
                  <div className="relative h-7 w-7 overflow-hidden rounded-lg bg-[var(--am-panel-soft)] ring-1 ring-[var(--am-border)]">
                    <img src="/assets/placeholder.svg" alt="placeholder" className="h-full w-full object-cover opacity-35" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-slate-200">{name}</p>
                    <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">{role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-4">
            <SectionTitle>Clan Progress</SectionTitle>
            <div className="mt-3 flex gap-2 text-[10px] font-bold uppercase tracking-[0.12em]">
              <span className="text-[var(--am-gold-bright)]">Total XP Gain</span>
              <span className="text-slate-600">Boss Kills</span>
            </div>
            <div className="mt-3 space-y-4">
              {[
                ["Today", "Resets in 9h 25m", "125.2M"],
                ["This Week", "Resets in 3d 9h", "777.1M"],
                ["This Month", "Resets in 12d 9h", "4.3B"],
              ].map(([label, reset, value]) => (
                <div key={label} className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-white">{label}</p>
                    <p className="text-[10px] text-slate-600">{reset}</p>
                  </div>
                  <p className="font-serif text-lg font-black text-emerald-400">{value}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-4">
            <SectionTitle>XP Gain</SectionTitle>
            <div className="mt-3 flex gap-4 text-[10px] font-bold uppercase tracking-[0.12em]">
              <span className="text-[var(--am-gold-bright)]">Daily</span>
              <span className="text-slate-600">Weekly</span>
              <span className="text-slate-600">Monthly</span>
            </div>
            <div className="mt-3 space-y-1">
              {leaderboard.map(([name, xp], index) => (
                <div key={name} className="grid grid-cols-[24px_1fr_auto] items-center gap-2 rounded-lg px-1.5 py-1.5 text-[11px] hover:bg-[var(--am-panel-soft)]">
                  <span className="text-slate-500">{index + 1}</span>
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="h-6 w-6 shrink-0 overflow-hidden rounded-lg bg-[var(--am-panel-soft)] ring-1 ring-[var(--am-border)]">
                      <img src="/assets/placeholder.svg" alt="placeholder" className="h-full w-full object-cover opacity-35" />
                    </div>
                    <span className="truncate font-bold text-slate-300">{name}</span>
                  </div>
                  <span className="font-black text-emerald-400">{xp}</span>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>

      <div className="fixed bottom-5 right-5 hidden rounded-full border border-[var(--am-border)] bg-[var(--am-header)]/90 p-2 text-slate-500 shadow-2xl md:flex">
        <ChevronLeft className="h-4 w-4" />
        <ChevronRight className="h-4 w-4" />
      </div>
    </main>
  );
};

export default Index;
