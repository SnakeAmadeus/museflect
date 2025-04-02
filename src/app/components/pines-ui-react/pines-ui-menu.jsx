import React, {
    useState,
    useRef,
    useEffect,
    createContext,
    useContext
} from 'react';
import './pines-ui-style.scss';

// Create context for menu state
const MenuContext = createContext(null);

// Main Menu Component
/**
 * @param {{
 *     children: undefined | any,
 *     onClose: undefined | Function,
 *     className: string
 * }} props
 */
const PinesUIMenu = ({ children, onClose, className = '' }) => {
    const [hasCheckboxOrRadio, setHasCheckboxOrRadio] = useState(false);
    const [radioGroups, setRadioGroups] = useState({});
    const [radioButtonStates, setRadioButtonStates] = useState({});
    const [checkboxStates, setCheckboxStates] = useState({});
    const menuRef = useRef(null);

    // Check if menu contains checkbox or radio items for alignment
    useEffect(() => {
        const checkForSpecialItems = () => {
            let hasSpecial = false;
            const groups = {};
            const radioStates = {};
            const checkStates = {};

            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child)) {
                    const childType = child.type.name;
                    if (
                        childType === 'PinesUIMenuCheckbox' ||
                        childType === 'PinesUIMenuRadioButton'
                    ) {
                        hasSpecial = true;
                    }

                    // Track radio button groups
                    if (
                        childType === 'PinesUIMenuRadioButton' &&
                        child.props.groupId
                    ) {
                        const { groupId, id, checked } = child.props;

                        // Initialize group in radioGroups
                        if (!groups[groupId]) {
                            groups[groupId] = { selectedId: null };
                        }

                        // Initialize group in radioButtonStates
                        if (!radioStates[groupId]) {
                            radioStates[groupId] = {};
                        }

                        // Set initial state based on checked prop
                        const isSelected =
                            checked ||
                            (groups[groupId].selectedId === null &&
                                radioStates[groupId][id] === undefined);

                        if (isSelected) {
                            groups[groupId].selectedId = id;
                        }

                        // Update radio button state
                        radioStates[groupId][id] = isSelected;
                    }

                    // Track checkbox states
                    if (childType === 'PinesUIMenuCheckbox') {
                        const { id, checked } = child.props;
                        checkStates[id] = !!checked;
                    }
                }
            });

            setHasCheckboxOrRadio(hasSpecial);
            setRadioGroups(groups);
            setRadioButtonStates(radioStates);
            setCheckboxStates(checkStates);
        };

        checkForSpecialItems();
    }, [children]);

    const handleItemClick = (
        itemId,
        groupId = null,
        isCheckbox = false,
        isRadio = false
    ) => {
        let eventData = {
            targetId: itemId,
            groupData: undefined
        };

        // Handle radio button groups
        if (isRadio && groupId) {
            // Update radio groups
            const newGroups = { ...radioGroups };
            newGroups[groupId].selectedId = itemId;
            setRadioGroups(newGroups);

            // Update radio button states
            const newRadioStates = { ...radioButtonStates };
            if (!newRadioStates[groupId]) {
                newRadioStates[groupId] = {};
            }

            // Set all buttons in this group to false except the selected one
            Object.keys(newRadioStates[groupId]).forEach((id) => {
                newRadioStates[groupId][id] = id === itemId;
            });

            // Ensure the selected button is set to true
            newRadioStates[groupId][itemId] = true;
            setRadioButtonStates(newRadioStates);

            // Prepare group data for the event
            eventData.groupData = { ...newRadioStates[groupId] };
        }

        // Handle checkbox state
        if (isCheckbox) {
            const newCheckboxStates = { ...checkboxStates };
            newCheckboxStates[itemId] = !newCheckboxStates[itemId];
            setCheckboxStates(newCheckboxStates);

            // Prepare checkbox data for the event
            eventData.groupData = { [itemId]: newCheckboxStates[itemId] };
        }

        // Close the menu and pass event data
        if (onClose) {
            onClose(eventData);
        }
    };

    // Context to share menu state with child components
    const contextValue = {
        hasCheckboxOrRadio,
        radioGroups,
        radioButtonStates,
        checkboxStates,
        handleItemClick
    };

    return (
        <MenuContext.Provider value={contextValue}>
            <div
                ref={menuRef}
                className={`min-w-[12rem] w-max text-neutral-800 rounded-md border border-neutral-200/70 bg-white text-sm p-1 shadow-md ${className}`}
            >
                {children}
            </div>
        </MenuContext.Provider>
    );
};

// Menu Item Component
/**
 * @param {{
 *     id: string,
 *     label: string,
 *     icon?: string,
 *     onClick?: undefined | Function,
 *     enabled?: boolean,
 *     children?: undefined | any,
 *     hotkey?: string,
 *     align?: boolean
 * }} props
 */
