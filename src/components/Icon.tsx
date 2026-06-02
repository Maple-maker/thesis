import Svg, { Circle, G, Path, Rect } from "react-native-svg";

export type IconName =
  | "home"
  | "discover"
  | "compare"
  | "learn"
  | "bolt"
  | "shield"
  | "trend"
  | "book"
  | "compass"
  | "moat"
  | "leaf"
  | "pulse"
  | "seed"
  | "piggy"
  | "gem"
  | "flag"
  | "flame"
  | "grid"
  | "cap"
  | "bell"
  | "search"
  | "plus"
  | "chev"
  | "chevDown"
  | "back"
  | "check"
  | "info"
  | "lock"
  | "sparkle"
  | "target"
  | "arrow"
  | "profile"
  | "close"
  | "play";

type Props = {
  name: IconName;
  size?: number;
  sw?: number;
  color?: string;
  fill?: boolean;
};

export function Icon({ name, size = 22, sw = 1.8, color = "#16201C", fill = false }: Props) {
  const stroke = {
    fill: "none" as const,
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  let inner: React.ReactNode = null;
  switch (name) {
    case "home":
      inner = <Path {...stroke} d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />;
      break;
    case "discover":
      inner = (
        <G {...stroke}>
          <Circle cx={12} cy={12} r={8.5} />
          <Path d="M15.5 8.5l-2 5-5 2 2-5z" />
        </G>
      );
      break;
    case "compare":
      inner = (
        <G {...stroke}>
          <Path d="M5 4v16M19 4v16" />
          <Path d="M5 9l4-3 4 3M19 15l-4 3-4-3" />
        </G>
      );
      break;
    case "learn":
      inner = (
        <G {...stroke}>
          <Path d="M3 6.5l9-3 9 3-9 3z" />
          <Path d="M7 9v5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V9" />
        </G>
      );
      break;
    case "bolt":
      inner = <Path {...stroke} d="M13 3L5 13h5l-1 8 8-11h-5z" />;
      break;
    case "shield":
      inner = (
        <G {...stroke}>
          <Path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
          <Path d="M9 12l2 2 4-4.5" />
        </G>
      );
      break;
    case "trend":
      inner = (
        <G {...stroke}>
          <Path d="M4 15l5-5 3 3 7-7" />
          <Path d="M16 6h4v4" />
        </G>
      );
      break;
    case "book":
      inner = (
        <G {...stroke}>
          <Path d="M5 4h9a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" />
          <Path d="M16 6h3v12h-3" />
        </G>
      );
      break;
    case "compass":
      inner = (
        <G {...stroke}>
          <Circle cx={12} cy={12} r={8.5} />
          <Path d="M15 9l-1.5 4.5L9 15l1.5-4.5z" />
        </G>
      );
      break;
    case "moat":
      inner = (
        <G {...stroke}>
          <Path d="M4 20V9l4-3 4 3 4-3 4 3v11z" />
          <Path d="M9 20v-4h6v4" />
        </G>
      );
      break;
    case "leaf":
      inner = (
        <G {...stroke}>
          <Path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
          <Path d="M5 19c4-6 8-8 11-9" />
        </G>
      );
      break;
    case "pulse":
      inner = <Path {...stroke} d="M3 12h4l2-5 3 10 2-5h7" />;
      break;
    case "seed":
      inner = (
        <G {...stroke}>
          <Path d="M12 21V11" />
          <Path d="M12 11c0-3 2-5 6-5 0 3-2 5-6 5z" />
          <Path d="M12 13c0-2.5-2-4-5-4 0 2.5 2 4 5 4z" />
        </G>
      );
      break;
    case "piggy":
      inner = (
        <G {...stroke}>
          <Path d="M4 12a6 5 0 0 1 6-5h4l3-2v3a5 5 0 0 1 2 4c0 3-3 5-7 5H9a5 5 0 0 1-5-5z" />
          <Circle cx={9} cy={11} r={0.6} fill={color} />
        </G>
      );
      break;
    case "gem":
      inner = (
        <G {...stroke}>
          <Path d="M6 4h12l3 5-9 11L3 9z" />
          <Path d="M3 9h18M9 4l-3 5 6 11 6-11-3-5" />
        </G>
      );
      break;
    case "flag":
      inner = (
        <G {...stroke}>
          <Path d="M6 21V4" />
          <Path d="M6 5h11l-2 3 2 3H6" />
        </G>
      );
      break;
    case "flame":
      inner = (
        <Path
          fill={color}
          stroke="none"
          d="M13 2c1 3-2 4-2 7 0 1.4 1.1 2.5 2.5 2.5S16 10.4 16 9c2 1.5 3 4 3 6a7 7 0 1 1-14 0c0-4 4-6 4-9 0-2 2-3 4-4z"
        />
      );
      break;
    case "grid":
      inner = (
        <G {...stroke}>
          <Rect x={4} y={4} width={7} height={7} rx={1.5} />
          <Rect x={13} y={4} width={7} height={7} rx={1.5} />
          <Rect x={4} y={13} width={7} height={7} rx={1.5} />
          <Rect x={13} y={13} width={7} height={7} rx={1.5} />
        </G>
      );
      break;
    case "cap":
      inner = (
        <G {...stroke}>
          <Path d="M2 9l10-4 10 4-10 4z" />
          <Path d="M6 11v5c0 1 3 3 6 3s6-2 6-3v-5" />
          <Path d="M22 9v5" />
        </G>
      );
      break;
    case "bell":
      inner = (
        <G {...stroke}>
          <Path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
          <Path d="M10 19a2 2 0 0 0 4 0" />
        </G>
      );
      break;
    case "search":
      inner = (
        <G {...stroke}>
          <Circle cx={11} cy={11} r={6.5} />
          <Path d="M16 16l4 4" />
        </G>
      );
      break;
    case "plus":
      inner = <Path {...stroke} d="M12 5v14M5 12h14" />;
      break;
    case "chev":
      inner = <Path {...stroke} d="M9 6l6 6-6 6" />;
      break;
    case "chevDown":
      inner = <Path {...stroke} d="M6 9l6 6 6-6" />;
      break;
    case "back":
      inner = <Path {...stroke} d="M15 6l-6 6 6 6" />;
      break;
    case "check":
      inner = <Path {...stroke} d="M5 12l4 4 10-10" />;
      break;
    case "info":
      inner = (
        <G {...stroke}>
          <Circle cx={12} cy={12} r={8.5} />
          <Path d="M12 11v5M12 8h.01" />
        </G>
      );
      break;
    case "lock":
      inner = (
        <G {...stroke}>
          <Rect x={5} y={11} width={14} height={9} rx={2} />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </G>
      );
      break;
    case "sparkle":
      inner = <Path {...stroke} d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z" />;
      break;
    case "target":
      inner = (
        <G {...stroke}>
          <Circle cx={12} cy={12} r={8.5} />
          <Circle cx={12} cy={12} r={4.5} />
          <Circle cx={12} cy={12} r={0.6} fill={color} />
        </G>
      );
      break;
    case "arrow":
      inner = <Path {...stroke} d="M5 12h14M13 6l6 6-6 6" />;
      break;
    case "profile":
      inner = (
        <G {...stroke}>
          <Circle cx={12} cy={8} r={3.5} />
          <Path d="M5 20c0-4 3.5-6 7-6s7 2 7 6" />
        </G>
      );
      break;
    case "close":
      inner = <Path {...stroke} d="M6 6l12 12M18 6l-12 12" />;
      break;
    case "play":
      inner = (
        <G fill={color}>
          <Path d="M9 6.5v11l9-5.5z" />
        </G>
      );
      break;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {inner}
    </Svg>
  );
}
