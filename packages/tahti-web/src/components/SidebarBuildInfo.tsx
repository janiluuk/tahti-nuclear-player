const BUILD_TIME_LABEL = (() => {
  const parsed = new Date(__BUILD_TIME__);
  if (Number.isNaN(parsed.getTime())) {
    return __BUILD_TIME__;
  }
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(parsed);
})();

/** Board-only build fingerprint — lets whoever's on call confirm which
 * commit is actually live on beta without SSHing into vimage. */
export function SidebarBuildInfo() {
  return (
    <div className="text-foreground-secondary flex flex-col gap-0.5 px-2 py-1 text-[11px] leading-tight select-text">
      <span>
        v{__APP_VERSION__} · {__COMMIT_HASH__}
      </span>
      <span>Deployed {BUILD_TIME_LABEL} UTC</span>
    </div>
  );
}
