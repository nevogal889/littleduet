// react-native-svg -> DOM svg (offline web preview only).
import React from 'react';

function clean(p: any) {
  const { accessibilityElementsHidden, importantForAccessibility, children, ...rest } = p;
  return { rest, children, hidden: accessibilityElementsHidden || importantForAccessibility === 'no-hide-descendants' };
}
const mk = (tag: string) =>
  function SvgEl(p: any) {
    const { rest, children } = clean(p);
    return React.createElement(tag, rest, children);
  };

export default function Svg(p: any) {
  const { rest, children, hidden } = clean(p);
  return React.createElement('svg', { ...rest, style: { display: 'block', flexShrink: 0, overflow: 'visible' }, 'aria-hidden': hidden || undefined }, children);
}
export const G = mk('g');
export const Path = mk('path');
export const Circle = mk('circle');
export const Rect = mk('rect');
export const Ellipse = mk('ellipse');
export const Polygon = mk('polygon');
export const Polyline = mk('polyline');
export const Line = mk('line');
export const Defs = mk('defs');
export const Mask = mk('mask');
export const LinearGradient = mk('linearGradient');
export const Stop = mk('stop');
export function Text(p: any) {
  const { rest, children } = clean(p);
  const fontFamily = typeof rest.fontFamily === 'string' && rest.fontFamily.startsWith('Nunito') ? "'Nunito','DM Sans',system-ui,sans-serif" : rest.fontFamily;
  return React.createElement('text', { ...rest, fontFamily, fontWeight: 800 }, children);
}
