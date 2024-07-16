import React from 'react'
import PostCard from './PostCard'

const Posts = ({ posts }) => {
    console.log(posts)

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      
      {Object.values(posts).map((post, index) => (
          <PostCard post={post} key={index}  />
        ))}

    </div>
  )
}

export default Posts
