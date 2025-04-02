const Button = ({
    label,
    icon,
    children,
    onClick = (e) => {},
    onMouseEnter = (e) => {},
    onMouseLeave = (e) => {},
    ...props
}) => {
    return (
        <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium tracking-wide text-white transition-colors duration-200 rounded-md bg-neutral-950 hover:bg-neutral-900 focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 focus:outline-none"
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            {...props}
        >
            {icon && (
                <span className="mr-2">
                    <img
                        src={icon}
                        alt=""
                        className="w-auto h-auto max-w-[4rem] max-h-[4rem]"
                    />
                </span>
            )}
            {label && <span>{label}</span>}
            {children}
        </button>
    );
};

export default Button;
