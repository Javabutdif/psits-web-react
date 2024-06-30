import React from "react";

const DeansMessage = () => {
    const messageData = {
        name: 'Mr. Neil Basabe',
        position: "Dean - UC Main CSS",
        image: "",
        message: `
        As the Dean of our esteemed college, we're thrilled to have you here. I am committed to fostering a supportive and dynamic learning environment where you can thrive. Explore the many opportunities available, from internships to hackathons, to gain valuable real-world experience and develop your skills. We encourage active participation and collaboration – your voice matters! We're here to help you succeed in this ever-evolving field. \n
        Best wishes for an amazing academic journey!`
    };

    return (
        <div className=" mt-24 sm:mt-40 md:mt-52 xl:mt-42 2xl:mt-72 py-24 lg:py-32 xl:py-52  font-montserrat">
            <div className="container mx-auto max-w-1/4 relative px-8 lg:flex lg:justify-center lg:items-center">
                    <div className="lg:w-1/3 absolute self-stretch -top-20 left-1/2 -translate-x-2/4 lg:relative lg:left-0 lg:top-0 lg:translate-x-0">
                    <img
                    src="https://th.bing.com/th?id=OIP.YjJSBQVO5Cy9RBxwNqfj7AHaJ5&w=216&h=289&c=8&rs=1&qlt=90&o=6&dpr=1.1&pid=3.1&rm=2"
                    alt={messageData.name}
                    className="aspect-w-16 aspect-h-16  lg:aspect-[16/9] object-cover lg:object-contain rounded-full lg:rounded-none w-32 h-32 lg:w-full lg:h-full mx-auto lg:mx-0 lg:ml-0"
                />  </div>
                    <div className="w-full border-black border-l-8 lg:max-w-xl p-4 pt-16 lg:p-8 bg-gray-100 rounded-lg">
                        <h2 className="text-2xl lg:text-3xl  font-bold mb-4 text-gray-800">Dean's Welcome Message</h2>
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
