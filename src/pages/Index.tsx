import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Crown,
  ExternalLink,
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
const CLAN_REFRESH_INTERVAL = 60_000;
const MAX_CLAN_MEMBERS = 500;
const RUNEMETRICS_PROFILE_LIMIT = 20;
const RUNESTATS_CLAN_URL = `https://runestats.info/api/v1/clans/${encodeURIComponent(CLAN_NAME)}/members`;
const RUNESTATS_PROXY_URL = `https://corsproxy.io/?url=${encodeURIComponent(RUNESTATS_CLAN_URL)}`;
const RUNEMETRICS_PROFILE_BASE_URL = "https://apps.runescape.com/runemetrics/profile/profile";
const AEST_TIME_ZONE = "Australia/Brisbane";
const AEST_OFFSET_MS = 10 * 60 * 60 * 1000;
const PLACEHOLDER_IMAGE = `${import.meta.env.BASE_URL}assets/placeholder.svg`;

const navItems = ["Home", "Members", "Progress", "Events"];
const rankOrder = ["Owner", "Deputy Owner", "Overseer", "Coordinator", "Organiser", "Admin", "General", "Captain", "Lieutenant", "Sergeant", "Corporal", "Recruit"];
const activityTabs = ["All", "Boss Kills", "Boss Loot", "Pets", "Skills", "Quests", "Clue Scrolls", "Citadel"] as const;

type ActivityTab = (typeof activityTabs)[number];

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

type ClanActivity = {
  member: ClanMember;
  category: ActivityTab;
  message: string;
  dateLabel: string;
  time: string;
  totalXp?: number;
  totalLevel?: number;
  combatLevel?: number;
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

const events = [
  {
    title: "Aussie Mob Boss Night",
    dayOfWeek: 5,
    hour: 19,
    minute: 30,
    description: "Clan PvM session for anyone wanting kills, loot splits, and a relaxed voice-chat run.",
  },
  {
    title: "Weekly Skill & Chill",
    dayOfWeek: 0,
    hour: 21,
    minute: 0,
    description: "A social skilling block for clan XP gains, citadel support, and helping newer members progress.",
  },
];

function rankOrderIndex(rank: string) {
  const index = rankOrder.indexOf(rank);
  return index === -1 ? rankOrder.length : index;
}

function parseClanMembersCsv(text: string): ClanMember[] {
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
        totalXp: Number((totalXp ?? "0").replace(/,/g, "")),
        kills: Number((kills ?? "0").replace(/,/g, "")),
      };
    })
    .filter((member) => member.name !== "Unknown" && Number.isFinite(member.totalXp) && Number.isFinite(member.kills))
    .slice(0, MAX_CLAN_MEMBERS);
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function playerNameValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    return stringValue(value);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return stringValue(record.name) ?? stringValue(record.displayName) ?? stringValue(record.display_name) ?? stringValue(record.username);
  }

  return undefined;
}

function collectMemberRows(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  for (const key of ["members", "clanmates", "players", "data", "result", "results", "payload", "clan", "rows"]) {
    const rows = collectMemberRows(record[key]);
    if (rows.length > 0) {
      return rows;
    }
  }

  return [];
}

function normalizeClanMember(row: unknown): ClanMember | null {
  if (Array.isArray(row)) {
    const name = stringValue(row[0]);
    if (!name) {
      return null;
    }

    return {
      name,
      rank: stringValue(row[1]) ?? "Recruit",
      totalXp: numberValue(row[2]) ?? 0,
      kills: numberValue(row[3]) ?? 0,
    };
  }

  if (!row || typeof row !== "object") {
    return null;
  }

  const record = row as Record<string, unknown>;
  const name = playerNameValue(record.name) ?? playerNameValue(record.player) ?? playerNameValue(record.username) ?? playerNameValue(record.rsn) ?? playerNameValue(record.clanmate);

  if (!name) {
    return null;
  }

  return {
    name,
    rank: stringValue(record.rank) ?? stringValue(record.clanRank) ?? stringValue(record.clan_rank) ?? "Recruit",
    totalXp: numberValue(record.totalXp) ?? numberValue(record.totalXP) ?? numberValue(record.total_xp) ?? numberValue(record.xp) ?? numberValue(record.experience) ?? 0,
    kills: numberValue(record.kills) ?? numberValue(record.killCount) ?? numberValue(record.bossKills) ?? numberValue(record.boss_kills) ?? 0,
  };
}

