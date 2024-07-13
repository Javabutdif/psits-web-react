import React from 'react';
import logo from '../../assets/images/psits-logo.png';

const Footer = () => {
  const  socialLinks =[
       { name: 'Facebook', iconClass: 'fab fa-facebook fa-lg', url: '#' },
        { name: 'Twitter', iconClass: 'fab fa-twitter fa-lg', url: '#' },
        { name: 'Instagram', iconClass: 'fab fa-instagram fa-lg', url: '#' }
    ]

  return (
    <footer className="w-full c py-2 text-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          {/* Company Details */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left gap-2">
            <div className='flex flex-col md:flex-row items-center mb-4 md:mb-0'>
                <img src={logo} alt="psits logo" className="w-14 h-auto mb-2 md:mr-2" />
                <h3 className="text-xs font-bold md:max-w-[300px]">PHILIPPINE SOCIETY OF INFORMATION TECHNOLOGY STUDENTS</h3>
            </div>
          </div>
          
          {/* Social Media Links */}
          <div className="flex flex-col items-center text-center justify-center md:items-center">
            <h5 className="text-sm mb-2">Any Inqueries? Feel free to contact us.</h5>
            <div className="flex space-x-4 mt-2">
              {socialLinks.map((link, index) => (
               <a key={index} href={link.url} className="text-black hover:text-gray-400 transition-colors duration-300">
                 <i className={link.iconClass}></i>
               </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Copyright Information */}
        {/* <div className="mt-8 text-center md:mt-4">
          <p className='text-xs'>©{new Date().getFullYear()} PHILIPPINE SOCIETY OF INFORMATION TECHNOLOGY STUDENTS. All Rights Reserved.</p>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
