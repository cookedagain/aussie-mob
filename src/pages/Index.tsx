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

const Index = () => {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Clan dashboard
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {CLAN_NAME}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            The homepage has been restored so the app can load correctly again.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Refresh interval</p>
            <p className="mt-2 text-2xl font-semibold">
              {CLAN_REFRESH_INTERVAL / 1000}s
            </p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Max clan members</p>
            <p className="mt-2 text-2xl font-semibold">{MAX_CLAN_MEMBERS}</p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-sm text-muted-foreground">Profile limit</p>
            <p className="mt-2 text-2xl font-semibold">
              {RUNEMETRICS_PROFILE_LIMIT}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Configured sources</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground break-all">
            <li>
              <span className="font-medium text-foreground">RuneStats:</span>{" "}
              {RUNESTATS_CLAN_URL}
            </li>
            <li>
              <span className="font-medium text-foreground">Proxy:</span>{" "}
              {RUNESTATS_PROXY_URL}
            </li>
            <li>
              <span className="font-medium text-foreground">RuneMetrics:</span>{" "}
              {RUNEMETRICS_PROFILE_BASE_URL}
            </li>
            <li>
              <span className="font-medium text-foreground">Timezone:</span>{" "}
              {AEST_TIME_ZONE}
            </li>
            <li>
              <span className="font-medium text-foreground">Offset:</span>{" "}
              {AEST_OFFSET_MS} ms
            </li>
            <li>
              <span className="font-medium text-foreground">Placeholder:</span>{" "}
              {PLACEHOLDER_IMAGE}
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default Index;