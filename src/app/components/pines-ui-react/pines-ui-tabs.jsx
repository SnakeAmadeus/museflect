import React, {
    useState,
    createContext,
    useContext,
    useEffect,
    useRef,
    Children,
    cloneElement
} from 'react';

// Context to share tab state
const TabsContext = createContext();

export const PinesUITabs = ({ children, defaultTab = 0, ...props }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className="w-full" {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

export const PinesUITabList = ({ children, ...props }) => {
    return (
        <div className="flex border-b border-gray-200" {...props}>
            {Children.map(children, (child, index) =>
                cloneElement(child, { index })
            )}
        </div>
    );
};

export const PinesUITab = ({ children, index, onClick, ...props }) => {
    const { activeTab, setActiveTab } = useContext(TabsContext);
    const isActive = activeTab === index;

    const handleClick = (e) => {
        setActiveTab(index);
        if (onClick) onClick(e);
    };

    return (
        <button
            className={`py-2 px-4 text-sm font-medium ${
                isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
            }`}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
};

export const PinesUITabPanels = ({ children, ...props }) => {
    const { activeTab } = useContext(TabsContext);

    return (
        <div className="py-4" {...props}>
            {Children.map(children, (child, index) =>
                cloneElement(child, {
                    isActive: index === activeTab,
                    index
                })
            )}
        </div>
    );
};

export const PinesUITabPanel = ({ children, isActive, ...props }) => {
    if (!isActive) return null;

    return <div {...props}>{children}</div>;
};
