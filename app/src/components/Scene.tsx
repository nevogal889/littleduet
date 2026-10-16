import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme';
import { SongArt } from './art/SongArt';

export type SceneId =
  | 'sit' | 'roles' | 'middle-c' | 'black-keys' | 'hand-home' | 'phone-flat' | 'glow' | 'falling' | 'fingers'
  | 'bear-bird' | 'watch' | 'your-turn' | 'together' | 'listening' | 'controls' | 'stars' | 'mistakes-ok' | 'ready';

export const SCENES: SceneId[] = ['sit', 'roles', 'middle-c', 'black-keys', 'hand-home', 'phone-flat', 'glow', 'falling', 'fingers', 'bear-bird', 'watch', 'your-turn', 'together', 'listening', 'controls', 'stars', 'mistakes-ok', 'ready'];

const INK = colors.ink;
const CORAL = colors.brand;
const GOLD = colors.gold;
const BLUE = colors.blue;
const GREEN = colors.green;
const SOFT = '#EEE8E1';
const FONT = 'Nunito_800ExtraBold';
const BLACK_OF = [1, 3, 6, 8, 10];

/** Piano strip starting at C, `oct` octaves wide. hi: white-key indexes (0 = first C) or black ids 'b<semi>-<oct>'. */
function Keys({ x, y, w, h, oct = 2, hiWhite = {}, hiBlack = {}, labels = {} }: { x: number; y: number; w: number; h: number; oct?: number; hiWhite?: Record<number, string>; hiBlack?: Record<string, string>; labels?: Record<number, string> }) {
  const n = oct * 7 + 1;
  const kw = w / n;
  const whites = Array.from({ length: n }, (_, i) => (
    <G key={`w${i}`}>
      <Rect x={x + i * kw} y={y} width={kw - 1.5} height={h} rx={3} fill={hiWhite[i] ?? '#FFFFFF'} stroke="#D9D1C7" strokeWidth={1.2} />
      {labels[i] ? (
        <SvgText x={x + i * kw + kw / 2} y={y + h - 8} fontSize={Math.min(14, kw * 0.55)} fontFamily={FONT} fill={hiWhite[i] ? '#FFFFFF' : INK} textAnchor="middle">
          {labels[i]}
        </SvgText>
      ) : null}
    </G>
  ));
  const blacks: React.ReactNode[] = [];
  for (let o = 0; o < oct; o++) {
    for (const semi of BLACK_OF) {
      const leftWhite = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 }[semi as 1 | 3 | 6 | 8 | 10]!;
      const cx = x + (o * 7 + leftWhite + 1) * kw - 0.75;
      const id = `b${semi}-${o}`;
      blacks.push(<Rect key={id} x={cx - kw * 0.3} y={y} width={kw * 0.6} height={h * 0.6} rx={2} fill={hiBlack[id] ?? INK} />);
    }
  }
  return (
    <G>
      {whites}
      {blacks}
    </G>
  );
}

function Person({ x, y, s, body, label }: { x: number; y: number; s: number; body: string; label?: string }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={12 * s} fill="#F2C9A6" />
      <Path d={`M ${x - 18 * s} ${y + 46 * s} Q ${x - 18 * s} ${y + 14 * s} ${x} ${y + 14 * s} Q ${x + 18 * s} ${y + 14 * s} ${x + 18 * s} ${y + 46 * s} Z`} fill={body} />
      {label ? (
        <SvgText x={x} y={y - 18 * s} fontSize={12} fontFamily={FONT} fill={INK} textAnchor="middle">
          {label}
        </SvgText>
      ) : null}
    </G>
  );
}