function parseClanMembers(text: string): ClanMember[] {
  try {
    const rows = collectMemberRows(JSON.parse(text));
    const members = rows
      .map(normalizeClanMember)
      .filter((member): member is ClanMember => Boolean(member))
      .slice(0, MAX_CLAN_MEMBERS);

    if (members.length > 0) {
      return members;
    }
  } catch {
    // RuneStats may also return CSV-compatible text depending on endpoint/proxy behavior.
  }

  return parseClanMembersCsv(text);
}

function clanDataSources(): ClanDataSource[] {
  return [
    { label: "RuneStats", url: RUNESTATS_CLAN_URL },
    { label: "RuneStats via CorsProxy", url: RUNESTATS_PROXY_URL },
  ];
}

async function fetchText(url: string, timeoutMs = 7000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json, text/plain;q=0.9" },
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

async function fetchClanRosterFromRuneMetrics(): Promise<ClanMember[]> {
  const profiles = await fetchRuneMetricsProfiles(fallbackMembers);

  if (profiles.length === 0) {
    throw new Error("RuneMetrics fallback returned no profiles");
  }

  return profiles.map((profile) => {
    const seed = fallbackMembers.find((member) => member.name.toLowerCase() === profile.name.toLowerCase());
    return {
      name: profile.name,
      rank: seed?.rank ?? "Recruit",
      totalXp: profile.totalxp ?? seed?.totalXp ?? 0,
      kills: seed?.kills ?? 0,
    };
  });
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

  // Final fallback: rebuild the roster from RuneMetrics profiles.
  return {
    members: await fetchClanRosterFromRuneMetrics(),
    fetchedAt: new Date().toISOString(),
    source: "RuneMetrics",
  };
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

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-AU", { maximumFractionDigits: 1, notation: "compact" }).format(value);
}

function formatUpdatedTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: AEST_TIME_ZONE,
    timeZoneName: "short",
  }).format(new Date(value));
}

function formatAestDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: AEST_TIME_ZONE,
  }).format(new Date(value));
}

function formatAestEventTime(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: AEST_TIME_ZONE,
    timeZoneName: "short",
  }).format(value);
}

function nextAestEventDate(dayOfWeek: number, hour: number, minute: number, now = new Date()) {
  const aestNow = new Date(now.getTime() + AEST_OFFSET_MS);
  const daysUntilEvent = (dayOfWeek - aestNow.getUTCDay() + 7) % 7;
  let eventUtc = Date.UTC(
    aestNow.getUTCFullYear(),
    aestNow.getUTCMonth(),
    aestNow.getUTCDate() + daysUntilEvent,
    hour - 10,
    minute,
  );

  if (eventUtc <= now.getTime()) {
    eventUtc += 7 * 24 * 60 * 60 * 1000;
  }

  return new Date(eventUtc);
}

