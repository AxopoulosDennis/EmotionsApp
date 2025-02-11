// PostsTab.tsx
import React from 'react';
import VideoGrid from '../VideoGrid';

interface ReactionsTabProps {
  data: { id: string; uri: string }[];
  tabBarHeight: number;
}

const ReactionsTab: React.FC<ReactionsTabProps> = ({ data, tabBarHeight }) => <VideoGrid data={data} tab="Reactions" tabBarHeight={tabBarHeight} />;

export default ReactionsTab;
