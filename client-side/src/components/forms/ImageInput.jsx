import React from 'react';

const ImageInput = ({ label, handleImageChange, multiple, previews }) => {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-2 flex flex-wrap mb-2 gap-2">
        {previews.map((preview, index) => (
          <img
            key={index}
            src={preview}
            alt={`Preview ${index + 1}`}
            className="w-24 h-24 object-cover rounded-md border border-gray-300"
          />
        ))}
      </div>
      <input
        type="file"
        name="image_url"
        accept="image/*"
        onChange={handleImageChange}
        className="block w-full text-xs border border-gray-300 rounded-md p-2"
        multiple={multiple}
      />
    </div>
  );
};

export default ImageInput;
