import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
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

const CLAN_NAME = "Aussie Mob";
const CLAN_REFRESH_INTERVAL = 300_000;

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

type ClanMember = {
  name: string;
  rank: string;
  totalXp: number;
  kills: number;
};

type ClanData = {
  members: ClanMember[];
  fetchedAt: string;
};

const fallbackMembers: ClanMember[] = [
  { name: "N5W", rank: "Owner", totalXp: 5_475_467_705, kills: 44 },
  { name: "RockyWoof", rank: "Deputy Owner", totalXp: 2_478_849_245, kills: 0 },
  { name: "51MON 53Z", rank: "Deputy Owner", totalXp: 617_441_967, kills: 0 },
  { name: "4StarBall", rank: "Overseer", totalXp: 1_650_629_081, kills: 0 },
  { name: "DoctorFranky", rank: "Coordinator", totalXp: 1_203_549_715, kills: 0 },
  { name: "ixSora", rank: "Coordinator", totalXp: 2_162_120_039, kills: 0 },
  { name: "Rimbil", rank: "Admin", totalXp: 1_112_606_254, kills: 0 },
  { name: "VNOLAG", rank: "Admin", totalXp: 2_419_830_609, kills: 0 },
  { name: "BorisKetland", rank: "General", totalXp: 3_689_851_667, kills: 0 },
  { name: "BabyGawrGura", rank: "General", totalXp: 3_124_455_950, kills: 4 },
  { name: "Chilichop", rank: "General", totalXp: 2_830_605_124, kills: 0 },
  { name: "CashisKingxx", rank: "General", totalXp: 2_752_321_162, kills: 0 },
  { name: "Roamy", rank: "General", totalXp: 2_770_676_346, kills: 0 },
  { name: "SZ7", rank: "Captain", totalXp: 1_432_904_724, kills: 11 },
  { name: "sbQ", rank: "Recruit", totalXp: 104_960_989, kills: 572 },
];

const tabs = ["All", "Boss Kills", "Total XP", "Owners", "Admins", "Generals", "Captains", "Recruits"];

function parseClanMembers(text: string): ClanMember[] {
  return text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .filter((line, index) => index !== 0 || !line.toLowerCase().startsWith("clanmate,"))
    .map((line) => {
      const [name, rank, totalXp, kills] = line.split(",");

      return {
        name: name?.trim() ?? "Unknown",
        rank: rank?.trim() ?? "Recruit",
        totalXp: Number(totalXp ?? 0),
        kills: Number(kills ?? 0),
      };
    })
    .filter((member) => member.name !== "Unknown");
}

