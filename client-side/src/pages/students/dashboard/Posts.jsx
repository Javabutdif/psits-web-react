import React from 'react';
import PostCard from './PostCard';

const Posts = ({ posts, styles }) => {
  return (
    <div className={`${styles} flex flex-col  mx-auto gap-6`}>
      {Object.values(posts).map((post, index) => (
        <PostCard post={post} key={index} />
      ))}
    </div>
  );
}

export default Posts;
