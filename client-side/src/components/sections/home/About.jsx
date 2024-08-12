import React from 'react';
import announcementImage from '../../../assets/images/about/announcement.png';
import collaborationImage from '../../../assets/images/about/collaboration.png';
import socialImage from '../../../assets/images/about/social.png';

const About = () => {
  const aboutData = [
    {
      title: "Announcements",
      description: "Don't miss out! Stay updated on PSITS-hosted workshops, hackathons, and more events. Follow us for more details!",
      link: announcementImage
    },
    {
      title: "Collaborations",
      description: "Unleash your potential! Aspiring Full-Stack Developers, collaborate with us on cutting-edge projects on GitHub.",
      link: collaborationImage
    },
    {
      title: "Social Connections",
      description: "Build friendships, find mentors, and grow your network - Connect with like-minded peers and future colleagues at PSITS!",
      link: socialImage
    }
  ];

  return (
    <div className='container mx-auto px-4 lg:px-6 py-12 md:py-16 lg:py-20'>
      <div className='flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8'>
        {aboutData.map((data, index) => (
          <div
            key={index}
            className="flex flex-col items-center md:w-1/2 lg:w-1/3 p-4 lg:p-6"
          >
            <div className="w-full h-32 md:h-40 lg:h-48 mb-4">
              <img 
                src={data.link} 
                alt={data.title} 
                className="w-full h-full object-contain"
              />
            </div>
          
            <div className="text-center">
              <h3 className="font-extrabold text-lg md:text-xl mb-2 md:mb-3">{data.title}</h3>
              <p className="text-sm md:text-base text-gray-700">{data.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
