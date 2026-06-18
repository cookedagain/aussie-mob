import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ChevronDown,
  Crown,
  ExternalLink,
  LogIn,
  RefreshCcw,
  Search,
  Shield,
  Swords,
  Users,
  Zap,
} from "lucide-react";

const CLAN_NAME = "Aussie Mob";
const CLAN_REFRESH_INTERVAL = 300_000;

const navItems = ["Home", "Players", "Clans", "Drops", "Skill Hub", "Minigame Hub"];
const trackerTabs = ["XP", "Double XP"];
const modeTabs = ["All", "Mains", "Ironman", "Hardcore", "Group Ironman"];
const periodTabs = ["Today", "Week", "Month"];
const skillIcons = [
  "Overall",
  "Attack",
  "Defence",
  "Strength",
  "Constitution",
  "Ranged",
  "Prayer",
  "Magic",
  "Cooking",
  "Woodcutting",
  "Fletching",
  "Fishing",
  "Firemaking",
  "Crafting",
  "Smithing",
  "Mining",
  "Herblore",
  "Agility",
  "Thieving",
  "Slayer",
  "Farming",
  "Runecrafting",
  "Hunter",
  "Construction",
  "Summoning",
  "Dungeoneering",
  "Divination",
  "Invention",
  "Archaeology",
  "Necromancy",
];

const communityNotes = [
  "More than a clan, a community — Aussie banter, PvM help, skilling, and learner-friendly events.",
  "Tracker refresh: every 300 seconds. RunePixels competitions reference: every 15 minutes.",
  "Reset reference: day 5 a.m GMT, week Sunday 5 a.m GMT, month on the 1st at 5 a.m GMT.",
];

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

function playerSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[var(--am-border)] bg-[var(--am-panel)] shadow-[0_18px_50px_rgba(0,0,0,0.38)] ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--am-line)] pb-3">
      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--am-gold)]">{children}</h2>
      {right && <div className="text-[11px] font-semibold text-slate-500">{right}</div>}
    </div>
  );
}

function LogoMark({ size = "large" }: { size?: "small" | "large" }) {
  return (
    <div className={`${size === "large" ? "h-24 w-24 text-5xl" : "h-9 w-9 text-lg"} relative grid shrink-0 place-items-center rounded-2xl border border-[var(--am-gold-dim)] bg-[var(--am-brown)] shadow-[0_0_26px_rgba(216,171,79,0.16)]`}>
      <div className="absolute inset-1 rounded-xl border border-white/10" />
      <span aria-hidden="true">🦘</span>
    </div>
  );
}

