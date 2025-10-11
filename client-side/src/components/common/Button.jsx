import PropTypes from "prop-types";
const Button = ({
  onClick,
  children,
  title = "",
  type = "button",
  className = "",
  size = "fit",
}) => {
  return (
    <button
      type={type}
      title={title}
      className={` 
        ${className} 
        ${size === "fit" ? "w-fit" : "w-full"}
       bg-slate-800 text-white hover:bg-slate-700 py-2 px-4 rounded-md `}
      onClick={() => onClick && onClick()}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  size: PropTypes.oneOf(["fit", "full"]),
  className: PropTypes.string,
};

export default Button;
