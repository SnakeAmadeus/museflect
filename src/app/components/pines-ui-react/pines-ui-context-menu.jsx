import React, { useState, useEffect, useRef } from 'react';

export const PinesUIContextMenu = ({
    children,
    menuItems = [],
    className = '',
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const menuRef = useRef(null);
    const containerRef = useRef(null);

    const handleContextMenu = (e) => {
        e.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();

        // Calculate position relative to viewport
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        // Check if menu would go off-screen to the right
        const menuWidth = 200; // approximate width
        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth;
        }

        // Check if menu would go off-screen at the bottom
        const menuHeight = menuItems.length * 40; // approximate height
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight;
        }

        setPosition({ x, y });
        setIsOpen(true);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                closeMenu();
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            onContextMenu={handleContextMenu}
            {...props}
        >
            {children}

            {isOpen && (
                <div
                    ref={menuRef}
                    className="absolute bg-white rounded shadow-lg py-1 z-50 min-w-48 text-sm text-gray-700"
                    style={{ left: `${position.x}px`, top: `${position.y}px` }}
                >
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                if (item.onClick) item.onClick();
                                closeMenu();
                            }}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${item.className || ''}`}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
