import React from "react";
import { FaThumbsUp, FaComment, FaPlay } from "react-icons/fa";

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

  const psitsprofile =
    "https://scontent.fmnl13-1.fna.fbcdn.net/v/t39.30808-6/455793697_894768099336887_7380834457130486496_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEMLApj1f0amlyuNB_tM9qQq5MeuI7C0X2rkx64jsLRfR7Ww7AM98xdGIhBmckBBmZ179l6pU51YLGxkey9xKD1&_nc_ohc=T7tX5H6ZCRkQ7kNvgHpM2ox&_nc_ht=scontent.fmnl13-1.fna&oh=00_AYCdgkuBQGufBEPB9aYWH_o-N9WYXUUlVriCaWNy2ChLZQ&oe=66CA7AE2";

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
      className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden cursor-pointer"
      onClick={() => window.open(url, "_blank")}
    >
      <div className="flex items-center p-4">
        <img
          src={psitsprofile}
          alt={"Profile"}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              PSITS - UC Main
            </h3>
            <span className="ml-2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full flex items-center justify-center">
              {type}
            </span>
          </div>
          <p className="text-gray-500 text-sm">{formatTimeAgo(created_time)}</p>
        </div>
      </div>
      <div className="p-4">
        <p
          className="text-gray-800 mb-4"
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
              <div className="grid grid-cols-2 gap-[1px]">
                {visibleImages.slice(0, 4).map((src, index) => (
                  <div
                    key={index}
                    className={`relative ${index === 4 ? "col-span-2" : ""}`}
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
      <div className="p-4 pl-5 space-y-4">
        <div className="flex items-center space-x-4 text-gray-600">
          <div className="flex items-center">
            <FaThumbsUp className="text-blue-500" />
            <span className="ml-1 text-sm">{reactions_count}</span>
          </div>
          <div className="flex items-center">
            <FaComment className="text-green-500" />
            <span className="ml-1 text-sm">{comments_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
