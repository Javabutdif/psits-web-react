import React from "react";

const DeansMessage = () => {
  const messageData = {
    name: 'Mr. Neil Basabe',
    position: "Dean - UC Main CSS",
    image: "https://th.bing.com/th?id=OIP.YjJSBQVO5Cy9RBxwNqfj7AHaJ5&w=216&h=289&c=8&rs=1&qlt=90&o=6&dpr=1.1&pid=3.1&rm=2",
    message: `
      As the Dean of our esteemed college, we're thrilled to have you here. I am committed to fostering a supportive and dynamic learning environment where you can thrive. Explore the many opportunities available, from internships to hackathons, to gain valuable real-world experience and develop your skills. We encourage active participation and collaboration – your voice matters! We're here to help you succeed in this ever-evolving field.

      Best wishes for an amazing academic journey!`
  };

  return (
    <div className="mt-24 sm:mt-40 md:mt-52 xl:mt-72 py-24 lg:py-32 xl:py-52 font-montserrat">
      <div className="container mx-auto max-w-3xl relative px-8 lg:flex lg:justify-center lg:items-center">
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 ">
          <img
            src={messageData.image}
            alt={messageData.name}
            className="w-32 h-32 lg:w-72 lg:h-72  object-cover lg:object-contain rounded-full mx-auto lg:mx-0 lg:ml-0"
          />
        </div>
        <div className="w-full lg:w-auto border-l-8 border-black pt-20 px-4 pb-4 lg:px-8 lg:pb-8  lg:pt-32 bg-gray-100 rounded-lg">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-800">Dean's Welcome Message</h2>
          <p className="text-gray-700 leading-relaxed">
            <span className="font-semibold block mb-2">Dear Students,</span>
            {messageData.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeansMessage;
