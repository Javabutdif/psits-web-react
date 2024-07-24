import React from 'react';
import logo from '../../assets/images/psits-logo.png';

const socialLinks = [
  { name: 'Facebook', iconClass: 'fa-brands fa-facebook fa-lg', url: 'https://www.facebook.com/PSITS.UCmain' },
  { name: 'github', iconClass: 'fa-brands fa-github fa-lg', url: 'https://github.com/PSITS-UC-MAIN/' },
  { name: 'gmail', iconClass: 'fa-solid fa-envelope fa-lg', url: 'mailto:psits.ccsmain@gmail.com' },
  // { name: 'Instagram', iconClass: 'fa-brands fa-instagram fa-lg', url: '#' }
];

const Footer = () => (
  <footer className="rounded-t-xl max-w-[1020px] mx-auto bg-primary  text-white py-4">
    <div className="  px-6 flex flex-col md:flex-row justify-between items-center">
      {/* Company Details */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-2 mb-4 md:mb-0">
          <img src={logo} alt="psits logo" className="w-12" />
          <h3 className="text-[0.6rem] mx-w-0 sm:text-xs sm:max-w-xs font-bold">
            PHILIPPINE SOCIETY OF INFORMATION TECHNOLOGY STUDENTS
          </h3>
        </div>
      </div>
      {/* Social Media Links */}
      <div className="flex flex-col items-center  md:items-start text-center md:text-left">
        <h5 className="text-sm font-medium mb-2">Questions? Contact us!</h5>
        <div className="flex space-x-6">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              className="text-white hover:text-gray-300 transition-transform duration-300 transform hover:scale-110"
              aria-label={link.name}
            >
              <i className={link.iconClass}></i>
            </a>
          ))}
        </div>
      </div>
    </div>
    <div className="mt-2 pt-2 text-center text-xs md:text-sm">
      <p>© {new Date().getFullYear()} PHILIPPINE SOCIETY OF INFORMATION TECHNOLOGY STUDENTS. All Rights Reserved.</p>
    </div>
  </footer>
);

export default Footer;
