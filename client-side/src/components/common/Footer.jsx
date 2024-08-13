import React from 'react';
import logo from '../../assets/images/psits-logo.png';

const socialLinks = [
  { name: 'Facebook', iconClass: 'fa-brands fa-facebook fa-lg', url: 'https://www.facebook.com/PSITS.UCmain' },
  { name: 'GitHub', iconClass: 'fa-brands fa-github fa-lg', url: 'https://github.com/PSITS-UC-MAIN/' },
  { name: 'Email', iconClass: 'fa-solid fa-envelope fa-lg', url: 'mailto:psits.ccsmain@gmail.com' },
];

const Footer = () => (
  <footer className="py-4 container border-t border-gray-600">
     <div className="text-center text-xs sm:text-sm">
        <p>&copy; {new Date().getFullYear()} PHILIPPINE SOCIETY OF INFORMATION TECHNOLOGY STUDENTS. All Rights Reserved.</p>
      </div>
  </footer>
);

export default Footer;
