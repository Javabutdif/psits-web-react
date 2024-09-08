import React from "react";
import { FaThumbsUp, FaComment, FaPlay } from "react-icons/fa";
import PostProfile from '../../../assets/images/psits-logo.jpg'

const PostCard = ({ post }) => {
  const {
    created_time,
    reactions_count,
    comments_count,
    description,
    imageSources,
    type,
    url,
  } = post;

  const getDescription = () => {
    switch (type) {
      case "profile_media":
        return "PSITS - UC Main updated their profile picture.";
      case "cover_photo":
        return "PSITS - UC Main updated their cover photo.";
      default:
        return description.replace(/\n/g, "<br />"); // Replace \n with <br> tags
    }
  };

  const formatTimeAgo = (time) => {
    const now = new Date();
    const postTime = new Date(time);
    const diffInSeconds = Math.floor((now - postTime) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min${
        diffInSeconds < 120 ? "" : "s"
      } ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hr${
        diffInSeconds < 7200 ? "" : "s"
      } ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} day${
        diffInSeconds < 172800 ? "" : "s"
      } ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 604800)} week${
        diffInSeconds < 1209600 ? "" : "s"
      } ago`;

    return `${Math.floor(diffInSeconds / 31536000)} year${
      diffInSeconds < 63072000 ? "" : "s"
    } ago`;
  };

  const visibleImages = imageSources.slice(0, 5);
  const extraImagesCount =
    imageSources.length > 4 ? imageSources.length - 3 : 0;

  return (
    <div
      className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden cursor-pointer max-w-5xl"
      onClick={() => window.open(url, "_blank")}
    >
      <div className="flex items-center p-4 md:p-6 pb-0">
        <img
          src={PostProfile}
          alt={"Profile"}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
              PSITS - UC Main
            </h3>
            <span className="ml-2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full flex items-center justify-center">
              {type}
            </span>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm md:text-base">
            {formatTimeAgo(created_time)}
          </p>
        </div>
      </div>
      <div className="p-4 lmdg:p-6">
        <p
          className="text-gray-800 mb-4 text-xs sm:text-sm md:text-base"
          dangerouslySetInnerHTML={{ __html: getDescription() }}
        />
        {imageSources.length > 0 && (
          <div className="relative">
            {imageSources.length === 1 ? (
              <div className="relative">
                <img
                  src={imageSources[0]}
                  alt="Post"
                  className="w-full rounded-md object-cover"
                />
                {type === "video_inline" && (
                  <FaPlay className="absolute inset-0 m-auto text-white text-4xl" />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {visibleImages.slice(0, 4).map((src, index) => (
                  <div
                    key={index}
                    className={`relative ${index === 4 ? "col-span-2" : imageSources.length < 4 && index === 2 ? "col-span-full" : ""}`}
                  >
                    <img
                      src={src}
                      alt={`Post Image ${index + 1}`}
                      className="w-full object-cover"
                    />
                    {type === "video_inline" && index === 0 && (
                      <FaPlay className="absolute inset-0 m-auto text-white text-4xl" />
                    )}
                    {index === 3 && extraImagesCount > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold">
                        +{extraImagesCount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-4 pl-6 md:p-6 pt-0 md:pl-8 space-y-4">
        <div className="flex items-center space-x-4 text-gray-600 text-xs sm:text-sm md:text-base">
          <div className="flex items-center">
            <FaThumbsUp className="text-blue-500" />
            <span className="ml-1">{reactions_count}</span>
          </div>
          <div className="flex items-center">
            <FaComment className="text-green-500" />
            <span className="ml-1">{comments_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
