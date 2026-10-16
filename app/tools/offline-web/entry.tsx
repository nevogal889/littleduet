// Offline web preview entry: the real app routes, wired into the tiny router shim.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterRoot, type RouteDef } from './shims/expo-router';
import RootLayout from '../../app/_layout';
import TabsLayout from '../../app/(tabs)/_layout';
import Home from '../../app/(tabs)/index';
import Songs from '../../app/(tabs)/songs';
import Stickers from '../../app/(tabs)/stickers';
import GrownUps from '../../app/(tabs)/grownups';
import Onboarding from '../../app/onboarding';
import SongPage from '../../app/song/[id]';
import Player from '../../app/play/[classId]';
import Celebrate from '../../app/celebrate';
import PaywallRoute from '../../app/paywall';
import Account from '../../app/account';
import Licenses from '../../app/licenses';
import Settings from '../../app/settings';
import Tutorial from '../../app/tutorial';

const routes: RouteDef[] = [
  { pattern: '/', Component: Home, tab: true },
  { pattern: '/songs', Component: Songs, tab: true },
  { pattern: '/stickers', Component: Stickers, tab: true },
  { pattern: '/grownups', Component: GrownUps, tab: true },
  { pattern: '/onboarding', Component: Onboarding },
  { pattern: '/song/:id', Component: SongPage },
  { pattern: '/play/:classId', Component: Player },
  { pattern: '/celebrate', Component: Celebrate },
  { pattern: '/paywall', Component: PaywallRoute },
  { pattern: '/account', Component: Account },
  { pattern: '/licenses', Component: Licenses },
  { pattern: '/settings', Component: Settings },
  { pattern: '/tutorial', Component: Tutorial },
];

createRoot(document.getElementById('root')!).render(
  <RouterRoot routes={routes} TabsLayout={TabsLayout}>
    <RootLayout />
  </RouterRoot>,
);
