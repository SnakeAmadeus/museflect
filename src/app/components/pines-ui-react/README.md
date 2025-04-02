# PinesUI React Components

This documentation covers React components refactored from PinesUI's Alpine.js
implementation. The components were refactored by Claude 3.7 from Alpine.js to
React.js and have been tested and revised by Snake (snake4y5h@gmail.com).

## Tabs

> Tabs organize content into separate views where only one view can be visible
> at a time.

### API

- `PinesUITabs`: The top-level component that provides context to all tab
  components

| Props        | Description                                                                          |
| :----------- | :----------------------------------------------------------------------------------- |
| `defaultTab` | Number indicating which tab should be active by default (zero-indexed). Default: `0` |
| `children`   | Tab components (typically TabList and TabPanels)                                     |

- `PinesUITabList`: Container for tab buttons

| Props       | Description            |
| :---------- | :--------------------- |
| `children`  | PinesUITab components  |
| `className` | Additional CSS classes |

- `PinesUITab`: Individual tab button

| Props       | Description                                |
| :---------- | :----------------------------------------- |
| `children`  | Tab label content                          |
| `index`     | Automatically provided when inside TabList |
| `onClick`   | Additional click handler (optional)        |
| `className` | Additional CSS classes                     |

- `PinesUITabPanels`: Container for tab content panels

| Props       | Description                |
| :---------- | :------------------------- |
| `children`  | PinesUITabPanel components |
| `className` | Additional CSS classes     |

- `PinesUITabPanel`: Individual tab content panel

| Props       | Description                                |
| :---------- | :----------------------------------------- |
| `children`  | Tab panel content                          |
| `isActive`  | Automatically provided by parent component |
| `className` | Additional CSS classes                     |

### Example

```tsx
import React from 'react';
import {
    PinesUITabs,
    PinesUITabList,
    PinesUITab,
    PinesUITabPanels,
    PinesUITabPanel
} from './components/PinesUITabs';

const TabsExample = () => {
    return (
        <PinesUITabs defaultTab={0}>
            <PinesUITabList>
                <PinesUITab>Account</PinesUITab>
                <PinesUITab>Password</PinesUITab>
                <PinesUITab>Notifications</PinesUITab>
            </PinesUITabList>

            <PinesUITabPanels>
                <PinesUITabPanel>
                    <h3 className="text-lg font-medium">Account Settings</h3>
                    <p className="mt-2 text-gray-600">
                        Manage your account settings and preferences.
                    </p>
                    {/* Account settings form */}
                </PinesUITabPanel>

                <PinesUITabPanel>
                    <h3 className="text-lg font-medium">Password Settings</h3>
                    <p className="mt-2 text-gray-600">
                        Update your password and security preferences.
                    </p>
                    {/* Password form */}
                </PinesUITabPanel>

                <PinesUITabPanel>
                    <h3 className="text-lg font-medium">
                        Notification Preferences
                    </h3>
                    <p className="mt-2 text-gray-600">
                        Configure how you receive notifications.
                    </p>
                    {/* Notification settings */}
                </PinesUITabPanel>
            </PinesUITabPanels>
        </PinesUITabs>
    );
};

export default TabsExample;
```

## Context Menu

> A contextual menu that appears when a user right-clicks on an element.

### API

- `PinesUIContextMenu`: The main component that wraps the target element

| Props       | Description                                                                                                           |
| :---------- | :-------------------------------------------------------------------------------------------------------------------- |
| `menuItems` | Array of menu item objects with format `{ label: string, onClick: function, disabled?: boolean, className?: string }` |
| `children`  | The element(s) to right-click on to trigger the context menu                                                          |
| `className` | Additional CSS classes                                                                                                |

### Example