async function fetchClanData(): Promise<ClanData> {
  const response = await fetch(
    `https://secure.runescape.com/m=clan-hiscores/members_lite.ws?clanName=${encodeURIComponent(CLAN_NAME)}`,
    { headers: { Accept: "text/plain" } },
  );

  if (!response.ok) {
    throw new Error("Unable to load RuneScape clan data");
  }

  return {
    members: parseClanMembers(await response.text()),
    fetchedAt: new Date().toISOString(),
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-AU").format(value);
}

function formatShort(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function formatUpdatedTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

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
  const Icon = type === "Total XP" ? Zap : type === "Leadership" ? Shield : Swords;
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
  const { data, dataUpdatedAt, error, isFetching } = useQuery({
    queryKey: ["clan-data", CLAN_NAME],
    queryFn: fetchClanData,
    refetchInterval: CLAN_REFRESH_INTERVAL,
    staleTime: CLAN_REFRESH_INTERVAL,
  });

  const members = data?.members.length ? data.members : fallbackMembers;
  const liveMemberCount = data?.members.length ?? members.length;
  const totalXp = members.reduce((sum, member) => sum + member.totalXp, 0);
  const totalKills = members.reduce((sum, member) => sum + member.kills, 0);
  const topMember = [...members].sort((a, b) => b.totalXp - a.totalXp)[0];
  const updatedAt = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : data?.fetchedAt;
  const updateLabel = updatedAt ? formatUpdatedTime(updatedAt) : "loading live data";
  const leaders = members
    .filter((member) => ["Owner", "Deputy Owner", "Overseer", "Coordinator", "Organiser", "Admin"].includes(member.rank))
    .slice(0, 7);
  const leaderboard = [...members]
    .sort((a, b) => b.totalXp - a.totalXp)
    .slice(0, 15)
    .map((member) => [member.name, formatShort(member.totalXp)]);
  const activity = [...members]
    .sort((a, b) => b.kills - a.kills || b.totalXp - a.totalXp)
    .slice(0, 14)
    .map((member) => [
      member.name,
      member.kills > 0 ? "Boss Kills" : member.rank === "Owner" || member.rank === "Deputy Owner" ? "Leadership" : "Total XP",
      member.kills > 0
        ? `${formatNumber(member.kills)} tracked boss kills`
        : `${formatShort(member.totalXp)} total XP • ${member.rank}`,
      updateLabel,
      isFetching ? "refreshing" : "live",
    ]);

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
              [Users, "Members", formatNumber(liveMemberCount)],
              [Crown, "Top Rank", topMember?.rank ?? "Owner"],
              [Trophy, "Total XP", formatShort(totalXp)],
            ].map(([Icon, label, value]) => {
              const StatIcon = Icon as typeof Users;
              return (
                <div key={String(label)} className="text-center">
                  <StatIcon className="mx-auto mb-1 h-5 w-5 text-[var(--am-gold)]" />
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{String(label)}</p>
                  <p className="mt-1 font-serif text-xl font-bold text-slate-100 md:text-2xl">{String(value)}</p>
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
                <p className="font-serif text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--am-gold)]">Live RuneScape Clan Data</p>
                <h3 className="mt-1 text-sm font-bold text-white">Aussie Mob hiscores refresh every 300 seconds</h3>
                <p className="mt-1 text-[12px] text-slate-400">
                  Showing {formatNumber(liveMemberCount)} members from the public clan hiscores. Last update: {updateLabel}.
                  {error ? " Live fetch failed, so cached launch data is displayed." : ""}
                </p>
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

          <Panel className="p-4">
            <SectionTitle right={`${formatNumber(members.length)} listed`}>Live Clan Members</SectionTitle>
            <div className="mt-3 max-h-[430px] overflow-y-auto pr-1">
              <div className="grid grid-cols-[1fr_92px_74px] gap-2 border-b border-[var(--am-line)] pb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 sm:grid-cols-[1fr_120px_110px_70px]">
                <span>Clanmate</span>
                <span>Rank</span>
                <span className="text-right">Total XP</span>
                <span className="hidden text-right sm:block">Kills</span>
              </div>
              {members.map((member) => (
                <div key={`${member.name}-${member.rank}`} className="grid grid-cols-[1fr_92px_74px] gap-2 border-b border-[var(--am-line)] py-2 text-[11px] last:border-0 sm:grid-cols-[1fr_120px_110px_70px]">
                  <span className="truncate font-bold text-slate-200">{member.name}</span>
                  <span className="truncate text-[var(--am-gold-bright)]">{member.rank}</span>
                  <span className="text-right font-bold text-emerald-400">{formatShort(member.totalXp)}</span>
                  <span className="hidden text-right text-slate-400 sm:block">{formatNumber(member.kills)}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-3">
          <Panel className="p-4">
            <SectionTitle>Clan Owners</SectionTitle>
            <ul className="mt-3 divide-y divide-[var(--am-line)]">
              {leaders.map((member, index) => (
                <li key={member.name} className="flex items-center gap-3 py-3">
                  <KeyRound className={`h-3.5 w-3.5 ${index === 0 ? "text-[var(--am-gold)]" : "text-slate-500"}`} />
                  <div className="relative h-7 w-7 overflow-hidden rounded-lg bg-[var(--am-panel-soft)] ring-1 ring-[var(--am-border)]">
                    <img src="/assets/placeholder.svg" alt="placeholder" className="h-full w-full object-cover opacity-35" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-bold text-slate-200">{member.name}</p>
                    <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">{member.rank}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-4">
            <SectionTitle>Clan Progress</SectionTitle>
            <div className="mt-3 flex gap-2 text-[10px] font-bold uppercase tracking-[0.12em]">
              <span className="text-[var(--am-gold-bright)]">Hiscores</span>
              <span className="text-slate-600">Live</span>
            </div>
            <div className="mt-3 space-y-4">
              {[
                ["Members", "Tracked by RuneScape", formatNumber(liveMemberCount)],
                ["Total XP", "Combined clan total", formatShort(totalXp)],
                ["Boss Kills", "Public clan hiscores", formatNumber(totalKills)],
              ].map(([label, helper, value]) => (
                <div key={label} className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold text-white">{label}</p>
                    <p className="text-[10px] text-slate-600">{helper}</p>
                  </div>
                  <p className="text-right font-serif text-lg font-black text-emerald-400">{value}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-4">
            <SectionTitle>Total XP</SectionTitle>
            <div className="mt-3 flex gap-4 text-[10px] font-bold uppercase tracking-[0.12em]">
              <span className="text-[var(--am-gold-bright)]">Live</span>
              <span className="text-slate-600">Top 15</span>
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