function Hand({ x, y, s = 1, numbers = true }: { x: number; y: number; s?: number; numbers?: boolean }) {
  // Right hand seen from above: thumb (1) on the left, pinky (5) on the right.
  const fingers = [
    { dx: -30, len: 26, ang: -35 },
    { dx: -14, len: 40, ang: -8 },
    { dx: 0, len: 44, ang: 0 },
    { dx: 14, len: 40, ang: 6 },
    { dx: 27, len: 30, ang: 14 },
  ];
  return (
    <G>
      <Rect x={x - 32 * s} y={y} width={64 * s} height={46 * s} rx={20 * s} fill="#F2C9A6" />
      {fingers.map((f, i) => {
        const fx = x + f.dx * s;
        const tipX = fx + Math.sin((f.ang * Math.PI) / 180) * f.len * s;
        const tipY = y + 6 * s - Math.cos((f.ang * Math.PI) / 180) * f.len * s;
        return (
          <G key={i}>
            <Line x1={fx} y1={y + 10 * s} x2={tipX} y2={tipY} stroke="#F2C9A6" strokeWidth={13 * s} strokeLinecap="round" />
            {numbers ? (
              <G>
                <Circle cx={tipX} cy={tipY - 2} r={8.5 * s} fill={INK} />
                <SvgText x={tipX} y={tipY + 2.5} fontSize={11 * s} fontFamily={FONT} fill="#FFFFFF" textAnchor="middle">
                  {i + 1}
                </SvgText>
              </G>
            ) : null}
          </G>
        );
      })}
    </G>
  );
}

function Banner({ label, color, icon }: { label: string; color: string; icon: React.ReactNode }) {
  return (
    <G>
      <Rect x={40} y={60} width={240} height={80} rx={40} fill={color} />
      <Circle cx={88} cy={100} r={28} fill="#FFFFFF" opacity={0.25} />
      {icon}
      <SvgText x={190} y={110} fontSize={26} fontFamily={FONT} fill="#FFFFFF" textAnchor="middle">
        {label}
      </SvgText>
    </G>
  );
}

