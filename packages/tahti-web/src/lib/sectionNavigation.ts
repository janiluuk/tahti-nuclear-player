export function matchesSectionRoute(
  current: string | undefined,
  prefixes: readonly string[],
): boolean {
  if (!current) {
    return false;
  }

  return prefixes.some(
    (prefix) => current === prefix || current.startsWith(`${prefix}/`),
  );
}
