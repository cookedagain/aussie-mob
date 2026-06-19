// ... keep existing code (imports)

const CLAN_NAME = "Aussie Mob";
const CLAN_REFRESH_INTERVAL = 60_000;
const MAX_CLAN_MEMBERS = 500;
const RUNEMETRICS_PROFILE_LIMIT = 20;
const RUNESTATS_CLAN_URL = `https://runestats.info/clan/${encodeURIComponent(CLAN_NAME.toLowerCase())}`;
const RUNESTATS_PROXY_URL = `https://corsproxy.io/?url=${encodeURIComponent(RUNESTATS_CLAN_URL)}`;
const RUNEMETRICS_PROFILE_BASE_URL = "https://apps.runescape.com/runemetrics/profile/profile";
const AEST_TIME_ZONE = "Australia/Brisbane";
const AEST_OFFSET_MS = 10 * 60 * 60 * 1000;
const PLACEHOLDER_IMAGE = `${import.meta.env.BASE_URL}assets/placeholder.svg`;

// ... keep existing code (rest of the file)