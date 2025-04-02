import React, {
    useState,
    useRef,
    useEffect,
    createContext,
    useContext
} from 'react';
import './pines-ui-style.scss';
import { PinesUIMenu } from './pines-ui-menu';

// Create context for menu bar state
const MenuBarContext = createContext(null);

// Main Menu Bar Component
/**
 * @param {{ children: undefined | any }} props
 */
const PinesUIMenuBar = ({ children, className = '' }) => {
    const [menuBarOpen, setMenuBarOpen] = useState(false);
    const [menuBarMenu, setMenuBarMenu] = useState('');
    const menuBarRef = useRef(null);
    const menuBarContainerRef = useRef(null);

    // Handle click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuBarRef.current &&
                !menuBarRef.current.contains(event.target)
            ) {
                setMenuBarOpen(false);
                setMenuBarMenu('');
            }
        };

        if (menuBarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuBarOpen]);

    // Handle escape key to close menu
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setMenuBarOpen(false);
                setMenuBarMenu('');
            }
        };

        if (menuBarOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [menuBarOpen]);

    // Manually set dropdown menu's position
    const [menuPosOffset, setMenuPosOffset] = useState(0);
    useEffect(() => {
        if (menuBarContainerRef.current) {
            const { offsetHeight, clientHeight } = menuBarContainerRef.current;
            // const computedStyle = getComputedStyle(menuBarContainerRef.current);
            // const paddingBottom = parseFloat(computedStyle.paddingBottom);

            setMenuPosOffset(offsetHeight);
        }
    }, [menuBarOpen]);

    const handleMenuItemInteraction = (menuId, isClick = false) => {
        if (isClick) {
            // If already open and same menu, close it
            if (menuBarOpen && menuBarMenu === menuId) {
                setMenuBarOpen(false);
                setMenuBarMenu('');
            } else {
                // Otherwise, open the clicked menu
                setMenuBarOpen(true);
                setMenuBarMenu(menuId);
            }
        } else if (menuBarOpen) {
            // For hover, only change menu if already open
            setMenuBarMenu(menuId);
        }
    };

    const handleMenuClose = (eventData) => {
        setMenuBarOpen(false);
        setMenuBarMenu('');
    };

    // Context to share menu bar state with child components
    const contextValue = {
        menuBarOpen,
        menuBarMenu,
        menuPosOffset,
        handleMenuItemInteraction,
        handleMenuClose
    };

    return (
        <MenuBarContext.Provider value={contextValue}>
            <div
                ref={menuBarRef}
                className={`relative top-0 left-0 z-50 w-auto transition-all duration-150 ease-out ${className}`}
            >
                <div className="relative top-0 left-0 z-40 w-auto h-10 transition duration-200 ease-out">
                    <div
                        ref={menuBarContainerRef}
                        className="w-full h-full p-1 bg-white border rounded-md border-neutral-200/80"
                    >
                        <div className="flex justify-between w-full h-full select-none text-neutral-900">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </MenuBarContext.Provider>
    );
};

// Menu Bar Item Component
/**
 * @param {{
 *     id: string,
 *     title: string,
 *     children?: undefined | any,
 *     disabled?: boolean
 * }} props
 */
const PinesUIMenuBarItem = ({ id, title, children, disabled = false }) => {
    const context = useContext(MenuBarContext);
    // If the context is null, provide sensible defaults
    const {
        menuBarOpen = false,
        menuBarMenu = '',
        menuPosOffset = 48,
        handleMenuItemInteraction = () => {},
        handleMenuClose = () => {}
    } = context || {};

    // Check if this item has menu content
    const hasMenu = React.Children.count(children) > 0;

    const handleClick = () => {
        if (disabled) return;
        handleMenuItemInteraction(id, true);
    };

    const handleMouseOver = () => {
        if (disabled) return;
        if (menuBarOpen) {
            handleMenuItemInteraction(id, false);
        }
    };

    return (
        <div className="relative h-full cursor-default">
            <button
                onClick={handleClick}
                onMouseOver={handleMouseOver}
                className={`rounded text-sm cursor-default flex items-center leading-tight justify-center px-3 py-1.5 h-full hover:bg-neutral-100 ${
                    menuBarOpen && menuBarMenu === id ? 'bg-neutral-100' : ''
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={disabled}
            >
                {title}
            </button>

            {menuBarOpen && menuBarMenu === id && hasMenu && (
                <div
                    className="absolute top-0 z-50 -translate-x-0.5"
                    style={{ marginTop: `${menuPosOffset}px` }}
                >
                    <PinesUIMenu
                        className="pines-ui-fade-down"
                        onClose={(eventData) => {
                            console.log(
                                'Menu closed with event data:',
                                eventData
                            );
                            handleMenuClose(eventData);
                        }}
                    >
                        {children}
                    </PinesUIMenu>
                </div>
            )}
        </div>
    );
};

// Only export the menu bar components
export { PinesUIMenuBar, PinesUIMenuBarItem };
