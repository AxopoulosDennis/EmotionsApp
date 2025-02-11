// RepostsTab.tsx
import React from 'react';
import VideoGrid from '../VideoGrid';

interface RepostsTabProps {
  data: { id: string; uri: string }[];
  tabBarHeight: number;
}

const RepostsTab: React.FC<RepostsTabProps> = ({ data, tabBarHeight }) => <VideoGrid data={data} tab="Reposts" tabBarHeight={tabBarHeight} />;

export default RepostsTab;
