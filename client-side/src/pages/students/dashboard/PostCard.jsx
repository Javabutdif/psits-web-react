import React from 'react';

const PostCard = ({ post }) => {
    const { img, userName, timePosted, typeOfPost, description, postImage } = post;

    const formatTimeAgo = (time) => {
        const now = new Date();
        const postTime = new Date(time);
        const diffInSeconds = Math.floor((now - postTime) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min${diffInSeconds < 120 ? '' : 's'} ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr${diffInSeconds < 7200 ? '' : 's'} ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day${diffInSeconds < 172800 ? '' : 's'} ago`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 604800)} week${diffInSeconds < 1209600 ? '' : 's'} ago`;
        
        return `${Math.floor(diffInSeconds / 31536000)} year${diffInSeconds < 63072000 ? '' : 's'} ago`;
    };
    
    return (
        <div className="space-y-6 border p-4">
            <div className="flex items-center relative">
                <img src={img} alt={userName} className="w-12 h-12 rounded-full mr-2" />
                <div>
                    <h3 className="relative">
                        {userName}
                        <span className="absolute -top-0 -right-16 bg-black text-white p-1 px-2 rounded-full text-sm">{typeOfPost}</span>
                    </h3>
                    <p className="text-gray-500 text-xs">{formatTimeAgo(timePosted)}</p>
                </div>
            </div>
            <div>
                <p>{description}</p>
                <div>
                    <img src={postImage} alt="" className="w-full" />
                </div>
            </div>
        </div>
    );
};

export default PostCard;
