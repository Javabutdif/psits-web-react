const Tooltip = ({ children, visible }) => (
    <span
      className={`absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </span>
  );

  
  export default Tooltip