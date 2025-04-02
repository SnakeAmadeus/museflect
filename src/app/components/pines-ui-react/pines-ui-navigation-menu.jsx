import React, {
    useState,
    useRef,
    useEffect,
    createContext,
    useContext
} from 'react';
import './pines-ui-style.scss';

// Create context for navigation state
const NavigationContext = createContext(null);

// Main Navigation Menu Component
const PinesUINavigationMenu = ({ children, toggleType = 'hover' }) => {
    const [navigationMenuOpen, setNavigationMenuOpen] = useState(false);
    const [navigationMenu, setNavigationMenu] = useState('');
    const [dropdownStyle, setDropdownStyle] = useState({});
    const [navigationMenuHoverable, setNavigationMenuHoverable] = useState(
        toggleType === 'hover'
    );

    const navigationMenuCloseDelay = 200;
    const navigationMenuCloseTimeoutRef = useRef(null);
    const navigationHoverableTimeoutRef = useRef(null);
    const navigationDropdownRef = useRef(null);

    // Reset hoverable state when toggle type changes
    useEffect(() => {
        setNavigationMenuHoverable(toggleType === 'hover');
    }, [toggleType]);

    const navigationMenuReposition = (navElement, menuId) => {
        navigationMenuClearCloseTimeout();
        if (navigationDropdownRef.current && navElement) {
            setDropdownStyle({
                left: `${navElement.offsetLeft}px`,
                marginLeft: `${navElement.offsetWidth / 2}px`
            });
            setNavigationMenu(menuId);
        }
    };

    // Effect to ensure menu only opens after dropdown style is set
    useEffect(() => {
        if (navigationMenu && Object.keys(dropdownStyle).length > 0) {
            setNavigationMenuOpen(true);
        }
    }, [dropdownStyle, navigationMenu]);

    const navigationMenuLeave = () => {
        navigationMenuCloseTimeoutRef.current = setTimeout(() => {
            navigationMenuClose();

            // In click mode, when menu closes due to timeout,
            // also disable hoverable after a delay
            if (toggleType === 'click') {
                navigationHoverableTimeoutRef.current = setTimeout(() => {
                    setNavigationMenuHoverable(false);
                }, navigationMenuCloseDelay);
            }
        }, navigationMenuCloseDelay);
    };

    const navigationMenuClearCloseTimeout = () => {
        clearTimeout(navigationMenuCloseTimeoutRef.current);
        clearTimeout(navigationHoverableTimeoutRef.current);
    };

    const navigationMenuClose = (fromClick = false) => {
        setNavigationMenuOpen(false);
        setNavigationMenu('');

        // If closing from a click in click mode, disable hoverable immediately
        if (toggleType === 'click' && fromClick) {
            setNavigationMenuHoverable(false);
        }
    };

    const handleMenuItemInteraction = (menuId, navElement, isClick = false) => {
        if (toggleType === 'click') {
            if (isClick) {
                // If already open and same menu, close it
                if (navigationMenuOpen && navigationMenu === menuId) {
                    navigationMenuClose(true); // Close from click
                } else {
                    // Otherwise, open the clicked menu and enable hoverable
                    navigationMenuReposition(navElement, menuId);
                    setNavigationMenuHoverable(true);
                }
            } else if (navigationMenuHoverable && navigationMenuOpen) {
                // For hover in click mode, only reposition if hoverable and already open
                navigationMenuReposition(navElement, menuId);
            }
        } else if (toggleType === 'hover') {
            // For hover mode, always reposition and open
            navigationMenuReposition(navElement, menuId);
        }
    };

    // Context to share navigation state with child components
    const contextValue = {
        toggleType,
        navigationMenuOpen,
        navigationMenu,
        navigationMenuHoverable,
        navigationMenuLeave,
        navigationMenuClearCloseTimeout,
        navigationMenuClose,
        handleMenuItemInteraction
    };

    return (
        <NavigationContext.Provider value={contextValue}>
            <nav className="relative z-10 w-auto">
                <div className="relative">
                    <ul className="flex items-center justify-center flex-1 p-1 space-x-1 list-none border rounded-md text-neutral-700 group border-neutral-200/80 bg-white">
                        {children}
                    </ul>
                </div>
                <div
                    ref={navigationDropdownRef}
                    style={dropdownStyle}
                    className={`absolute top-0 pt-3 duration-200 ease-out -translate-x-1/2 translate-y-11 ${
                        navigationMenuOpen
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-90 pointer-events-none'
                    } transition-all`}
                    onMouseOver={navigationMenuClearCloseTimeout}
                    onMouseLeave={navigationMenuLeave}
                >
                    {navigationMenuOpen && navigationMenu && (
                        <div className="flex justify-center w-auto h-auto overflow-hidden bg-white border rounded-md shadow-sm border-neutral-200/70">
                            {React.Children.map(children, (child) => {
                                if (
                                    React.isValidElement(child) &&
                                    child.props.id === navigationMenu
                                ) {
                                    return React.Children.map(
                                        child.props.children,
                                        (panelChild) => {
                                            if (
                                                React.isValidElement(
                                                    panelChild
                                                ) &&
                                                panelChild.type ===
                                                    PinesUINavigationMenuPanel
                                            ) {
                                                return panelChild;
                                            }
                                            return null;
                                        }
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}
                </div>
            </nav>
        </NavigationContext.Provider>
    );
};

// Navigation Menu Item Component
const PinesUINavigationMenuItem = ({
    id,
    label,
    children,
    onClick = undefined,
    href = '#'
}) => {
    const menuItemRef = useRef(null);
    const context = useContext(NavigationContext);

    // If the context is null, provide sensible defaults
    const {
        navigationMenu = '',
        toggleType = 'hover',
        navigationMenuOpen = false,
        navigationMenuHoverable = false,
        navigationMenuLeave = () => {},
        navigationMenuClearCloseTimeout = () => {},
        navigationMenuClose = () => {},
        handleMenuItemInteraction = () => {}
    } = context || {};

    // Memorize hasDropdown to ensure it's properly evaluated and doesn't change during hot reloads
    const hasDropdown = React.useMemo(() => {
        return React.Children.toArray(children).some(
            (child) =>
                React.isValidElement(child) &&
                child.type === PinesUINavigationMenuPanel
        );
    }, [children]);

    const handleMouseOver = () => {
        if (hasDropdown) {
            // If this item has a dropdown, handle it normally
            handleMenuItemInteraction(id, menuItemRef.current, false);
        } else {
            if (navigationMenuOpen) {
                handleMenuItemInteraction(id, menuItemRef.current, false);
            } else {
                navigationMenuLeave();
            }
        }
    };

    const handleClick = (e) => {
        if (hasDropdown) {
            handleMenuItemInteraction(id, menuItemRef.current, true);
        } else {
            // For non-dropdown items, close the menu with fromClick=true
            if (navigationMenuOpen) {
                navigationMenuClose(true);
            }

            if (onClick) {
                onClick(e);
            } else if (href) {
                window.location.href = href;
            }
        }
    };

    return (
        <li>
            <button
                ref={menuItemRef}
                className={`inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium transition-colors rounded-md hover:text-neutral-900 focus:outline-none disabled:opacity-50 disabled:pointer-events-none group w-max text-neutral-700 ${navigationMenu === id ? 'bg-neutral-100' : 'bg-transparent'} hover:bg-neutral-100`}
                onMouseOver={handleMouseOver}
                onMouseLeave={navigationMenuLeave}
                onClick={handleClick}
            >
                <span>{label}</span>
                {hasDropdown && (
                    <svg
                        className={`relative top-[1px] ml-1 h-3 w-3 ease-out duration-300 ${
                            navigationMenuOpen && navigationMenu === id
                                ? '-rotate-180'
                                : ''
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                )}
            </button>
            {/* Pass children through but don't render them directly, it is managed by the parent PinesUINavigationMenu element */}
        </li>
    );
};

// Navigation Menu Panel Component
const PinesUINavigationMenuPanel = ({ children }) => {
    return (
        <div className="flex items-stretch justify-center w-full max-w-2xl p-6 gap-x-3">
            {children}
        </div>
    );
};

// Navigation Menu Panel Column Component
const PinesUINavigationMenuPanelColumn = ({ children, className = '' }) => {
    return <div className={`w-72 ${className}`}>{children}</div>;
};

// Navigation Menu Panel Item Component
const PinesUINavigationMenuPanelItem = ({
    title,
    description,
    children,
    onClick = undefined,
    href = '#'
}) => {
    const context = useContext(NavigationContext);
    const navigationMenuClose = context
        ? context.navigationMenuClose
        : () => {};

    const handleClick = (e) => {
        if (onClick) {
            onClick(e);
        } else if (href) {
            window.location.href = href;
        }

        // Close with fromClick=true to disable hoverable in click mode
        navigationMenuClose(true);
    };

    if (children) {
        return (
            <div className="block px-3.5 py-3 text-sm rounded hover:bg-neutral-100">
                {children}
            </div>
        );
    }

    return (
        <button
            className="block w-full px-3.5 py-3 text-sm rounded hover:bg-neutral-100 text-left"
            onClick={handleClick}
        >
            <span className="block mb-1 text-black font-medium">{title}</span>
            <span className="block font-light leading-5 opacity-50">
                {description}
            </span>
        </button>
    );
};

// Logo/Feature component for panel
const PinesUINavigationMenuBrand = ({ children, className = '' }) => {
    return <div className={`flex-shrink-0 ${className}`}>{children}</div>;
};

export {
    PinesUINavigationMenu,
    PinesUINavigationMenuItem,
    PinesUINavigationMenuPanel,
    PinesUINavigationMenuPanelColumn,
    PinesUINavigationMenuPanelItem,
    PinesUINavigationMenuBrand
};