```tsx
import React from 'react';
import { PinesUIContextMenu } from './components/PinesUIContextMenu';

const ContextMenuExample = () => {
    const menuItems = [
        {
            label: 'Edit',
            onClick: () => console.log('Edit clicked')
        },
        {
            label: 'Duplicate',
            onClick: () => console.log('Duplicate clicked')
        },
        {
            label: 'Delete',
            onClick: () => console.log('Delete clicked'),
            className: 'text-red-600'
        },
        {
            label: 'Archive (Disabled)',
            onClick: () => console.log('Archive clicked'),
            disabled: true
        }
    ];

    return (
        <PinesUIContextMenu menuItems={menuItems}>
            <div className="p-8 border border-gray-300 rounded text-center bg-gray-50">
                Right-click on this area to open the context menu
            </div>
        </PinesUIContextMenu>
    );
};

export default ContextMenuExample;
```

## Navigation Menu

> A responsive navigation menu with support for branding, links, and dropdowns.

### API

- `PinesUINavigationMenu`: The top-level navigation container

| Props      | Description           |
| :--------- | :-------------------- |
| `children` | Navigation menu items |

- `PinesUINavigationMenuItem`: Individual navigation item that can be a link or
  dropdown trigger

| Props        | Description                                                         |
| :----------- | :------------------------------------------------------------------ |
| `id`         | Unique identifier for the menu item (required for dropdown items)   |
| `label`      | Text to display for the menu item                                   |
| `href`       | Link destination (optional)                                         |
| `onClick`    | Function to call when the item is clicked (optional)                |
| `children`   | Dropdown panel content (optional)                                   |
| `toggleType` | How the dropdown is triggered: "hover" or "click". Default: "hover" |

- `PinesUINavigationMenuPanel`: Container for dropdown panel content

| Props      | Description                          |
| :--------- | :----------------------------------- |
| `children` | Panel content (columns and features) |

- `PinesUINavigationMenuPanelColumn`: Column within a dropdown panel

| Props       | Description                            |
| :---------- | :------------------------------------- |
| `children`  | Column content (typically panel items) |
| `className` | Additional CSS classes                 |

- `PinesUINavigationMenuPanelItem`: Item within a dropdown panel column

| Props         | Description                                          |
| :------------ | :--------------------------------------------------- |
| `title`       | Item title                                           |
| `description` | Item description                                     |
| `href`        | Link destination (optional)                          |
| `onClick`     | Function to call when the item is clicked (optional) |
| `children`    | Custom content (optional)                            |

- `PinesUINavigationMenuBrand`: Feature/promotional area within a dropdown panel

| Props       | Description            |
| :---------- | :--------------------- |
| `children`  | Feature content        |
| `className` | Additional CSS classes |

### Example

