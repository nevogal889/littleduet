import React from 'react';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';
import { colors } from '../theme';

export type IconName =
  | 'home'
  | 'songs'
  | 'star'
  | 'starOutline'
  | 'grownups'
  | 'lock'
  | 'unlock'
  | 'play'
  | 'pause'
  | 'back10'
  | 'close'
  | 'chevronLeft'
  | 'chevronRight'
  | 'check'
  | 'search'
  | 'plus'
  | 'piano'
  | 'screen'
  | 'restart'
  | 'mail'
  | 'apple';

/** One stroke family (2.4 on a 24 grid, round caps). Decorative by default: pair with visible text. */
export function Icon({ name, size = 28, color = colors.ink }: { name: IconName; size?: number; color?: string }) {
  const s = { stroke: color, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  let body: React.ReactNode;
  switch (name) {
    case 'home':
      body = <Path d="M3.5 11 12 4l8.5 7v9a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z" {...s} />;
      break;
    case 'songs':
      body = (
        <>
          <Path d="M9 18V5.5l11-2V16" {...s} />
          <Circle cx={6.5} cy={18} r={2.8} {...s} />
          <Circle cx={17.5} cy={16} r={2.8} {...s} />
        </>
      );
      break;
    case 'star':
    case 'starOutline':
      body = (
        <Polygon
          points="12,2.8 14.8,8.9 21.3,9.5 16.4,13.9 17.8,20.4 12,17 6.2,20.4 7.6,13.9 2.7,9.5 9.2,8.9"
          {...s}
          fill={name === 'star' ? color : 'none'}
        />
      );
      break;
    case 'grownups':
      body = (
        <>
          <Circle cx={9} cy={8} r={3.2} {...s} />
          <Path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" {...s} />
          <Circle cx={17} cy={9} r={2.5} {...s} />
          <Path d="M16 14.2c2.9-.4 5 1.7 5 4.8" {...s} />
        </>
      );
      break;
    case 'lock':
    case 'unlock':
      body = (
        <>
          <Rect x={4.5} y={10.5} width={15} height={10.5} rx={2.5} {...s} />
          <Path d={name === 'lock' ? 'M8 10.5V7.5a4 4 0 0 1 8 0v3' : 'M8 10.5V7.5a4 4 0 0 1 7.6-1.8'} {...s} />
        </>
      );
      break;
    case 'play':
      body = <Polygon points="7,4.5 19.5,12 7,19.5" fill={color} stroke={color} strokeWidth={2} strokeLinejoin="round" />;
      break;
    case 'pause':
      body = (
        <>
          <Rect x={6} y={4.5} width={4} height={15} rx={1.2} fill={color} />
          <Rect x={14} y={4.5} width={4} height={15} rx={1.2} fill={color} />
        </>
      );
      break;
    case 'back10':
    case 'restart':
      body = (
        <>
          <Path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" {...s} />
          <Path d="M4 3.5v4h4" {...s} />
        </>
      );
      break;
    case 'close':
      body = <Path d="M6 6l12 12M18 6 6 18" {...s} />;
      break;
    case 'chevronLeft':
      body = <Path d="M15 5l-7 7 7 7" {...s} />;
      break;
    case 'chevronRight':
      body = <Path d="M9 5l7 7-7 7" {...s} />;
      break;
    case 'check':
      body = <Path d="M5 12.5l4.5 4.5L19 7.5" {...s} />;
      break;
    case 'search':
      body = (
        <>
          <Circle cx={10.5} cy={10.5} r={6} {...s} />
          <Path d="M15 15l5 5" {...s} />
        </>
      );
      break;
    case 'plus':
      body = <Path d="M12 5v14M5 12h14" {...s} />;
      break;
    case 'piano':
      body = (
        <>
          <Rect x={3} y={5} width={18} height={14} rx={2} {...s} />
          <Path d="M8 19v-6M12 19v-6M16 19v-6" {...s} />
          <Rect x={6.6} y={5} width={2.6} height={8} fill={color} />
          <Rect x={14.8} y={5} width={2.6} height={8} fill={color} />
        </>
      );
      break;
    case 'screen':
      body = (
        <>
          <Rect x={4} y={3} width={16} height={18} rx={2.5} {...s} />
          <Path d="M7 15h10M9 15v3M12 15v3M15 15v3" {...s} />
        </>
      );
      break;
    case 'mail':
      body = (
        <>
          <Rect x={3} y={5.5} width={18} height={13} rx={2} {...s} />
          <Path d="M3.5 7l8.5 6 8.5-6" {...s} />
        </>
      );
      break;
    case 'apple':
      body = (
        <Path
          d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.2.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.8zM14.1 5.8c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3z"
          fill={color}
        />
      );
      break;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {body}
    </Svg>
  );
}
