import React from 'react';

const About = () => {
  const aboutData = [
    {
      title: "Announcements",
      description: "Don't miss out! Stay updated on PSITS-hosted workshops, hackathons, and more events. Follow us for more details!",
      link: "https://www.hscompanies.com/wp-content/uploads/2017/12/Anouncements-image.png"
    },
    {
      title: "Collaborations",
      description: "Unleash your potential! Aspiring Full-Stack Developers, collaborate with us on cutting-edge projects on GitHub.",
      link: "https://th.bing.com/th/id/OIP.KZemM9TGpfMSxEB4Yj4kvQAAAA?rs=1&pid=ImgDetMain"
    },
    {
      title: "Social Connections",
      description: "Build friendships, find mentors, and grow your network - Connect with like-minded peers and future colleagues at PSITS!",
      link: "https://th.bing.com/th/id/OIP.LfnlUi5iW9GdgQ30_ZjvuQHaEK?rs=1&pid=ImgDetMain"
    }
  ];

  return (
    <div className='py-24 bg-[#074873]'>
    <div className='container mx-auto text-white px-6'>
      <div className='flex flex-col lg:flex-row gap-12'>
        {aboutData.map((data, index) => (
          <div
            key={index}
            className="relative bg-white rounded-lg shadow-lg overflow-hidden lg:w-1/3 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl border-4 border-white"
          >
            <img src={data.link} alt={data.title} className="w-full h-48 object-cover " />
            <div className="p-6 text-center">
              <h4 className="text-2xl font-bold text-gray-800 mb-4">{data.title}</h4>
              <p className="text-gray-600">{data.description}</p>
              <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-500 hover:bg-opacity-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

export default About;
