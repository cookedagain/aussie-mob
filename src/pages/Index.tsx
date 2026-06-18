import type { ReactNode } from "react";
import { useState } from "react";
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
const MAX_CLAN_MEMBERS = 500;
const RUNEMETRICS_PROFILE_LIMIT = 8;
const CLAN_HISCORES_URL = `https://secure.runescape.com/m=clan-hiscores/members_lite.ws?clanName=${encodeURIComponent(CLAN_NAME)}`;
const CLAN_PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(CLAN_HISCORES_URL)}`;
const RUNEMETRICS_PROFILE_BASE_URL = "https://apps.runescape.com/runemetrics/profile/profile";

const navItems = ["Home", "Players", "Clans", "Drops", "Skill Hub", "Minigame Hub"];
const availableFields = ["Clanmate", "Clan Rank", "Total XP", "Kills"];
const runeMetricsFields = ["Combat Level", "Total Level", "Quest Counts", "Recent Activity"];
const combinedFields = [...availableFields, ...runeMetricsFields];
const rankOrder = ["Owner", "Deputy Owner", "Overseer", "Coordinator", "Organiser", "Admin", "General", "Captain", "Lieutenant", "Sergeant", "Corporal", "Recruit"];

function rankOrderIndex(rank: string) {
  const index = rankOrder.indexOf(rank);
  return index === -1 ? rankOrder.length : index;
}

const communityNotes = [
  `The member table loads the full public RuneScape clan roster, capped at the clan maximum of ${MAX_CLAN_MEMBERS} members.`,
  "RuneMetrics enrichment is limited to the top members to avoid excessive player profile requests.",
  "Both clan hiscores and RuneMetrics refresh every 300 seconds; neither source offers true push realtime updates.",
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
  source: string;
};

type ClanDataSource = {
  label: string;
  url: string;
};

type RuneMetricsActivity = {
  date?: string;
  details?: string;
  text?: string;
};

type RuneMetricsProfile = {
  name: string;
  combatlevel?: number;
  totalskill?: number;
  totalxp?: number;
  questscomplete?: number;
  questsstarted?: number;
  questsnotstarted?: number;
  activities?: RuneMetricsActivity[];
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
    .filter((member) => member.name !== "Unknown" && Number.isFinite(member.totalXp) && Number.isFinite(member.kills))
    .slice(0, MAX_CLAN_MEMBERS);
}

function clanDataSources(): ClanDataSource[] {
  return [
    { label: "RuneScape", url: CLAN_HISCORES_URL },
    { label: "CorsProxy", url: `https://corsproxy.io/?url=${encodeURIComponent(CLAN_HISCORES_URL)}` },
    { label: "AllOrigins", url: CLAN_PROXY_URL },
  ];
}

async function fetchText(url: string, timeoutMs = 7000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: { Accept: "text/plain" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Unable to load Aussie Mob clan data");
    }

    return await response.text();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function parseAndValidateClanText(text: string) {
  const members = parseClanMembers(text);

  if (members.length <= fallbackMembers.length) {
    throw new Error("Clan response did not contain the full Aussie Mob roster");
  }

  return members;
}

async function fetchClanData(): Promise<ClanData> {
  for (const source of clanDataSources()) {
    try {
      return {
        members: parseAndValidateClanText(await fetchText(source.url)),
        fetchedAt: new Date().toISOString(),
        source: source.label,
      };
    } catch {
      // Try the next browser-accessible source.
    }
  }

  throw new Error("Unable to load the full Aussie Mob roster from RuneScape or the configured CORS proxies");
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });

  if (!response.ok) {
    throw new Error("Unable to load RuneMetrics profile data");
  }

  return response.json() as Promise<T>;
}

function runeMetricsUrl(name: string) {
  return `${RUNEMETRICS_PROFILE_BASE_URL}?user=${encodeURIComponent(name)}&activities=5`;
}

async function fetchRuneMetricsProfile(name: string): Promise<RuneMetricsProfile | null> {
  const directUrl = runeMetricsUrl(name);

  try {
    return await fetchJson<RuneMetricsProfile>(directUrl);
  } catch {
    try {
      return await fetchJson<RuneMetricsProfile>(`https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`);
    } catch {
      return null;
    }
  }
}