function PillRow({ items, active = 0 }: { items: string[]; active?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <button
          key={item}
          className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] transition ${
            index === active
              ? "border-[var(--am-gold-dim)] bg-[var(--am-gold)] text-[var(--am-bg)]"
              : "border-[var(--am-border)] bg-[var(--am-header)] text-slate-500 hover:text-slate-200"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function PlayerAvatar({ name }: { name: string }) {
  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[var(--am-panel-soft)] ring-1 ring-[var(--am-border)]">
      <img src="/assets/placeholder.svg" alt="placeholder" className="h-full w-full object-cover opacity-35" />
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[var(--am-gold)]">
        {name.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

function HiscoreTable({ members }: { members: ClanMember[] }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--am-border)] bg-[var(--am-header)]">
      <div className="grid grid-cols-[48px_1fr_92px] gap-2 border-b border-[var(--am-line)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 sm:grid-cols-[58px_1.4fr_130px_130px_88px]">
        <span>#</span>
        <span>Name</span>
        <span className="hidden sm:block">Rank</span>
        <span className="text-right">XP</span>
        <span className="hidden text-right sm:block">Kills</span>
      </div>
      <div className="max-h-[610px] overflow-y-auto">
        {members.map((member, index) => (
          <a
            key={`${member.name}-${member.rank}`}
            href={`https://runepixels.com/players/${playerSlug(member.name)}`}
            target="_blank"
            rel="noreferrer"
            className="grid grid-cols-[48px_1fr_92px] items-center gap-2 border-b border-[var(--am-line)] px-3 py-2 text-xs transition last:border-0 hover:bg-[var(--am-panel-soft)] sm:grid-cols-[58px_1.4fr_130px_130px_88px]"
          >
            <span className="font-black text-slate-500">{index + 1}</span>
            <span className="flex min-w-0 items-center gap-3">
              <PlayerAvatar name={member.name} />
              <span className="min-w-0">
                <span className="block truncate font-black text-slate-100">{member.name}</span>
                <span className="block truncate text-[10px] uppercase tracking-[0.12em] text-slate-600 sm:hidden">{member.rank}</span>
              </span>
            </span>
            <span className="hidden truncate text-[var(--am-gold-bright)] sm:block">{member.rank}</span>
            <span className="text-right font-black text-emerald-400">{formatShort(member.totalXp)}</span>
            <span className="hidden text-right font-semibold text-slate-400 sm:block">{formatNumber(member.kills)}</span>
          </a>
        ))}
      </div>
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
  const sortedByXp = [...members].sort((a, b) => b.totalXp - a.totalXp);
  const sortedByKills = [...members].sort((a, b) => b.kills - a.kills || b.totalXp - a.totalXp);
  const topMember = sortedByXp[0];
  const leaders = members
    .filter((member) => ["Owner", "Deputy Owner", "Overseer", "Coordinator", "Organiser", "Admin"].includes(member.rank))
    .slice(0, 8);
  const rankCounts = members.reduce<Record<string, number>>((counts, member) => {
    counts[member.rank] = (counts[member.rank] ?? 0) + 1;
    return counts;
  }, {});
  const updatedAt = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : data?.fetchedAt;
  const updateLabel = updatedAt ? formatUpdatedTime(updatedAt) : "loading live data";

  return (
    <main className="min-h-screen bg-[var(--am-bg)] text-slate-300 selection:bg-[var(--am-gold)] selection:text-[var(--am-bg)]">
      <div className="pointer-events-none fixed inset-0 bg-[var(--am-bg)]" />

      <header className="sticky top-0 z-30 border-b border-[var(--am-line)] bg-[var(--am-header)]/95 backdrop-blur">
        <div className="mx-auto flex min-h-14 max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-2">
          <a href="#" className="flex items-center gap-3">
            <LogoMark size="small" />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--am-gold-bright)]">Aussie Mob</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">RunePixels style clan tracker</p>
            </div>
          </a>

          <nav className="hidden items-center md:flex">
            {navItems.map((item, index) => (
              <a
                href="#"
                key={item}
                className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition hover:bg-[var(--am-panel-soft)] hover:text-[var(--am-gold-bright)] ${index === 2 ? "bg-[var(--am-panel-soft)] text-[var(--am-gold-bright)]" : "text-slate-500"}`}
              >
                {item} {index > 1 && <ChevronDown className="ml-1 inline h-3 w-3" />}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden h-9 items-center rounded-full border border-[var(--am-border)] bg-[var(--am-bg)] px-3 lg:flex">
              <Search className="mr-2 h-3.5 w-3.5 text-slate-600" />
              <span className="w-32 text-[11px] text-slate-600">Search player...</span>
            </div>
            <button className="inline-flex h-9 items-center gap-1 rounded-full border border-[var(--am-gold-dim)] bg-[var(--am-brown)] px-4 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--am-gold-bright)] hover:bg-[var(--am-brown-light)]">
              <LogIn className="h-3.5 w-3.5" /> Login
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1180px] px-4 py-6">
        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Panel className="p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <LogoMark />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-500">Clans / Aussie Mob</p>
                <h1 className="mt-1 font-serif text-5xl font-black uppercase tracking-[0.08em] text-[var(--am-gold-bright)] sm:text-6xl">
                  Aussie Mob
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  A RunePixels-inspired clan hub for Aussie Mob, focused on live hiscores, clean tables, fast filters,
                  and compact RuneScape tracker stats.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href="https://runepixels.com/clans/aussie-mob"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--am-gold)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--am-bg)] hover:bg-[var(--am-gold-bright)]"
                  >
                    View on RunePixels <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--am-border)] bg-[var(--am-header)] px-4 py-2 text-[11px] font-bold text-slate-500">
                    <RefreshCcw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-[var(--am-gold)]" : ""}`} />
                    Updates every 300s
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionTitle right={isFetching ? "Refreshing" : "Live"}>Tracker Status</SectionTitle>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-[var(--am-header)] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Last update</p>
                <p className="mt-1 text-lg font-black text-white">{updateLabel}</p>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                {error
                  ? "RuneScape live data could not be reached, so the page is showing cached Aussie Mob launch data."
                  : "Live member data is pulled from RuneScape public clan hiscores and refreshed automatically."}
              </p>
            </div>
          </Panel>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Users, "Members", formatNumber(liveMemberCount), "Public clan roster"],
            [Zap, "Total XP", formatShort(totalXp), "Combined member XP"],
            [Swords, "Boss Kills", formatNumber(totalKills), "Tracked hiscore kills"],
            [Crown, "Top Player", topMember?.name ?? "Loading", topMember ? formatShort(topMember.totalXp) : "--"],
          ].map(([Icon, label, value, helper]) => {
            const StatIcon = Icon as typeof Users;
            return (
              <Panel key={String(label)} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{String(label)}</p>
                    <p className="mt-1 truncate font-serif text-2xl font-black text-slate-100">{String(value)}</p>
                    <p className="mt-1 text-[11px] text-slate-600">{String(helper)}</p>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--am-brown)] text-[var(--am-gold)] ring-1 ring-[var(--am-gold-dim)]">
                    <StatIcon className="h-5 w-5" />
                  </div>
                </div>
              </Panel>
            );
          })}
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Panel className="p-5">
              <SectionTitle right="RunePixels reference filters">Clans</SectionTitle>
              <div className="mt-4 space-y-3">
                <PillRow items={trackerTabs} />
                <PillRow items={modeTabs} />
                <PillRow items={periodTabs} />
              </div>
              <div className="mt-5 grid grid-cols-6 gap-2 sm:grid-cols-10 lg:grid-cols-[repeat(15,minmax(0,1fr))]">
                {skillIcons.map((skill, index) => (
                  <button
                    key={skill}
                    title={skill}
                    className={`grid h-10 place-items-center rounded-xl border text-[10px] font-black transition ${
                      index === 0
                        ? "border-[var(--am-gold-dim)] bg-[var(--am-gold)] text-[var(--am-bg)]"
                        : "border-[var(--am-border)] bg-[var(--am-header)] text-slate-500 hover:text-[var(--am-gold-bright)]"
                    }`}
                  >
                    {skill.slice(0, 2).toUpperCase()}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionTitle right={`${formatNumber(members.length)} listed`}>Clan Hiscores</SectionTitle>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Today</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Total clan experience on roster: <strong className="text-emerald-400">{formatNumber(totalXp)}</strong>
                  </p>
                </div>
                <PillRow items={["All", "XP", "Kills"]} />
              </div>
              <HiscoreTable members={sortedByXp} />
            </Panel>
          </div>

          <aside className="space-y-4">
            <Panel className="p-5">
              <SectionTitle right="Community">Notice</SectionTitle>
              <div className="mt-4 space-y-3">
                {communityNotes.map((note) => (
                  <div key={note} className="flex gap-3 rounded-2xl bg-[var(--am-header)] p-3">
                    <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[var(--am-gold)]" />
                    <p className="text-xs leading-5 text-slate-400">{note}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionTitle right="Top ranks">Leadership</SectionTitle>
              <div className="mt-3 space-y-2">
                {leaders.map((member, index) => (
                  <a
                    key={member.name}
                    href={`https://runepixels.com/players/${playerSlug(member.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-[var(--am-panel-soft)]"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--am-brown)] text-[var(--am-gold)] ring-1 ring-[var(--am-gold-dim)]">
                      {index === 0 ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black text-slate-100">{member.name}</p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">{member.rank}</p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-slate-600" />
                  </a>
                ))}
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionTitle right="Roster">Rank Summary</SectionTitle>
              <div className="mt-3 space-y-2">
                {Object.entries(rankCounts).slice(0, 9).map(([rank, count]) => (
                  <div key={rank} className="flex items-center justify-between rounded-xl bg-[var(--am-header)] px-3 py-2">
                    <span className="text-xs font-bold text-slate-300">{rank}</span>
                    <span className="font-black text-[var(--am-gold-bright)]">{count}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionTitle right="Kills">Boss Hiscores</SectionTitle>
              <div className="mt-3 space-y-2">
                {sortedByKills.slice(0, 8).map((member, index) => (
                  <div key={`${member.name}-${member.kills}`} className="grid grid-cols-[28px_1fr_auto] items-center gap-2 rounded-xl px-2 py-2 hover:bg-[var(--am-panel-soft)]">
                    <span className="text-xs font-black text-slate-500">{index + 1}</span>
                    <span className="truncate text-xs font-bold text-slate-200">{member.name}</span>
                    <span className="font-black text-emerald-400">{formatNumber(member.kills)}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </aside>
        </section>

        <footer className="mt-6 flex flex-col gap-3 border-t border-[var(--am-line)] py-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>RuneScape is a trademark of Jagex. This fan-made Aussie Mob tracker is styled with RunePixels as a reference.</p>
          <div className="flex gap-3">
            <a href="https://runepixels.com/clans/aussie-mob" target="_blank" rel="noreferrer" className="font-bold text-[var(--am-gold-bright)] hover:text-white">
              RunePixels
            </a>
            <a href="https://secure.runescape.com/m=clan-hiscores/members_lite.ws?clanName=Aussie%20Mob" target="_blank" rel="noreferrer" className="font-bold text-[var(--am-gold-bright)] hover:text-white">
              RuneScape Hiscores
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default Index;
