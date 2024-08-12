import React from 'react';

const Banner = () => {
  const socialMediaLinks = [
    { name: 'Facebook', url: 'https://facebook.com', iconClass: 'fab fa-facebook-f', colorClass: 'text-blue-600', hoverClass: 'hover:text-blue-800' },
    { name: 'Gmail', url: 'mailto:example@gmail.com', iconClass: 'fas fa-envelope', colorClass: 'text-red-600', hoverClass: 'hover:text-red-800' },
    { name: 'GitHub', url: 'https://github.com', iconClass: 'fab fa-github', colorClass: 'text-gray-900', hoverClass: 'hover:text-gray-700' },
  ];

  const SocialLinks = () => (
    <div className="flex space-x-4 md:space-x-6">
      {socialMediaLinks.map(({ name, url, iconClass, colorClass, hoverClass }) => (
        <a key={name} href={url} target="_blank" rel="noopener noreferrer">
          <i className={`${iconClass} ${colorClass} text-xl ${hoverClass} transition-colors duration-300`}></i>
        </a>
      ))}
    </div>
  );

  return (
    <section className="relative h-screen py-20 md:py-24 flex items-center justify-center">
      <div className="m-auto max-w-4xl text-start md:text-center px-4 space-y-6 md:space-y-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold">
          Empowering the Next Generation of IT Professionals
        </h1>
        <p className="text-sm md:text-lg lg:text-xl xl:text-2xl">
          Develop skills, network, and be part of the PSITS community. Take action and become the IT professional you dream to be.
        </p>
      </div>
      <div className="absolute bottom-6 right-6">
        <SocialLinks />
      </div>
    </section>
  );
};

export default Banner;