function formatDurationUntil(value: Date, now = new Date()) {
  const totalMinutes = Math.max(0, Math.round((value.getTime() - now.getTime()) / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function playerSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function findClanMember(profileName: string, members: ClanMember[]) {
  return members.find((member) => member.name.toLowerCase() === profileName.toLowerCase()) ?? {
    name: profileName,
    rank: "RuneMetrics",
    totalXp: 0,
    kills: 0,
  };
}

function runeMetricsCategory(activity: RuneMetricsActivity): ActivityTab {
  const text = `${activity.text ?? ""} ${activity.details ?? ""}`.toLowerCase();

  if (text.includes("pet")) {
    return "Pets";
  }

  if (text.includes("clue")) {
    return "Clue Scrolls";
  }

  if (text.includes("quest")) {
    return "Quests";
  }

  if (text.includes("level") || text.includes("xp") || text.includes("experience")) {
    return "Skills";
  }

  if (text.includes("kill") || text.includes("defeat")) {
    return "Boss Kills";
  }

  if (text.includes("drop") || text.includes("loot") || text.includes("found") || text.includes("received") || text.includes("obtained")) {
    return "Boss Loot";
  }

  return "All";
}

function buildRuneMetricsActivities(profiles: RuneMetricsProfile[], members: ClanMember[], refreshedAt?: string): ClanActivity[] {
  const refreshDate = refreshedAt ?? new Date().toISOString();
  const dateLabel = formatAestDate(refreshDate);
  const time = `${formatUpdatedTime(refreshDate)} refresh`;

  return profiles
    .flatMap((profile) => {
      const member = findClanMember(profile.name, members);
      return (profile.activities ?? []).map((activity) => ({
        member,
        category: runeMetricsCategory(activity),
        message: activity.text || activity.details || "RuneMetrics activity recorded.",
        dateLabel,
        time,
        totalXp: profile.totalxp,
        totalLevel: profile.totalskill,
        combatLevel: profile.combatlevel,
      }));
    })
    .filter((activity) => activity.category !== "All")
    .slice(0, 60);
}

function Panel({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`border border-[#28303a] bg-[#111820]/95 shadow-[0_16px_40px_rgba(0,0,0,0.42)] ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#252d36] px-4 py-3">
      <h2 className="font-serif text-[13px] font-black uppercase tracking-[0.18em] text-[#d7a84b]">{children}</h2>
      {right && <div className="text-[11px] font-semibold text-slate-500">{right}</div>}
    </div>
  );
}

function LogoMark({ small = false }: { small?: boolean }) {
  return (
    <div className={`${small ? "h-7 w-7 text-sm" : "h-[86px] w-[86px] text-4xl"} relative grid shrink-0 place-items-center rounded-full border border-[#c99b42]/70 bg-[#17120b] shadow-[0_0_28px_rgba(215,168,75,0.2)]`}>
      <div className="absolute inset-1 rounded-full border border-white/10" />
      <span aria-hidden="true">🦘</span>
    </div>
  );
}

function PlayerAvatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded bg-[#0b1015] ring-1 ring-[#28303a] ${className || "h-8 w-8"}`}>
      <img src={PLACEHOLDER_IMAGE} alt="placeholder" className="h-full w-full object-cover opacity-25" />
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-[#d7a84b]">
        {name.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

function ActivityIcon({ category }: { category: ActivityTab }) {
  const icon = category === "Skills" ? <Zap className="h-3.5 w-3.5" /> : category === "Boss Kills" ? <Swords className="h-3.5 w-3.5" /> : <Trophy className="h-3.5 w-3.5" />;
  return <div className="grid h-6 w-6 shrink-0 place-items-center rounded bg-[#1a211b] text-[#d7a84b] ring-1 ring-[#3b3320]">{icon}</div>;
}

function EventCard({ event }: { event: (typeof events)[number] & { time: string; timer: string } }) {
  return (
    <article className="group relative min-h-[112px] overflow-hidden border border-[#2b333d] bg-[#141b23]">
      <img src={PLACEHOLDER_IMAGE} alt="placeholder" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/70" />
      <div className="relative flex h-full min-h-[112px] flex-col justify-between p-4">
        <div>
          <div className="mb-2 flex items-start justify-between gap-3">
            <h3 className="max-w-[75%] text-sm font-black text-slate-100">{event.title}</h3>
            <span className="rounded bg-emerald-500/15 px-2 py-1 text-[10px] font-black text-emerald-400">{event.timer}</span>
          </div>
          <p className="line-clamp-2 text-[11px] leading-5 text-slate-400">“{event.description}”</p>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="font-black text-slate-300">{event.time}</span>
          <span className="font-bold text-[#d7a84b] transition group-hover:text-white">View Event →</span>
        </div>
      </div>
    </article>
  );
}

function ActivityFeed({ activities, activeTab }: { activities: ClanActivity[]; activeTab: ActivityTab }) {
  const visibleActivities = activeTab === "All" ? activities : activities.filter((activity) => activity.category === activeTab);

  if (visibleActivities.length === 0) {
    return (
      <div className="p-4 text-[12px] leading-5 text-slate-500">
        No RuneMetrics entries are available for this filter at the current refresh. Try another tab or wait for the next 60-second refresh.
      </div>
    );
  }

  return (
    <div className="grid gap-x-8 gap-y-1 p-4 lg:grid-cols-2">
      {visibleActivities.slice(0, 30).map((activity, index) => (
        <a
          key={`${activity.member.name}-${activity.category}-${index}`}
          href={`https://runepixels.com/players/${playerSlug(activity.member.name)}`}
          target="_blank"
          rel="noreferrer"
          className="grid grid-cols-[34px_1fr_auto] gap-3 border-b border-[#202831] py-2 transition hover:bg-white/[0.025]"
        >
          <PlayerAvatar name={activity.member.name} />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-[12px] font-black text-slate-200">{activity.member.name}</p>
              <span className="text-[10px] text-slate-600">{activity.dateLabel} AEST</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <ActivityIcon category={activity.category} />
              <p className="truncate text-[11px] text-slate-400">{activity.message}</p>
            </div>
            <p className="mt-1 truncate text-[10px] text-slate-600">
              At refresh: combat {activity.combatLevel ?? "--"} · total {activity.totalLevel ?? "--"} · XP {activity.totalXp ? formatCompactNumber(activity.totalXp) : "--"}
            </p>
          </div>
          <span className="whitespace-nowrap pt-5 text-[10px] text-slate-600">{activity.time}</span>
        </a>
      ))}
    </div>
  );
}

function SideMemberRow({ member, index, value }: { member: ClanMember; index?: number; value?: string }) {
  return (
    <a
      href={`https://runepixels.com/players/${playerSlug(member.name)}`}
      target="_blank"
      rel="noreferrer"
      className="grid grid-cols-[22px_26px_1fr_auto] items-center gap-2 border-b border-[#202831] px-3 py-2 transition last:border-0 hover:bg-white/[0.025]"
    >
      <span className="text-[11px] font-black text-slate-600">{index ? index : ""}</span>
      <PlayerAvatar name={member.name} className="h-6 w-6" />
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold text-slate-300">{member.name}</p>
        <p className="truncate text-[9px] uppercase tracking-[0.12em] text-slate-600">{member.rank}</p>
      </div>
      {value && <span className="text-[11px] font-black text-emerald-400">{value}</span>}
    </a>
  );
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<ActivityTab>("All");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const { data, dataUpdatedAt, error } = useQuery({
    queryKey: ["clan-data", CLAN_NAME],
    queryFn: fetchClanData,
    refetchInterval: CLAN_REFRESH_INTERVAL,
    staleTime: CLAN_REFRESH_INTERVAL,
    retry: 1,
  });

  const hasLiveMembers = Boolean(data?.members.length);
  const members = (hasLiveMembers ? data!.members : fallbackMembers).slice(0, MAX_CLAN_MEMBERS);
  const memberCount = members.length;
  const isFullClanList = hasLiveMembers && memberCount >= MAX_CLAN_MEMBERS;
  const totalXp = members.reduce((sum, member) => sum + member.totalXp, 0);
  const totalKills = members.reduce((sum, member) => sum + member.kills, 0);
  const sortedByXp = [...members].sort((a, b) => b.totalXp - a.totalXp);
  const runeMetricsTargets = sortedByXp.slice(0, RUNEMETRICS_PROFILE_LIMIT);
  const runeMetricsNames = runeMetricsTargets.map((member) => member.name).join("|");
  const {
    data: runeMetricsProfiles = [],
    dataUpdatedAt: runeMetricsUpdatedAt,
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
  const leaders = members
    .filter((member) => ["Owner", "Deputy Owner", "Overseer", "Coordinator", "Organiser", "Admin"].includes(member.rank))
    .sort((a, b) => rankOrderIndex(a.rank) - rankOrderIndex(b.rank))
    .slice(0, 7);
  const rankCounts = members.reduce<Record<string, number>>((counts, member) => {
    counts[member.rank] = (counts[member.rank] ?? 0) + 1;
    return counts;
  }, {});
  const rankSummary = Object.entries(rankCounts).sort(
    ([rankA], [rankB]) => rankOrderIndex(rankA) - rankOrderIndex(rankB),
  );
  const updatedAt = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : data?.fetchedAt;
  const runeMetricsRefreshAt = runeMetricsUpdatedAt ? new Date(runeMetricsUpdatedAt).toISOString() : updatedAt;
  const updateLabel = updatedAt ? formatUpdatedTime(updatedAt) : "loading live data";
  const runeMetricsUpdateLabel = runeMetricsRefreshAt ? formatUpdatedTime(runeMetricsRefreshAt) : "loading RuneMetrics";
  const sourceLabel = hasLiveMembers ? data?.source ?? "RuneStats" : "preview roster";
  const runeMetricsActivities = useMemo(
    () => buildRuneMetricsActivities(runeMetricsProfiles, members, runeMetricsRefreshAt),
    [members, runeMetricsProfiles, runeMetricsRefreshAt],
  );
  const activities = runeMetricsActivities.filter((activity) =>
    `${activity.member.name} ${activity.message}`.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );
  const bossKillActivities = runeMetricsActivities.filter((activity) => activity.category === "Boss Kills");
  const lootDropActivities = runeMetricsActivities.filter((activity) => activity.category === "Boss Loot");
  const runeMetricsSnapshots = runeMetricsProfiles
    .map((profile) => ({ profile, member: findClanMember(profile.name, members) }))
    .sort((a, b) => (b.profile.totalxp ?? 0) - (a.profile.totalxp ?? 0));
  const clanTotalLevel = runeMetricsProfiles.reduce((sum, profile) => sum + (profile.totalskill ?? 0), 0);
  const clanTotalLevelLabel = clanTotalLevel > 0 ? formatNumber(clanTotalLevel) : isFetchingRuneMetrics ? "Loading" : "--";
  const lastRefreshAt = Math.max(dataUpdatedAt || 0, runeMetricsUpdatedAt || 0);
  const secondsUntilRefresh = lastRefreshAt
    ? Math.max(0, Math.ceil((lastRefreshAt + CLAN_REFRESH_INTERVAL - now) / 1000))
    : Math.ceil(CLAN_REFRESH_INTERVAL / 1000);
  const refreshedEvents = events.map((event) => {
    const nextEvent = nextAestEventDate(event.dayOfWeek, event.hour, event.minute);
    return {
      ...event,
      time: formatAestEventTime(nextEvent),
      timer: formatDurationUntil(nextEvent),
    };
  });
  const progressRows = [
    ["Roster Loaded", hasLiveMembers ? (isFullClanList ? "Full public clan cap" : "Live public roster") : "Preview roster while live feed is blocked", memberCount],
    ["Total Public XP", "Current RuneStats roster value", totalXp],
    ["Tracked Public Kills", "Current public boss kill value", totalKills],
  ] as const;

  return (
    <main className="min-h-screen bg-[#05080b] text-slate-300 selection:bg-[#d7a84b] selection:text-black">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(215,168,75,0.12),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.9),transparent_24%,transparent_76%,rgba(0,0,0,0.9))]" />

      <header className="sticky top-0 z-40 border-b border-[#252d36] bg-[#0b1015]/98 shadow-[0_2px_10px_rgba(0,0,0,0.55)] backdrop-blur">
        <div className="mx-auto flex h-9 max-w-[1180px] items-center justify-between px-2 sm:px-4">
          <a href="#home" className="flex items-center gap-2">
            <LogoMark small />
            <span className="font-serif text-[13px] font-black uppercase tracking-[0.25em] text-[#d7a84b]">Aussie Mob</span>
          </a>

          <nav className="hidden h-full items-center md:flex">
            {navItems.map((item, index) => (
              <a
                href={item === "Home" ? "#home" : `#${item.toLowerCase()}`}
                key={item}
                className={`flex h-full items-center border-x border-transparent px-4 text-[10px] font-black uppercase tracking-[0.16em] transition hover:border-[#313a45] hover:bg-[#111820] hover:text-[#d7a84b] ${index === 0 ? "border-[#313a45] bg-[#111820] text-[#d7a84b]" : "text-slate-500"}`}
              >
                {item} {index > 1 && <ChevronDown className="ml-1 h-3 w-3" />}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 border border-[#252d36] bg-[#05080b] px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 sm:inline-flex">
              Times in AEST
              <span className="rounded bg-[#14100a] px-1.5 py-0.5 text-[#d7a84b] tabular-nums">
                {secondsUntilRefresh}s
              </span>
            </span>
            <label className="hidden h-6 items-center border border-[#252d36] bg-[#05080b] px-2 lg:flex">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search player..."
                className="w-40 bg-transparent text-[10px] text-slate-400 outline-none placeholder:text-slate-600"
              />
              <Search className="h-3 w-3 text-slate-600" />
            </label>
            <button className="inline-flex h-6 items-center gap-1 border border-[#4c3411] bg-[#14100a] px-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#d7a84b] hover:bg-[#21170b]">
              <LogIn className="h-3 w-3" /> Login
            </button>
          </div>
        </div>
      </header>

      <section id="home" className="relative border-b border-[#161c23] bg-[#080c10]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-4 opacity-30">
            {[0, 1, 2, 3].map((item) => (
              <img key={item} src={PLACEHOLDER_IMAGE} alt="placeholder" className="h-full w-full object-cover" />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#05080b] via-[#05080b]/55 to-[#05080b]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05080b] via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto grid max-w-[1180px] gap-6 px-4 py-8 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-center gap-5">
            <LogoMark />
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-500">Welcome to</p>
              <h1 className="font-serif text-5xl font-black uppercase tracking-[0.08em] text-[#e1b866] drop-shadow sm:text-6xl">Aussie Mob</h1>
              <a
                href="https://runepixels.com/clans/aussie-mob"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex bg-[#b08237] px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#100b04] shadow hover:bg-[#d7a84b]"
              >
                Apply to join Aussie Mob
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center md:min-w-[360px]">
            <div>
              <Users className="mx-auto mb-1 h-5 w-5 text-slate-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Members</p>
              <p className="font-serif text-2xl font-black text-slate-200">{formatNumber(memberCount)}</p>
            </div>
            <div>
              <Shield className="mx-auto mb-1 h-5 w-5 text-slate-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Roster Cap</p>
              <p className="font-serif text-2xl font-black text-slate-200">{MAX_CLAN_MEMBERS}</p>
            </div>
            <div>
              <Zap className="mx-auto mb-1 h-5 w-5 text-slate-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Clan Total Level</p>
              <p className="font-serif text-2xl font-black text-slate-200">{clanTotalLevelLabel}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-[1180px] px-4 py-5">
        <Panel className="mb-4">
          <div className="flex items-start justify-between gap-4 p-4">
            <div>
              <p className="font-serif text-[12px] font-black uppercase tracking-[0.2em] text-[#d7a84b]">Announcement</p>
              <h2 className="mt-1 text-sm font-black text-white">New Aussie Mob Look</h2>
              <p className="mt-1 text-[12px] text-slate-500">
                Kravy-inspired home dashboard rebuilt for Aussie Mob. Clan data source: {sourceLabel}. RuneStats refreshed {updateLabel}; RuneMetrics refreshed {runeMetricsUpdateLabel}. All displayed times use AEST.
              </p>
              {error && <p className="mt-2 text-[11px] text-amber-400">Live feed is currently blocked, so the preview roster is filling the layout.</p>}
            </div>
            <button className="grid h-6 w-6 place-items-center border border-[#323b46] text-slate-500 hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <Panel id="events">
              <SectionTitle right="AEST schedule">Upcoming Events</SectionTitle>
              <div className="grid gap-3 p-4 md:grid-cols-2">
                {refreshedEvents.map((event) => (
                  <EventCard key={event.title} event={event} />
                ))}
              </div>
            </Panel>

            <Panel>
              <div className="border-b border-[#252d36] px-4 pt-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-serif text-[13px] font-black uppercase tracking-[0.18em] text-[#d7a84b]">Clan Activity</h2>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isFetchingRuneMetrics ? "Refreshing RuneMetrics" : `${formatNumber(activities.length)} RuneMetrics entries`}
                  </span>
                </div>
                <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                  {activityTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap text-[10px] font-black transition ${activeTab === tab ? "text-[#d7a84b]" : "text-slate-600 hover:text-slate-300"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <ActivityFeed activities={activities} activeTab={activeTab} />
              <div className="flex justify-center gap-1 border-t border-[#252d36] p-4 text-[11px]">
                {[1, 2, 3, 4, 5].map((page) => (
                  <button key={page} className={`h-7 w-7 border border-[#252d36] ${page === 1 ? "bg-[#4c3411] text-[#d7a84b]" : "text-slate-600 hover:text-white"}`}>
                    {page}
                  </button>
                ))}
                <button className="h-7 w-7 border border-[#252d36] text-slate-600 hover:text-white">›</button>
                <button className="h-7 w-7 border border-[#252d36] text-slate-600 hover:text-white">»</button>
              </div>
            </Panel>
          </div>

          <aside className="space-y-4">
            <Panel id="members">
              <SectionTitle>Clan Owners</SectionTitle>
              <div>
                {leaders.map((member, index) => {
                  const LeaderIcon = index === 0 ? Crown : Shield;
                  return (
                    <a
                      key={member.name}
                      href={`https://runepixels.com/players/${playerSlug(member.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="grid grid-cols-[22px_26px_1fr_auto] items-center gap-2 border-b border-[#202831] px-3 py-2 transition last:border-0 hover:bg-white/[0.025]"
                    >
                      <LeaderIcon className="h-3.5 w-3.5 text-[#d7a84b]" />
                      <PlayerAvatar name={member.name} className="h-6 w-6" />
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold text-slate-300">{member.name}</p>
                        <p className="truncate text-[9px] uppercase tracking-[0.12em] text-slate-600">{member.rank}</p>
                      </div>
                      <ExternalLink className="h-3 w-3 text-slate-600" />
                    </a>
                  );
                })}
              </div>
            </Panel>

            <Panel id="progress">
              <SectionTitle right="Live public data">Clan Progress</SectionTitle>
              <div className="space-y-4 p-4">
                <div className="flex gap-4 text-[10px] font-black text-slate-600">
                  <span className="text-[#d7a84b]">Current RuneStats</span>
                  <span>AEST Updated</span>
                </div>
                {progressRows.map(([label, helper, value]) => (
                  <div key={label} className="flex items-end justify-between border-b border-[#202831] pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-[11px] font-black text-slate-200">{label}</p>
                      <p className="mt-1 text-[10px] text-slate-600">{helper}</p>
                    </div>
                    <p className="font-serif text-lg font-black text-emerald-400">{formatCompactNumber(value)}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <SectionTitle right="Current">Top Total XP</SectionTitle>
              <div className="flex gap-4 border-b border-[#202831] px-4 py-2 text-[10px] font-black text-slate-600">
                <span className="text-[#d7a84b]">Total XP</span>
                <span>Live roster</span>
              </div>
              <div>
                {sortedByXp.slice(0, 15).map((member, index) => (
                  <SideMemberRow key={`${member.name}-xp`} member={member} index={index + 1} value={formatCompactNumber(member.totalXp)} />
                ))}
              </div>
            </Panel>

            <Panel>
              <SectionTitle right={`${bossKillActivities.length} entries`}>RuneMetrics Boss Kills</SectionTitle>
              <div className="p-3">
                {bossKillActivities.length > 0 ? (
                  bossKillActivities.slice(0, 8).map((activity, index) => (
                    <div key={`${activity.member.name}-boss-${index}`} className="border-b border-[#202831] py-2 last:border-0">
                      <p className="text-[11px] font-black text-slate-300">{activity.member.name}</p>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{activity.message}</p>
                      <p className="mt-1 text-[10px] text-slate-600">Total {activity.totalLevel ?? "--"} · XP {activity.totalXp ? formatCompactNumber(activity.totalXp) : "--"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] leading-5 text-slate-500">No RuneMetrics boss kill entries were returned at this refresh.</p>
                )}
              </div>
            </Panel>

            <Panel>
              <SectionTitle right={`${lootDropActivities.length} entries`}>RuneMetrics Loot Drops</SectionTitle>
              <div className="p-3">
                {lootDropActivities.length > 0 ? (
                  lootDropActivities.slice(0, 8).map((activity, index) => (
                    <div key={`${activity.member.name}-loot-${index}`} className="border-b border-[#202831] py-2 last:border-0">
                      <p className="text-[11px] font-black text-slate-300">{activity.member.name}</p>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{activity.message}</p>
                      <p className="mt-1 text-[10px] text-slate-600">Total {activity.totalLevel ?? "--"} · XP {activity.totalXp ? formatCompactNumber(activity.totalXp) : "--"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] leading-5 text-slate-500">No RuneMetrics loot drop entries were returned at this refresh.</p>
                )}
              </div>
            </Panel>

            <Panel>
              <SectionTitle right="Roster">Rank Summary</SectionTitle>
              <div className="p-3">
                {rankSummary.map(([rank, count]) => (
                  <div key={rank} className="flex items-center justify-between border-b border-[#202831] px-1 py-2 last:border-0">
                    <span className="text-[11px] font-bold text-slate-400">{rank}</span>
                    <span className="font-serif text-sm font-black text-[#d7a84b]">{count}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <SectionTitle right={runeMetricsUpdateLabel}>RuneMetrics Snapshots</SectionTitle>
              <div className="p-3 text-[11px] leading-5 text-slate-500">
                {runeMetricsSnapshots.length > 0
                  ? runeMetricsSnapshots.slice(0, 5).map(({ profile, member }) => (
                      <div key={profile.name} className="border-b border-[#202831] py-2 last:border-0">
                        <p className="font-black text-slate-300">{profile.name}</p>
                        <p>
                          Rank {member.rank} · Combat {profile.combatlevel ?? "--"} · Total Level {profile.totalskill ?? "--"}
                        </p>
                        <p>XP at refresh: {profile.totalxp ? formatNumber(profile.totalxp) : "--"}</p>
                      </div>
                    ))
                  : runeMetricsError
                    ? "RuneMetrics profiles could not be reached right now."
                    : "Loading RuneMetrics level and XP snapshots..."}
              </div>
            </Panel>
          </aside>
        </div>

        <footer className="mt-6 flex flex-col gap-3 border-t border-[#252d36] py-5 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>RuneScape is a trademark of Jagex. This fan-made Aussie Mob tracker is styled as a Kravy-inspired clan home page.</p>
          <div className="flex gap-3">
            <a href="https://runepixels.com/clans/aussie-mob" target="_blank" rel="noreferrer" className="font-bold text-[#d7a84b] hover:text-white">
              RunePixels <ExternalLink className="inline h-3 w-3" />
            </a>
            <a href={RUNESTATS_CLAN_URL} target="_blank" rel="noreferrer" className="font-bold text-[#d7a84b] hover:text-white">
              RuneStats Data <ExternalLink className="inline h-3 w-3" />
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default Index;
