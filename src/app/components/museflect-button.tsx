import { ButtonHTMLAttributes } from 'react';
import PinesButton from './pines-ui-react/pines-ui-button';

interface MuseflectButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    icon?: string;
    className?: string;
    children?: React.ReactNode;
}

const MuseflectButton: React.FC<MuseflectButtonProps> = ({
    label,
    icon,
    className = '',
    children,
    onClick = (e: any) => {},
    onMouseEnter = (e: any) => {},
    onMouseLeave = (e: any) => {},
    ...props
}) => {
    // Base classes from PinesUI with the ability to override them
    const baseClasses =
        'inline-flex items-center justify-center px-4 py-2 text-sm font-medium tracking-wide text-white transition-colors duration-200 rounded-md bg-neutral-950 hover:bg-neutral-900 focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 focus:outline-none';

    return (
        <PinesButton
            label={label}
            icon={icon}
            // Combine base classes with custom classes, custom classes will override base ones
            className={`${baseClasses} ${className}`}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            {...props}
        >
            {children}
        </PinesButton>
    );
};

export default MuseflectButton;
