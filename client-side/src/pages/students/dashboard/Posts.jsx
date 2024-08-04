import React from 'react';
import PostCard from './PostCard';

const Posts = ({ posts }) => {
  return (
    <div className="flex flex-col max-w-5xl mx-auto gap-6">
      {Object.values(posts).map((post, index) => (
        <PostCard post={post} key={index} />
      ))}
    </div>
  );
}

export default Posts;
