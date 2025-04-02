import React, { useState, useRef, useEffect, ReactNode } from 'react';

// Define the props interface separately
interface MuseFlectDockProps {
    children?: ReactNode;
    dockDirection?:
        | 'top'
        | 'bottom'
        | 'left'
        | 'right'
        | 'top-left'
        | 'top-right'
        | 'bottom-left'
        | 'bottom-right';
    dockHandleLength?: number; // In rem
    dockHandleThickness?: number; // In rem
    className?: string;
}

const MuseFlectDock = ({
    children = undefined,
    dockDirection = 'top',
    dockHandleLength = 1,
    dockHandleThickness = 0.25,
    className = ''
}: MuseFlectDockProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hoverIntensity, setHoverIntensity] = useState(0);
    const dockRef = useRef(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    // Handle expanding/collapsing the dock
    const toggleDock = () => {
        setIsExpanded(!isExpanded);
    };

    // Calculate intensity based on mouse distance
    const handleMouseMove = (e: any) => {
        if (isExpanded) return;

        const buttonRect = buttonRef.current?.getBoundingClientRect();
        if (!buttonRect) return;

        let buttonCenterX = 0;
        let buttonCenterY = 0;
        let distance = 0;
        switch(dockDirection) {
            case "top":
                buttonCenterY = buttonRect.top;
                distance = Math.max(e.clientY - buttonCenterY, 1);
                break;
            case "top-left":
                buttonCenterX = buttonRect.left;
                buttonCenterY = buttonRect.top;
                distance = Math.sqrt(
                    Math.pow(e.clientX - buttonCenterX, 2) +
                    Math.pow(e.clientY - buttonCenterY, 2)
                );
                break;
        }

        // Define detection area (2rem x 1rem around button)
        const detectionArea = dockHandleLength * 16 * 2; // assuming 1rem = 16px

        if (distance < detectionArea) {
            // Calculate intensity using inverse function
            //  y = 1 - e^{-\frac{0.1}{x}}
            const intensity = Math.min(
                1 - Math.pow(Math.E, -(0.1 / (distance / detectionArea))),
                1
            );
            setHoverIntensity(intensity);
        } else {
            setHoverIntensity(0);
        }
    };

    // Add/remove event listener for mousemove
    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isExpanded]);

    const BASELINE_OPACITY = 0.25
    // Get styles based on dock direction
    const getStyles = () => {
        // Base styles

        const baseButtonStyle = {
            cursor: 'pointer',
            transition: 'all 0.3s ease-out',
            position: 'absolute',
            opacity: isExpanded
                ? 0.5
                : BASELINE_OPACITY + hoverIntensity * (1 - BASELINE_OPACITY),
            boxShadow: isExpanded
                ? 'none'
                : `0 ${hoverIntensity * -dockHandleThickness}rem ${hoverIntensity * dockHandleThickness * 4}rem rgba(255, 255, 255, ${hoverIntensity * 0.8})`
        };

        const baseContentStyle = {
            transition: 'all 0.1s ease-out',
            opacity: isExpanded ? 1 : 0,
            overflow: 'visible',
            marginTop: `${dockHandleThickness}rem`
        };

        const baseContainerStyle = {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWith: `${dockHandleLength}rem`,
            maxHeight: isExpanded ? `auto` : `${dockHandleThickness}`,
            position: 'relative',
            padding: '0.2rem',
            zIndex: "9"
        };

        // Direction-specific styles
        switch (dockDirection) {
            case 'top':
                return {
                    container: {
                        ...baseContainerStyle
                    },
                    button: {
                        ...baseButtonStyle,
                        width: `${dockHandleLength}rem`,
                        height: `${dockHandleThickness}rem`,
                        marginTop: `${dockHandleThickness * 2}rem`,
                        borderTop: `${dockHandleThickness}rem solid black`,
                        top: 0,
                        left: "50%",
                        marginLeft: `${-dockHandleLength/2}rem`,
                        right: 0,
                        cursor: 'pointer'
                    },
                    content: {
                        ...baseContentStyle,
                        transformOrigin: 'top',
                        transform: isExpanded ? 'scaleY(1) scaleX(1)' : 'scaleY(0) scaleX(0.5)',
                        paddingTop: `${dockHandleThickness}rem`
                    },
                    collapseButton: {
                        position: 'absolute',
                        width: `${dockHandleLength}rem`,
                        height: `${dockHandleThickness * 4}rem`,
                        left: '50%',
                        bottom: 0,
                        marginBottom: `${(-dockHandleThickness * 4) + (-dockHandleThickness * 2) }rem`,
                        transform: 'translateX(-50%)',
                        cursor: 'default',
                        borderTop: `${dockHandleThickness}rem solid black`,
                        transition: 'opacity 0.5s ease-out'
                    }
                };
            case 'top-left':
                return {
                    container: {
                        ...baseContainerStyle
                    },
                    button: {
                        ...baseButtonStyle,
                        width: `${dockHandleLength}rem`,
                        height: `${dockHandleLength}rem`,
                        borderTop: '2px solid white',
                        borderLeft: '2px solid white',
                        top: 0,
                        left: 0
                    },
                    content: {
                        ...baseContentStyle,
                        transformOrigin: 'top left',
                        transform: isExpanded ? 'scale(1)' : 'scale(0)',
                        paddingTop: `0.25rem`,
                        paddingLeft: `${dockHandleLength + 0.5}rem`
                    },
                    collapseButton: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${dockHandleLength}rem`,
                        height: `${dockHandleLength}rem`,
                        cursor: 'pointer',
                        opacity: isExpanded
                            ? hoverIntensity > 0
                                ? 1
                                : 0.5
                            : 0,
                        transition: 'opacity 0.3s ease-out',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderTop: '2px solid white',
                        borderLeft: '2px solid white'
                    }
                };
            // Add other directions as needed
            default:
                return {
                    container: baseContainerStyle,
                    button: baseButtonStyle,
                    content: baseContentStyle,
                    collapseButton: {}
                };
        }
    };

    const styles = getStyles();

    return (
        <div
            ref={dockRef}
            className={`muse-flect-dock ${className}`}
            style={styles.container as React.CSSProperties}
        >
            {/* Expand button (visible when collapsed) */}
            {!isExpanded && (
                <div
                    ref={buttonRef}
                    onClick={toggleDock}
                    style={styles.button as React.CSSProperties}
                    className="muse-flect-dock-button"
                />
            )}

            {/* Content container */}
            <div className="muse-flect-dock-content" style={styles.content}>
                {/* Child components */}
                {children}

                {/* Collapse button (visible when expanded) */}
                {isExpanded && (
                    <div
                        onClick={toggleDock}
                        style={styles.collapseButton as React.CSSProperties}
                        className={`muse-flect-dock-collapse-button opacity-10 hover:opacity-80`}
                    ></div>
                )}
            </div>
        </div>
    );
};

export default MuseFlectDock;