```tsx
import React from 'react';
import {
    PinesUINavigationMenu,
    PinesUINavigationMenuItem,
    PinesUINavigationMenuPanel,
    PinesUINavigationMenuPanelColumn,
    PinesUINavigationMenuPanelItem,
    PinesUINavigationMenuFeature
} from './pines-ui-react/pines-ui-navigation-menu';

const NavigationMenuExample = () => {
    return (
        <PinesUINavigationMenu>
            <PinesUINavigationMenuItem
                id="getting-started"
                label="Getting started"
            >
                <PinesUINavigationMenuPanel>
                    <PinesUINavigationMenuFeature className="w-48 rounded pt-28 pb-7 bg-gradient-to-br from-neutral-800 to-black">
                        <div className="relative px-7 space-y-1.5 text-white">
                            <svg
                                className="block w-auto h-9"
                                viewBox="0 0 180 180"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M67.683 89.217h44.634l30.9 53.218H36.783l30.9-53.218Z"
                                    fill="currentColor"
                                />
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M77.478 120.522h21.913v46.956H77.478v-46.956Zm-34.434-29.74 45.59-78.26 46.757 78.26H43.044Z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span className="block font-bold text-left">
                                Pines UI
                            </span>
                            <span className="block text-sm opacity-60 text-left">
                                An Alpine and Tailwind UI library
                            </span>
                        </div>
                    </PinesUINavigationMenuFeature>

                    <PinesUINavigationMenuPanelColumn>
                        <PinesUINavigationMenuPanelItem
                            title="Introduction"
                            description="Re-usable elements built using Alpine JS and Tailwind CSS."
                            onClick={() => console.log('Introduction clicked')}
                        />
                        <PinesUINavigationMenuPanelItem
                            title="How to use"
                            description="Couldn't be easier. It is as simple as copy, paste, and preview."
                            onClick={() => console.log('How to use clicked')}
                        />
                        <PinesUINavigationMenuPanelItem
                            title="Contributing"
                            description="Feel free to contribute your expertise. All these elements are open-source."
                            onClick={() => console.log('Contributing clicked')}
                        />
                    </PinesUINavigationMenuPanelColumn>
                </PinesUINavigationMenuPanel>
            </PinesUINavigationMenuItem>

            <PinesUINavigationMenuItem id="learn-more" label="Learn More">
                <PinesUINavigationMenuPanel>
                    <PinesUINavigationMenuPanelColumn>
                        <PinesUINavigationMenuPanelItem
                            title="Tailwind CSS"
                            description="A utility first CSS framework for building amazing websites."
                            onClick={() => console.log('Tailwind CSS clicked')}
                        />
                        <PinesUINavigationMenuPanelItem
                            title="Laravel"
                            description="The perfect all-in-one framework for building amazing apps."
                            onClick={() => console.log('Laravel clicked')}
                        />
                        <PinesUINavigationMenuPanelItem
                            title="Pines UI"
                            description="An Alpine JS and Tailwind CSS UI library for awesome people."
                            onClick={() => console.log('Pines UI clicked')}
                        />
                    </PinesUINavigationMenuPanelColumn>

                    <PinesUINavigationMenuPanelColumn>
                        <PinesUINavigationMenuPanelItem
                            title="AlpineJS"
                            description="A framework without the complex setup or heavy dependencies."
                            onClick={() => console.log('AlpineJS clicked')}
                        />
                        <PinesUINavigationMenuPanelItem
                            title="Livewire"
                            description="A seamless integration of server-side and client-side interactions."
                            onClick={() => console.log('Livewire clicked')}
                        />
                        <PinesUINavigationMenuPanelItem
                            title="Tails"
                            description="The ultimate Tailwind CSS design tool that helps you craft beautiful websites."
                            onClick={() => console.log('Tails clicked')}
                        />
                    </PinesUINavigationMenuPanelColumn>
                </PinesUINavigationMenuPanel>
            </PinesUINavigationMenuItem>

            <PinesUINavigationMenuItem
                label="Documentation"
                onClick={() => console.log('Documentation clicked')}
            />
        </PinesUINavigationMenu>
    );
};

export default NavigationMenuExample;
```

## Select

> A custom select input component with dropdown menu and selected item display.

### API

- `PinesUISelect`: The select component

| Props         | Description                                                                           |
| :------------ | :------------------------------------------------------------------------------------ |
| `options`     | Array of option objects with format `{ value: string, label: string }`. Default: `[]` |
| `value`       | Currently selected value. Default: `null`                                             |
| `onChange`    | Function called when selection changes, receives the selected value                   |
| `placeholder` | Text to display when no option is selected. Default: `"Select an option"`             |
| `disabled`    | Boolean to disable the select. Default: `false`                                       |
| `className`   | Additional CSS classes                                                                |

### Example

```tsx
import React, { useState } from 'react';
import { PinesUISelect } from './components/PinesUISelect';

const SelectExample = () => {
    const options = [
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'angular', label: 'Angular' },
        { value: 'svelte', label: 'Svelte' }
    ];

    const [selectedFramework, setSelectedFramework] = useState<string | null>(
        null
    );

    return (
        <div className="w-full max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Select a framework
            </label>

            <PinesUISelect
                options={options}
                value={selectedFramework}
                onChange={setSelectedFramework}
                placeholder="Choose a framework"
            />

            {selectedFramework && (
                <p className="mt-4 text-sm text-gray-600">
                    You selected:{' '}
                    <span className="font-medium">
                        {
                            options.find(
                                (opt) => opt.value === selectedFramework
                            )?.label
                        }
                    </span>
                </p>
            )}

            <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Disabled example:
                </h3>
                <PinesUISelect
                    options={options}
                    disabled={true}
                    placeholder="Disabled select"
                />
            </div>
        </div>
    );
};

export default SelectExample;
```

