import React from 'react'
import PostCard from './PostCard'

const Posts = ({ posts }) => {
    console.log(posts)

  return (
    <div className="flex w-full flex-col gap-4 max-w-5xl">
      
      {Object.values(posts).map((post, index) => (
          <PostCard post={post} key={index}  />
        ))}

    </div>
  )
}

export default Posts