const Eye = ({ cx, cy, c = '#FFFFFF' }: { cx: number; cy: number; c?: string }) => (
  <G>
    <Path d={`M ${cx - 18} ${cy} Q ${cx} ${cy - 16} ${cx + 18} ${cy} Q ${cx} ${cy + 16} ${cx - 18} ${cy} Z`} fill={c} />
    <Circle cx={cx} cy={cy} r={6} fill={INK} />
  </G>
);
const Point = ({ cx, cy }: { cx: number; cy: number }) => (
  <G>
    <Rect x={cx - 10} y={cy - 2} width={20} height={18} rx={7} fill="#FFFFFF" />
    <Rect x={cx - 3} y={cy - 20} width={7} height={22} rx={3.5} fill="#FFFFFF" />
  </G>
);
const Two = ({ cx, cy }: { cx: number; cy: number }) => (
  <G>
    <Circle cx={cx - 9} cy={cy - 8} r={6} fill="#FFFFFF" />
    <Circle cx={cx + 9} cy={cy - 5} r={5} fill="#FFFFFF" />
    <Rect x={cx - 17} y={cy} width={16} height={14} rx={7} fill="#FFFFFF" />
    <Rect x={cx + 2} y={cy + 2} width={14} height={12} rx={6} fill="#FFFFFF" />
  </G>
);
const Star = ({ cx, cy, r, c = GOLD }: { cx: number; cy: number; r: number; c?: string }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`;
  }).join(' ');
  return <Polygon points={pts} fill={c} />;
};

function body(id: SceneId, labels: { grownUp: string; child: string }): React.ReactNode {
  switch (id) {
    case 'sit':
      return (
        <G>
          <Rect x={30} y={150} width={260} height={10} rx={5} fill={SOFT} />
          <Keys x={60} y={118} w={200} h={34} oct={2} />
          <Person x={120} y={56} s={1.25} body={CORAL} label={labels.grownUp} />
          <Person x={196} y={76} s={0.9} body={GOLD} label={labels.child} />
        </G>
      );
    case 'roles':
      return (
        <G>
          <Rect x={20} y={30} width={130} height={140} rx={22} fill="#FDEBE7" />
          <Person x={85} y={60} s={1.1} body={CORAL} />
          <SvgText x={85} y={150} fontSize={14} fontFamily={FONT} fill={INK} textAnchor="middle">{labels.grownUp}</SvgText>
          <Rect x={170} y={30} width={130} height={140} rx={22} fill="rgba(255,200,0,0.18)" />
          <Person x={235} y={66} s={0.85} body={GOLD} />
          <SvgText x={235} y={150} fontSize={14} fontFamily={FONT} fill={INK} textAnchor="middle">{labels.child}</SvgText>
        </G>
      );
    case 'middle-c':
      return (
        <G>
          <Keys x={20} y={70} w={280} h={100} oct={2} hiWhite={{ 7: CORAL }} labels={{ 7: 'C' }} hiBlack={{ 'b1-1': BLUE, 'b3-1': BLUE }} />
          <Rect x={20 + (280 / 15) * 7.5} y={56} width={(280 / 15) * 1.2} height={10} rx={5} fill={BLUE} />
          <Path d={`M ${20 + (280 / 15) * 7.5} 40 L ${20 + (280 / 15) * 7.5} 66`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <Polygon points={`${20 + (280 / 15) * 7.5 - 7},58 ${20 + (280 / 15) * 7.5 + 7},58 ${20 + (280 / 15) * 7.5},68`} fill={INK} />
        </G>
      );
    case 'black-keys':
      return (
        <G>
          <Keys x={20} y={60} w={280} h={110} oct={2} hiBlack={{ 'b1-0': BLUE, 'b3-0': BLUE, 'b6-0': GREEN, 'b8-0': GREEN, 'b10-0': GREEN, 'b1-1': BLUE, 'b3-1': BLUE, 'b6-1': GREEN, 'b8-1': GREEN, 'b10-1': GREEN }} />
          <SvgText x={60} y={44} fontSize={20} fontFamily={FONT} fill={BLUE} textAnchor="middle">2</SvgText>
          <SvgText x={130} y={44} fontSize={20} fontFamily={FONT} fill={GREEN} textAnchor="middle">3</SvgText>
          <SvgText x={190} y={44} fontSize={20} fontFamily={FONT} fill={BLUE} textAnchor="middle">2</SvgText>
          <SvgText x={262} y={44} fontSize={20} fontFamily={FONT} fill={GREEN} textAnchor="middle">3</SvgText>
        </G>
      );
    case 'hand-home':
      return (
        <G>
          <Keys x={20} y={120} w={280} h={70} oct={1} hiWhite={{ 0: CORAL, 1: CORAL, 2: CORAL, 3: CORAL, 4: CORAL }} labels={{ 0: '1', 1: '2', 2: '3', 3: '4', 4: '5' }} />
          <Hand x={110} y={64} s={1.1} />
        </G>
      );
    case 'fingers':
      return <Hand x={160} y={92} s={1.6} />;
    case 'phone-flat':
      return (
        <G>
          <Path d="M 40 160 L 280 160 L 250 120 L 70 120 Z" fill={SOFT} />
          <Path d="M 90 150 L 230 150 L 214 126 L 106 126 Z" fill={INK} />
          <Path d="M 98 146 L 222 146 L 209 130 L 111 130 Z" fill="#FFFFFF" />
          <Hand x={186} y={70} s={0.8} numbers={false} />
          <Circle cx={168} cy={136} r={6} fill={CORAL} opacity={0.8} />
        </G>
      );
    case 'glow':
      return (
        <G>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Line key={i} x1={160} y1={86} x2={160 + Math.cos(-Math.PI / 2 + (i - 3) * 0.35) * 60} y2={86 + Math.sin(-Math.PI / 2 + (i - 3) * 0.35) * 60} stroke={GOLD} strokeWidth={4} strokeLinecap="round" />
          ))}
          <Keys x={20} y={90} w={280} h={100} oct={2} hiWhite={{ 7: CORAL }} />
        </G>
      );
    case 'falling':
      return (
        <G>
          <Rect x={20} y={10} width={280} height={86} rx={8} fill="#EEF1F6" />
          <Rect x={20 + (280 / 15) * 7 + 3} y={60} width={280 / 15 - 7} height={34} rx={6} fill={CORAL} />
          <Rect x={20 + (280 / 15) * 9 + 3} y={22} width={280 / 15 - 7} height={26} rx={6} fill={CORAL} opacity={0.75} />
          <Keys x={20} y={98} w={280} h={92} oct={2} hiWhite={{ 7: CORAL }} />
        </G>
      );
    case 'bear-bird':
      return (
        <G>
          <Keys x={20} y={110} w={280} h={80} oct={2} hiWhite={{ 0: 'rgba(61,76,140,0.35)', 1: 'rgba(61,76,140,0.35)', 2: 'rgba(61,76,140,0.35)', 12: 'rgba(245,184,61,0.5)', 13: 'rgba(245,184,61,0.5)', 14: 'rgba(245,184,61,0.5)' }} />
        </G>
      );
    case 'watch':
      return <Banner label="WATCH" color={BLUE} icon={<Eye cx={88} cy={100} />} />;
    case 'your-turn':
      return <Banner label="YOUR TURN" color={CORAL} icon={<Point cx={88} cy={102} />} />;
    case 'together':
      return <Banner label="TOGETHER" color={GREEN} icon={<Two cx={88} cy={100} />} />;
    case 'listening':
      return (
        <G>
          <Keys x={20} y={124} w={280} h={66} oct={2} />
          <Rect x={146} y={24} width={28} height={50} rx={14} fill={colors.indigo} />
          <Path d="M 136 58 Q 136 90 160 90 Q 184 90 184 58" stroke={colors.indigo} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Line x1={160} y1={90} x2={160} y2={108} stroke={colors.indigo} strokeWidth={5} strokeLinecap="round" />
          {[1, 2].map((k) => (
            <G key={k}>
              <Path d={`M ${200 + k * 14} ${40 - k * 4} Q ${214 + k * 16} 58 ${200 + k * 14} ${76 + k * 4}`} stroke={GOLD} strokeWidth={4} fill="none" strokeLinecap="round" />
              <Path d={`M ${120 - k * 14} ${40 - k * 4} Q ${106 - k * 16} 58 ${120 - k * 14} ${76 + k * 4}`} stroke={GOLD} strokeWidth={4} fill="none" strokeLinecap="round" />
            </G>
          ))}
        </G>
      );
    case 'controls':
      return (
        <G>
          <Rect x={40} y={60} width={110} height={56} rx={20} fill="#FFFFFF" stroke="#D9D1C7" strokeWidth={2} />
          <Line x1={62} y1={78} x2={80} y2={96} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <Line x1={80} y1={78} x2={62} y2={96} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <SvgText x={118} y={94} fontSize={15} fontFamily={FONT} fill={INK} textAnchor="middle">STOP</SvgText>
          <Circle cx={230} cy={88} r={40} fill={CORAL} />
          <Rect x={216} y={70} width={9} height={36} rx={3} fill="#FFFFFF" />
          <Rect x={235} y={70} width={9} height={36} rx={3} fill="#FFFFFF" />
        </G>
      );
    case 'stars':
      return (
        <G>
          <Star cx={90} cy={110} r={40} />
          <Star cx={160} cy={86} r={48} />
          <Star cx={230} cy={110} r={40} />
        </G>
      );
    case 'mistakes-ok':
      return (
        <G>
          <Keys x={20} y={110} w={280} h={80} oct={2} hiWhite={{ 6: 'rgba(28,176,246,0.35)', 7: CORAL }} />
          <Circle cx={160} cy={56} r={36} fill={GOLD} />
          <Circle cx={148} cy={50} r={4} fill={INK} />
          <Circle cx={172} cy={50} r={4} fill={INK} />
          <Path d="M 146 64 Q 160 76 174 64" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'ready':
      return (
        <G>
          <Star cx={160} cy={96} r={58} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Rect key={i} x={40 + i * 48} y={20 + (i % 2) * 18} width={10} height={14} rx={3} fill={[CORAL, BLUE, GREEN, GOLD, colors.indigo, CORAL][i]} transform={`rotate(${i * 30} ${45 + i * 48} ${27 + (i % 2) * 18})`} />
          ))}
        </G>
      );
  }
}

/** One tutorial picture. Decorative: the caption and the teacher's voice carry the meaning. */
export function Scene({ id, width, labels }: { id: SceneId; width: number; labels: { grownUp: string; child: string } }) {
  const h = (width * 200) / 320;
  return (
    <View style={{ width, height: h }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" testID={`scene-${id}`}>
      <Svg width={width} height={h} viewBox="0 0 320 200">
        {body(id, labels)}
      </Svg>
      {id === 'bear-bird' ? (
        <>
          <View style={{ position: 'absolute', left: width * 0.06, top: h * 0.08 }}>
            <SongArt icon="bear" size={width * 0.22} />
          </View>
          <View style={{ position: 'absolute', right: width * 0.06, top: h * 0.08 }}>
            <SongArt icon="bird" size={width * 0.22} />
          </View>
        </>
      ) : null}
    </View>
  );
}
