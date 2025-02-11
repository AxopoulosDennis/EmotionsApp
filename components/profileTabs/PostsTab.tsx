// PostsTab.tsx
import React from 'react';
import VideoGrid from '../VideoGrid';

interface PostsTabProps {
  data: { id: string; uri: string }[];
  tabBarHeight: number;
}

const PostsTab: React.FC<PostsTabProps> = ({ data, tabBarHeight }) => <VideoGrid data={data} tab="Posts" tabBarHeight={tabBarHeight} />;

export default PostsTab;
