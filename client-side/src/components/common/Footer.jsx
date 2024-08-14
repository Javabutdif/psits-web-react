import React from 'react';
import logo from '../../assets/images/psits-logo.png';
import ucBuilding from '../../assets/images/UCBuilding_bg.png';

const socialLinks = [
  { name: 'Facebook', iconClass: 'fa-brands fa-facebook fa-lg', url: 'https://www.facebook.com/PSITS.UCmain' },
  { name: 'GitHub', iconClass: 'fa-brands fa-github fa-lg', url: 'https://github.com/PSITS-UC-MAIN/' },
  { name: 'Email', iconClass: 'fa-solid fa-envelope fa-lg', url: 'mailto:psits.ccsmain@gmail.com' },
];

const Footer = () => (
  <footer className="relative bg-gradient-to-t from-[#4398AC] to-[#f2f2f2] pt-60 md:pt-96">
    <img src={ucBuilding} className="opacity-20 absolute bottom-0 w-full object-cover h-48 md:h-64 lg:h-80" alt="UC Building" />
    <div className="container relative z-10 py-10 flex flex-col items-center text-center text-white space-y-4">
      <div className="flex space-x-6">
        {socialLinks.map((link, index) => (
          <a 
            key={index} 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white hover:text-gray-300 transition-colors duration-300"
            aria-label={link.name}
          >
            <i className={link.iconClass}></i>
          </a>
        ))}
      </div>
      <p className="text-xs sm:text-sm mt-4">
        PHILIPPINE SOCIETY OF INFORMATION TECHNOLOGY STUDENTS
      </p>
    </div>
  </footer>
);

export default Footer;
