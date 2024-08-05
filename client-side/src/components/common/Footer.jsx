import React from 'react';
import logo from '../../assets/images/psits-logo.png';

const socialLinks = [
  { name: 'Facebook', iconClass: 'fa-brands fa-facebook fa-lg', url: 'https://www.facebook.com/PSITS.UCmain' },
  { name: 'GitHub', iconClass: 'fa-brands fa-github fa-lg', url: 'https://github.com/PSITS-UC-MAIN/' },
  { name: 'Email', iconClass: 'fa-solid fa-envelope fa-lg', url: 'mailto:psits.ccsmain@gmail.com' },
];

const Footer = () => (
  <footer className="py-6">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Company Details */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-2 mb-3">
            <img src={logo} alt="PSITS logo" className="w-10 h-10" />
            <h1 className="text-xs font-bold max-w-xs">
              PHILIPPINE SOCIETY OF INFORMATION TECHNOLOGY STUDENTS
            </h1>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right">
          <h5 className="text-sm font-medium mb-2">Questions? Contact us!</h5>
          <div className="flex space-x-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200 transform hover:scale-105"
                aria-label={link.name}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className={link.iconClass}></i>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-gray-600 text-center text-xs sm:text-sm">
        <p>&copy; {new Date().getFullYear()} PHILIPPINE SOCIETY OF INFORMATION TECHNOLOGY STUDENTS. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
