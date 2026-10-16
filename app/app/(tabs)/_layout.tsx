import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { TabBar } from '../../src/components/TabBar';
import { useApp } from '../../src/state/store';

export default function TabsLayout() {
  const { data } = useApp();
  if (!data.onboarded || data.children.length === 0) return <Redirect href="/onboarding" />;
  return (
    <Tabs tabBar={() => <TabBar />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="songs" />
      <Tabs.Screen name="stickers" />
      <Tabs.Screen name="grownups" />
    </Tabs>
  );
}