const PinesUIMenuItem = ({
    id,
    label,
    icon = '',
    onClick = undefined,
    enabled = true,
    children = undefined,
    hotkey = '',
    align = true
}) => {
    const context = useContext(MenuContext);
    const hasCheckboxOrRadio = context ? context.hasCheckboxOrRadio : false;
    const handleItemClick = context ? context.handleItemClick : () => {};

    const handleClick = (e) => {
        if (!enabled) return;

        if (onClick) {
            onClick(e);
        }

        handleItemClick(id);
    };

    return (
        <button
            onClick={handleClick}
            className={`relative flex justify-between w-full cursor-default select-none group items-center rounded px-2 py-1.5 hover:bg-neutral-100 hover:text-neutral-900 outline-none whitespace-nowrap ${
                !enabled ? 'opacity-50 pointer-events-none' : ''
            }`}
            disabled={!enabled}
        >
            <div className="justify-start">
                {align && hasCheckboxOrRadio && (
                    <span className="inline-block w-6 mr-0 flex-shrink-0"></span> // Placeholder for alignment
                )}

                {icon && (
                    <span className="w-6 h-10 mr-2 flex-shrink-0">
                        <img src={icon} alt="" className="w-full h-full" />
                    </span>
                )}

                <span>{label}</span>

                {children}
            </div>

            {hotkey && (
                <span className="ml-auto text-xs tracking-widest text-neutral-400 group-hover:text-neutral-600">
                    {hotkey}
                </span>
            )}
        </button>
    );
};

// Menu Checkbox Component
/**
 * @param {{
 *     id: string,
 *     label: string,
 *     checked?: boolean,
 *     onChange?: undefined | Function,
 *     enabled?: boolean,
 *     children?: undefined | any
 * }} props
 */
const PinesUIMenuCheckbox = ({
    id,
    label,
    checked = false,
    onChange = undefined,
    enabled = true,
    children = undefined
}) => {
    const context = useContext(MenuContext);
    const handleItemClick = context ? context.handleItemClick : () => {};
    const checkboxStates = context ? context.checkboxStates : {};

    // Use the state from context if available, otherwise use the prop
    const isChecked =
        checkboxStates[id] !== undefined ? checkboxStates[id] : checked;

    const handleClick = () => {
        if (!enabled) return;

        if (onChange) {
            onChange(!isChecked);
        }

        handleItemClick(id, null, true, false);
    };

    return (
        <button
            onClick={handleClick}
            className={`relative flex justify-between w-full pl-8 cursor-default select-none group items-center rounded px-2 py-1.5 hover:bg-neutral-100 hover:text-neutral-900 outline-none whitespace-nowrap ${
                !enabled ? 'opacity-50 pointer-events-none' : ''
            }`}
            disabled={!enabled}
        >
            {isChecked && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </span>
            )}
            <span>{label}</span>
            {children}
        </button>
    );
};

// Menu Radio Button Component
/**
 * @param {{
 *     groupId: string,
 *     id: string,
 *     label: string,
 *     onChange?: undefined | Function,
 *     enabled?: boolean,
 *     children?: undefined | any
 * }} props
 */
const PinesUIMenuRadioButton = ({
    groupId,
    id,
    label,
    onChange = undefined,
    enabled = true,
    children = undefined
}) => {
    const context = useContext(MenuContext);
    const radioButtonStates = context ? context.radioButtonStates : {};
    const handleItemClick = context ? context.handleItemClick : () => {};

    // Check if this radio button is selected using the state
    const selected =
        radioButtonStates[groupId] && radioButtonStates[groupId][id];

    const handleClick = () => {
        if (!enabled) return;

        if (onChange) {
            onChange();
        }

        handleItemClick(id, groupId, false, true);
    };

    return (
        <button
            onClick={handleClick}
            className={`relative flex w-full cursor-default select-none items-center rounded py-1.5 pl-8 pr-2 hover:bg-neutral-100 outline-none whitespace-nowrap ${
                !enabled ? 'opacity-50 pointer-events-none' : ''
            }`}
            disabled={!enabled}
        >
            {selected && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-2 h-2 fill-current"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                </span>
            )}
            <span>{label}</span>
            {children}
        </button>
    );
};

// Menu Submenu Component
/**
 * @param {{
 *     id: string,
 *     label: string,
 *     icon?: string,
 *     enabled?: boolean,
 *     children?: undefined | any,
 *     align?: boolean
 * }} props
 */
const PinesUIMenuSubmenu = ({
    id,
    label,
    icon = '',
    enabled = true,
    children = undefined,
    align = true
}) => {
    const context = useContext(MenuContext);
    const hasCheckboxOrRadio = context ? context.hasCheckboxOrRadio : false;
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        if (!enabled) return;
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <div
            className="relative w-full group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex cursor-default select-none items-center rounded px-2 hover:bg-neutral-100 py-1.5 outline-none whitespace-nowrap">
                {align && hasCheckboxOrRadio && (
                    <span className="w-6 h-6 mr-2 flex-shrink-0"></span> // Placeholder for alignment
                )}

                {icon && (
                    <span className="w-6 h-6 mr-2 flex-shrink-0">
                        <img src={icon} alt="" className="w-full h-full" />
                    </span>
                )}

                <span>{label}</span>

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 ml-auto"
                >
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>

            {isHovered && (
                <div className="absolute top-0 right-0 mr-0 pines-ui-fade-right translate-x-full">
                    {/* Create a new independent menu for the submenu */}
                    <PinesUIMenu
                        className="w-max" // Let it adjust to its own content
                        onClose={(eventData) => {
                            // Propagate the close event up to the parent menu
                            if (context && context.handleItemClick) {
                                context.handleItemClick(eventData.targetId);
                            }
                        }}
                    >
                        {children}
                    </PinesUIMenu>
                </div>
            )}
        </div>
    );
};

// Menu Separator Component
const PinesUIMenuSeparator = () => {
    return <div className="h-px my-1 -mx-1 bg-neutral-200"></div>;
};

// Only export the menu components
export {
    PinesUIMenu,
    PinesUIMenuItem,
    PinesUIMenuCheckbox,
    PinesUIMenuRadioButton,
    PinesUIMenuSubmenu,
    PinesUIMenuSeparator
};