## Menu Bar

> A visually persistent menu common in desktop applications, offering convenient
> access to a consistent set of commands.

### API

- `PinesUIMenuBar`: The top-level component of the menu bar

| Props       | Description            |
| :---------- | :--------------------- |
| `children`  | Menu bar items         |
| `className` | Additional CSS classes |

- `PinesUIMenuBarItem`: Individual menu in the menu bar

| Props       | Description                                   |
| :---------- | :-------------------------------------------- |
| `title`     | Menu title text                               |
| `children`  | Menu actions and submenus                     |
| `disabled`  | Boolean to disable the menu. Default: `false` |
| `className` | Additional CSS classes                        |

- `PinesUIMenuBarDivider`: Horizontal divider between menu items

- `PinesUIMenuBarAction`: Clickable action item in a menu

| Props       | Description                                         |
| :---------- | :-------------------------------------------------- |
| `children`  | Action text                                         |
| `onClick`   | Function called when the action is clicked          |
| `shortcut`  | Keyboard shortcut to display (e.g., "⌘S"). Optional |
| `disabled`  | Boolean to disable the action. Default: `false`     |
| `className` | Additional CSS classes                              |

- `PinesUIMenuBarSubmenu`: Nested submenu within a menu

| Props       | Description                                      |
| :---------- | :----------------------------------------------- |
| `title`     | Submenu title text                               |
| `children`  | Submenu actions                                  |
| `disabled`  | Boolean to disable the submenu. Default: `false` |
| `className` | Additional CSS classes                           |

### Example

