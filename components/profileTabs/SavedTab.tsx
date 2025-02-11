// SavedTab.tsx
import React from 'react';
import VideoGrid from '../VideoGrid';

interface SavedTabProps {
  data: { id: string; uri: string }[];
  tabBarHeight: number;
}

const SavedTab: React.FC<SavedTabProps> = ({ data, tabBarHeight }) => <VideoGrid data={data} tab="Saved" tabBarHeight={tabBarHeight} />;

export default SavedTab;
