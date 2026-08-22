import { MapPinIcon } from 'lucide-react';
import { useMemo, type FC } from 'react';

export type ListenerGeoPoint = {
  countryCode: string;
  displayName: string;
  count: number;
};

type Coordinates = { latitude: number; longitude: number };

const COUNTRY_COORDINATES: Record<string, Coordinates> = {
  AR: { latitude: -34, longitude: -64 },
  AT: { latitude: 47.5, longitude: 14.5 },
  AU: { latitude: -25, longitude: 134 },
  BE: { latitude: 50.8, longitude: 4.5 },
  BR: { latitude: -10, longitude: -52 },
  CA: { latitude: 57, longitude: -106 },
  CH: { latitude: 46.8, longitude: 8.2 },
  CL: { latitude: -33, longitude: -71 },
  CN: { latitude: 35, longitude: 103 },
  CO: { latitude: 4, longitude: -72 },
  CZ: { latitude: 49.8, longitude: 15.5 },
  DE: { latitude: 51, longitude: 10 },
  DK: { latitude: 56, longitude: 10 },
  EE: { latitude: 59, longitude: 25.5 },
  EG: { latitude: 27, longitude: 30 },
  ES: { latitude: 40, longitude: -4 },
  FI: { latitude: 64, longitude: 26 },
  FR: { latitude: 46, longitude: 2 },
  GB: { latitude: 54, longitude: -2 },
  GR: { latitude: 39, longitude: 22 },
  ID: { latitude: -3, longitude: 120 },
  IE: { latitude: 53, longitude: -8 },
  IL: { latitude: 31.5, longitude: 35 },
  IN: { latitude: 21, longitude: 79 },
  IS: { latitude: 65, longitude: -19 },
  IT: { latitude: 42.5, longitude: 12.5 },
  JP: { latitude: 36, longitude: 138 },
  KE: { latitude: 0, longitude: 38 },
  KR: { latitude: 36, longitude: 128 },
  LT: { latitude: 55, longitude: 24 },
  LV: { latitude: 57, longitude: 25 },
  MX: { latitude: 23, longitude: -102 },
  NG: { latitude: 9, longitude: 8 },
  NL: { latitude: 52.3, longitude: 5.5 },
  NO: { latitude: 62, longitude: 10 },
  NZ: { latitude: -42, longitude: 172 },
  PL: { latitude: 52, longitude: 19 },
  PT: { latitude: 39.5, longitude: -8 },
  RO: { latitude: 46, longitude: 25 },
  SE: { latitude: 62, longitude: 15 },
  SG: { latitude: 1.3, longitude: 104 },
  TH: { latitude: 15, longitude: 101 },
  TR: { latitude: 39, longitude: 35 },
  UA: { latitude: 49, longitude: 32 },
  US: { latitude: 39, longitude: -98 },
  VN: { latitude: 16, longitude: 108 },
  ZA: { latitude: -30, longitude: 24 },
};

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;
const MAX_COUNTRIES = 10;

const mapCoordinates = ({ latitude, longitude }: Coordinates) => ({
  x: ((longitude + 180) / 360) * MAP_WIDTH,
  y: ((90 - latitude) / 180) * MAP_HEIGHT,
});

type ListenerWorldMapProps = {
  data: ListenerGeoPoint[];
  loading?: boolean;
  countLabel?: string;
};

export const ListenerWorldMap: FC<ListenerWorldMapProps> = ({
  data,
  loading = false,
  countLabel = 'listeners',
}) => {
  const maxCount = Math.max(1, ...data.map((point) => point.count));
  const topCountries = useMemo(
    () => [...data].sort((first, second) => second.count - first.count),
    [data],
  );

  return (
    <div className="flex flex-col gap-4" aria-busy={loading}>
      <div
        className="border-border bg-background relative overflow-hidden rounded-xl border"
        role="img"
        aria-label="Listener world map"
      >
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="w-full">
          <rect
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            className="fill-background"
          />
          <g
            className="fill-background-secondary stroke-border"
            strokeWidth="2"
          >
            <path d="M55 115 96 70l84-34 102 19 63 45-16 53-53 20-20 55-49 18-48-35-57-8-45-39Z" />
            <path d="m250 260 57 24 30 55-22 94-35 43-25-74-35-66Z" />
            <path d="m407 94 44-38 69 9 36 26 28-9 50 23 79-18 102 29 103 68-33 51-70 5-24 40-87-6-53 32-57-20-31-59-55-7-54-47-51-26Z" />
            <path d="m480 230 74 7 55 55-11 90-50 72-47-30-25-82-35-50Z" />
            <path d="m770 340 65-28 79 30 21 58-38 43-82-18-42-38Z" />
            <path d="m915 439 26-19 24 18-23 19Z" />
          </g>
          <g className="stroke-border/40" strokeWidth="1">
            {[100, 200, 300, 400].map((y) => (
              <line key={`y-${y}`} x1="0" x2={MAP_WIDTH} y1={y} y2={y} />
            ))}
            {[200, 400, 600, 800].map((x) => (
              <line key={`x-${x}`} x1={x} x2={x} y1="0" y2={MAP_HEIGHT} />
            ))}
          </g>
          {data.map((point) => {
            const coordinates = COUNTRY_COORDINATES[point.countryCode];
            if (!coordinates) {
              return null;
            }
            const position = mapCoordinates(coordinates);
            const radius = 6 + Math.sqrt(point.count / maxCount) * 16;
            return (
              <g key={point.countryCode}>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={radius + 6}
                  className="fill-accent-cyan/20"
                />
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={radius}
                  className="fill-accent-cyan stroke-background"
                  strokeWidth="3"
                >
                  <title>
                    {point.displayName}: {point.count.toLocaleString()}{' '}
                    {countLabel}
                  </title>
                </circle>
              </g>
            );
          })}
        </svg>
        {loading ? (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center text-sm font-medium">
            Updating map…
          </div>
        ) : null}
      </div>

      {topCountries.length === 0 ? (
        <p className="text-foreground-secondary text-sm">
          No listener location data yet.
        </p>
      ) : (
        <ol className="grid gap-2 sm:grid-cols-2">
          {topCountries.slice(0, MAX_COUNTRIES).map((point, index) => (
            <li
              key={point.countryCode}
              className="border-border flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <span className="text-foreground-secondary w-5 text-xs tabular-nums">
                {index + 1}
              </span>
              <MapPinIcon size={14} aria-hidden className="text-accent-cyan" />
              <span className="min-w-0 flex-1 truncate">
                {point.displayName}
              </span>
              <strong className="tabular-nums">
                {point.count.toLocaleString()}
              </strong>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