```tsx
import React, { useState } from 'react';
// Import menu bar components
import {
    PinesUIMenuBar,
    PinesUIMenuBarItem
} from './pines-ui-react/pines-ui-menu-bar';

// Import menu components
import {
    PinesUIMenuItem,
    PinesUIMenuCheckbox,
    PinesUIMenuRadioButton,
    PinesUIMenuSubmenu,
    PinesUIMenuSeparator
} from './pines-ui-react/pines-ui-menu';

const PinesUIMenuBarExample = () => {
    const [alwaysShowBookmarks, setAlwaysShowBookmarks] = useState(false);
    const [alwaysShowFullURL, setAlwaysShowFullURL] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState('Taylor Otwell');

    return (
        <PinesUIMenuBar>
            {/* File Menu */}
            <PinesUIMenuBarItem id="file-menu" title="File">
                <PinesUIMenuItem
                    id="new-tab"
                    label="New Tab"
                    onClick={() => console.log('New Tab')}
                    hotkey="⌘T"
                />
                <PinesUIMenuItem
                    id="new-window"
                    label="New Window"
                    onClick={() => console.log('New Window')}
                    hotkey="⌘N"
                />
                <PinesUIMenuItem
                    id="new-incognito-window"
                    label="New Incognito Window"
                    enabled={false}
                />

                <PinesUIMenuSeparator />

                <PinesUIMenuSubmenu id="share" label="Share">
                    <PinesUIMenuItem
                        id="email-link"
                        label="Email link"
                        onClick={() => console.log('Email link')}
                    />
                    <PinesUIMenuItem
                        id="messages"
                        label="Messages"
                        onClick={() => console.log('Messages')}
                    />
                    <PinesUIMenuItem
                        id="notes"
                        label="Notes"
                        onClick={() => console.log('Notes')}
                    />
                </PinesUIMenuSubmenu>

                <PinesUIMenuSeparator />

                <PinesUIMenuItem
                    id="print"
                    label="Print"
                    onClick={() => console.log('Print')}
                    hotkey="⌘P"
                />
            </PinesUIMenuBarItem>

            {/* Edit Menu */}
            <PinesUIMenuBarItem id="edit" title="Edit">
                <PinesUIMenuItem
                    id="undo"
                    label="Undo"
                    onClick={() => console.log('Undo')}
                    hotkey="⌘Z"
                />
                <PinesUIMenuItem
                    id="redo"
                    label="Redo"
                    onClick={() => console.log('Redo')}
                    hotkey="⇧⌘Z"
                />

                <PinesUIMenuSeparator />

                <PinesUIMenuSubmenu id="find" label="Find">
                    <PinesUIMenuItem
                        id="search-web"
                        label="Search the web"
                        onClick={() => console.log('Search the web')}
                    />

                    <PinesUIMenuSeparator />

                    <PinesUIMenuItem
                        id="find-dialog"
                        label="Find..."
                        onClick={() => console.log('Find...')}
                    />
                    <PinesUIMenuItem
                        id="find-next"
                        label="Find Next"
                        onClick={() => console.log('Find Next')}
                    />
                    <PinesUIMenuItem
                        id="find-previous"
                        label="Find Previous"
                        onClick={() => console.log('Find Previous')}
                    />
                </PinesUIMenuSubmenu>

                <PinesUIMenuSeparator />

                <PinesUIMenuItem
                    id="cut"
                    label="Cut"
                    onClick={() => console.log('Cut')}
                />
                <PinesUIMenuItem
                    id="copy"
                    label="Copy"
                    onClick={() => console.log('Copy')}
                />
                <PinesUIMenuItem
                    id="paste"
                    label="Paste"
                    onClick={() => console.log('Paste')}
                />
            </PinesUIMenuBarItem>

            {/* View Menu */}
            <PinesUIMenuBarItem id="view-menu" title="View">
                <PinesUIMenuCheckbox
                    id="show-bookmarks"
                    label="Always Show Bookmarks Bar"
                    checked={alwaysShowBookmarks}
                    onChange={setAlwaysShowBookmarks}
                />
                <PinesUIMenuCheckbox
                    id="show-full-url"
                    label="Always Show Full URLs"
                    checked={alwaysShowFullURL}
                    onChange={setAlwaysShowFullURL}
                />

                <PinesUIMenuSeparator />

                <PinesUIMenuItem
                    id="reload"
                    label="Reload"
                    onClick={() => console.log('Reload')}
                    hotkey="⌘R"
                />
                <PinesUIMenuItem
                    id="force-reload"
                    label="Force Reload"
                    onClick={() => console.log('Force Reload')}
                    hotkey="⇧⌘R"
                    enabled={false}
                />

                <PinesUIMenuSeparator />

                <PinesUIMenuItem
                    id="fullscreen"
                    label="Toggle Fullscreen"
                    onClick={() => console.log('Toggle Fullscreen')}
                />

                <PinesUIMenuSeparator />

                <PinesUIMenuItem
                    id="hide-sidebar"
                    label="Hide Sidebar"
                    onClick={() => console.log('Hide Sidebar')}
                />
            </PinesUIMenuBarItem>

            {/* Profiles Menu */}
            <PinesUIMenuBarItem id="profiles-menu" title="Profiles">
                <PinesUIMenuRadioButton
                    groupId="profiles"
                    id="profile-taylor"
                    label="Taylor Otwell"
                    onChange={() => setSelectedProfile('Taylor Otwell')}
                />
                <PinesUIMenuRadioButton
                    groupId="profiles"
                    id="profile-adam"
                    label="Adam Wathan"
                    onChange={() => setSelectedProfile('Adam Wathan')}
                />
                <PinesUIMenuRadioButton
                    groupId="profiles"
                    id="profile-caleb"
                    label="Caleb Porzio"
                    onChange={() => setSelectedProfile('Caleb Porzio')}
                />

                <PinesUIMenuSeparator />

                <PinesUIMenuItem
                    id="edit-profile"
                    label="Edit..."
                    onClick={() => console.log('Edit...')}
                />

                <PinesUIMenuSeparator />

                <PinesUIMenuItem
                    id="add-profile"
                    label="Add Profile..."
                    onClick={() => console.log('Add Profile...')}
                />
            </PinesUIMenuBarItem>
        </PinesUIMenuBar>
    );
};

export default PinesUIMenuBarExample;
```

```

```