async function fetchRuneMetricsProfiles(members: ClanMember[]) {
  const results = await Promise.all(members.map((member) => fetchRuneMetricsProfile(member.name)));
  return results.filter((profile): profile is RuneMetricsProfile => Boolean(profile?.name));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-AU").format(value);
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

function RuneMetricsCard({ profile }: { profile: RuneMetricsProfile }) {
  const latestActivity = profile.activities?.[0];

  return (
    <a
      href={`https://runepixels.com/players/${playerSlug(profile.name)}`}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl bg-[var(--am-header)] p-3 transition hover:bg-[var(--am-panel-soft)]"
    >
      <div className="flex items-center gap-3">
        <PlayerAvatar name={profile.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-black text-slate-100">{profile.name}</p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">RuneMetrics profile</p>
        </div>
        <ExternalLink className="h-3 w-3 text-slate-600" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-[var(--am-bg)] p-2">
          <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Combat</p>
          <p className="font-black text-[var(--am-gold-bright)]">{profile.combatlevel ?? "--"}</p>
        </div>
        <div className="rounded-xl bg-[var(--am-bg)] p-2">
          <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Total</p>
          <p className="font-black text-[var(--am-gold-bright)]">{profile.totalskill ?? "--"}</p>
        </div>
        <div className="rounded-xl bg-[var(--am-bg)] p-2">
          <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Quests</p>
          <p className="font-black text-[var(--am-gold-bright)]">{profile.questscomplete ?? "--"}</p>
        </div>
      </div>
      {latestActivity && (
        <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-slate-500">
          {latestActivity.text || latestActivity.details || "Recent activity available"}
        </p>
      )}
    </a>
  );
}

function HiscoreTable({ members }: { members: ClanMember[] }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--am-border)] bg-[var(--am-header)]">
      <div className="grid grid-cols-[44px_minmax(0,1fr)_104px] gap-2 border-b border-[var(--am-line)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 sm:grid-cols-[58px_1.4fr_140px_150px_88px]">
        <span>#</span>
        <span>Clanmate</span>
        <span className="hidden sm:block">Rank</span>
        <span className="text-right">Total XP</span>
        <span className="hidden text-right sm:block">Kills</span>
      </div>
      <div className="max-h-[650px] overflow-y-auto">
        {members.map((member, index) => (
          <a
            key={`${member.name}-${member.rank}`}
            href={`https://runepixels.com/players/${playerSlug(member.name)}`}
            target="_blank"
            rel="noreferrer"
            className="grid grid-cols-[44px_minmax(0,1fr)_104px] items-center gap-2 border-b border-[var(--am-line)] px-3 py-2 text-xs transition last:border-0 hover:bg-[var(--am-panel-soft)] sm:grid-cols-[58px_1.4fr_140px_150px_88px]"
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
            <span className="text-right font-black text-emerald-400">{formatNumber(member.totalXp)}</span>
            <span className="hidden text-right font-semibold text-slate-400 sm:block">{formatNumber(member.kills)}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, dataUpdatedAt, error, isFetching } = useQuery({
    queryKey: ["clan-data", CLAN_NAME],
    queryFn: fetchClanData,
    refetchInterval: CLAN_REFRESH_INTERVAL,
    staleTime: CLAN_REFRESH_INTERVAL,
    retry: 1,
  });

  const hasLiveMembers = Boolean(data?.members.length);
  const members = (hasLiveMembers ? data!.members : []).slice(0, MAX_CLAN_MEMBERS);
  const memberCount = members.length;
  const isFullClanList = hasLiveMembers && memberCount >= MAX_CLAN_MEMBERS;
  const totalXp = members.reduce((sum, member) => sum + member.totalXp, 0);
  const totalKills = members.reduce((sum, member) => sum + member.kills, 0);
  const sortedByXp = [...members].sort((a, b) => b.totalXp - a.totalXp);
  const runeMetricsTargets = sortedByXp.slice(0, RUNEMETRICS_PROFILE_LIMIT);
  const runeMetricsNames = runeMetricsTargets.map((member) => member.name).join("|");
  const {
    data: runeMetricsProfiles = [],
    error: runeMetricsError,
    isFetching: isFetchingRuneMetrics,
  } = useQuery({
    queryKey: ["runemetrics-profiles", runeMetricsNames],
    queryFn: () => fetchRuneMetricsProfiles(runeMetricsTargets),
    enabled: runeMetricsTargets.length > 0,
    refetchInterval: CLAN_REFRESH_INTERVAL,
    staleTime: CLAN_REFRESH_INTERVAL,
  });
  const visibleMembers = sortedByXp.filter((member) =>
    `${member.name} ${member.rank}`.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );
  const sortedByKills = [...members].sort((a, b) => b.kills - a.kills || b.totalXp - a.totalXp);
  const topMember = sortedByXp[0];
  const leaders = members
    .filter((member) => ["Owner", "Deputy Owner", "Overseer", "Coordinator", "Organiser", "Admin"].includes(member.rank))
    .slice(0, 8);
  const rankCounts = members.reduce<Record<string, number>>((counts, member) => {
    counts[member.rank] = (counts[member.rank] ?? 0) + 1;
    return counts;
  }, {});
  const rankSummary = Object.entries(rankCounts).sort(
    ([rankA], [rankB]) => rankOrderIndex(rankA) - rankOrderIndex(rankB),
  );
  const updatedAt = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : data?.fetchedAt;
  const updateLabel = updatedAt ? formatUpdatedTime(updatedAt) : "loading live data";
  const sourceLabel = hasLiveMembers ? data?.source ?? "RuneScape" : "live roster unavailable";

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
            <label className="hidden h-9 items-center rounded-full border border-[var(--am-border)] bg-[var(--am-bg)] px-3 lg:flex">
              <Search className="mr-2 h-3.5 w-3.5 text-slate-600" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search members..."
                className="w-36 bg-transparent text-[11px] text-slate-300 outline-none placeholder:text-slate-600"
              />
            </label>
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
                  A RunePixels-inspired clan hub for Aussie Mob using the full public clan roster, up to RuneScape’s
                  {" "}{MAX_CLAN_MEMBERS}-member clan cap. Every row uses actual clanmate, rank, total XP, and kill values.
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
                  ? "Live data could not be reached from RuneScape or the configured CORS proxies, so the roster is not showing stale partial data."
                  : `Showing ${formatNumber(memberCount)} members from ${sourceLabel}${isFullClanList ? " — full 500-member clan cap loaded" : ""}. The roster refreshes automatically every 300 seconds.`}
              </p>
            </div>
          </Panel>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Users, "Members", formatNumber(memberCount), isFullClanList ? "Full clan cap loaded" : `${sourceLabel} roster`],
            [Zap, "Total XP", formatNumber(totalXp), "Exact combined roster XP"],
            [Swords, "Kills", formatNumber(totalKills), "Exact public hiscore kills"],
            [Crown, "Top Player", topMember?.name ?? "Loading", topMember ? `${formatNumber(topMember.totalXp)} XP` : "--"],
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
              <SectionTitle right="Accurate public fields">Available Clan Values</SectionTitle>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {combinedFields.map((field) => (
                  <div key={field} className="rounded-2xl border border-[var(--am-border)] bg-[var(--am-header)] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                      {availableFields.includes(field) ? "Clan feed" : "RuneMetrics"}
                    </p>
                    <p className="mt-1 font-black text-slate-100">{field}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                The main table below is the full clan member list returned by RuneScape, capped at {MAX_CLAN_MEMBERS} members.
                RuneMetrics is still queried separately for only the top {RUNEMETRICS_PROFILE_LIMIT} XP members.
              </p>
            </Panel>

            <Panel className="p-5">
              <SectionTitle right={`${formatNumber(visibleMembers.length)} of ${formatNumber(memberCount)} members`}>Full Clan Member List</SectionTitle>
              <div className="mt-4 rounded-2xl bg-[var(--am-header)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  {isFullClanList ? "Full 500-member roster loaded" : "Roster totals"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Exact combined XP: <strong className="text-emerald-400">{formatNumber(totalXp)}</strong> · Exact tracked kills:{" "}
                  <strong className="text-emerald-400">{formatNumber(totalKills)}</strong>
                </p>
              </div>
              {visibleMembers.length > 0 ? (
                <HiscoreTable members={visibleMembers} />
              ) : (
                <div className="mt-4 rounded-2xl border border-[var(--am-border)] bg-[var(--am-header)] p-5 text-sm leading-6 text-slate-400">
                  The live roster is currently blocked by CORS or a proxy timeout. I’m no longer showing the old 15-member snapshot as if it were the full clan.
                </div>
              )}
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
              <SectionTitle right={isFetchingRuneMetrics ? "Refreshing" : `${runeMetricsProfiles.length}/${RUNEMETRICS_PROFILE_LIMIT} loaded`}>RuneMetrics Profiles</SectionTitle>
              <div className="mt-3 space-y-2">
                {runeMetricsProfiles.length > 0 ? (
                  runeMetricsProfiles.map((profile) => <RuneMetricsCard key={profile.name} profile={profile} />)
                ) : (
                  <div className="rounded-2xl bg-[var(--am-header)] p-3 text-xs leading-5 text-slate-500">
                    {runeMetricsError
                      ? "RuneMetrics profiles could not be reached right now. Clan hiscores are still available."
                      : "Loading RuneMetrics details for the top XP members..."}
                  </div>
                )}
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
                {rankSummary.map(([rank, count]) => (
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
