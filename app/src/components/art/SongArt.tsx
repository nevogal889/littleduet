import React from 'react';
import Svg, { Defs, Ellipse, G, Mask, Path, Polygon, Polyline, Rect } from 'react-native-svg';
import { ICON_SHAPES, type IconOp } from './iconShapes';

const rad = (a: number) => (a * Math.PI) / 180;

function arcPath(op: IconOp, pie: boolean): string {
  const cx = (op.x0 + op.x1) / 2;
  const cy = (op.y0 + op.y1) / 2;
  const rx = (op.x1 - op.x0) / 2;
  const ry = (op.y1 - op.y0) / 2;
  let a0 = op.a0;
  let a1 = op.a1;
  while (a1 < a0) a1 += 360;
  const p = (a: number) => `${(cx + rx * Math.cos(rad(a))).toFixed(2)} ${(cy + ry * Math.sin(rad(a))).toFixed(2)}`;
  const large = a1 - a0 > 180 ? 1 : 0;
  const arc = `A ${rx} ${ry} 0 ${large} 1 ${p(a1)}`;
  return pie ? `M ${cx} ${cy} L ${p(a0)} ${arc} Z` : `M ${p(a0)} ${arc}`;
}

function shape(op: IconOp, key: string | number, fill?: string): React.ReactNode {
  const c = fill ?? op.c;
  switch (op.t) {
    case 'e':
    case 'erase':
      return <Ellipse key={key} cx={(op.x0 + op.x1) / 2} cy={(op.y0 + op.y1) / 2} rx={(op.x1 - op.x0) / 2} ry={(op.y1 - op.y0) / 2} fill={c} />;
    case 'r':
      return <Rect key={key} x={op.x0} y={op.y0} width={op.x1 - op.x0} height={op.y1 - op.y0} rx={op.r || 0} fill={c} />;
    case 'p':
      return <Polygon key={key} points={op.pts.map((q: number[]) => q.join(',')).join(' ')} fill={c} />;
    case 'l':
      return (
        <Polyline
          key={key}
          points={op.pts.map((q: number[]) => q.join(',')).join(' ')}
          fill="none"
          stroke={c}
          strokeWidth={op.w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'a':
      return <Path key={key} d={arcPath(op, false)} fill="none" stroke={c} strokeWidth={op.w} strokeLinecap="round" />;
    case 'pie':
      return <Path key={key} d={arcPath(op, true)} fill={c} />;
    default:
      return null;
  }
}

/**
 * Flat song characters (same shapes as the lesson videos, imported from video/ld_icons.py).
 * Unknown ids fall back to the music note. `silhouette` draws a single-colour shape.
 */
export function SongArt({ icon, size = 96, silhouette }: { icon: string; size?: number; silhouette?: string }) {
  const name = ICON_SHAPES[icon] ? icon : 'music';
  const ops = ICON_SHAPES[name];
  let layer: React.ReactNode[] = [];
  const defs: React.ReactNode[] = [];
  ops.forEach((op, i) => {
    if (op.t === 'erase') {
      const id = `m-${name}-${i}`;
      defs.push(
        <Mask key={id} id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <Rect x="0" y="0" width="100" height="100" fill="#FFFFFF" />
          {shape(op, 'x', '#000000')}
        </Mask>,
      );
      layer = [
        <G key={`g${i}`} mask={`url(#${id})`}>
          {layer}
        </G>,
      ];
    } else {
      layer.push(shape(op, i, silhouette));
    }
  });
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {defs.length ? <Defs>{defs}</Defs> : null}
      {layer}
    </Svg>
  );
}
