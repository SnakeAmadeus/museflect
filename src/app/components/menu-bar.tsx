import React, { useCallback, useState } from 'react';
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

import { FileService } from '../services/file-service.service';
import { CommandService } from '../services/command.service';

const MuseFlectMenuBar = () => {
    const actionHandlers: Map<string, Function> = new Map();

    actionHandlers.set(
        'import-pdf',
        useCallback(async () => {
            const openedFile = await FileService.openFileDialog({
                properties: ['openFile'],
                filters: [
                    {
                        name: 'PDF Files',
                        extensions: ['pdf']
                    }
                ],
                title: 'Select a PDF file'
            });
            if (openedFile) {
                await CommandService.parse(`import --pdf "${openedFile}"`);
            } else return;
        }, [])
    );

    return (
        <PinesUIMenuBar>
            {/* File Menu */}
            <PinesUIMenuBarItem id="file-menu" title="File">
                <PinesUIMenuItem
                    id="new-project"
                    label="New Project..."
                    onClick={() => console.log('New Tab')}
                    hotkey="⌘N"
                />

                <PinesUIMenuSeparator />

                <PinesUIMenuSubmenu id="import-menu" label="Import...">
                    <PinesUIMenuItem
                        id="import-pdf"
                        label="Import from PDF..."
                        onClick={actionHandlers.get('import-pdf')}
                    />
                </PinesUIMenuSubmenu>

                <PinesUIMenuSeparator />

                <PinesUIMenuItem
                    id="exit"
                    label="Exit"
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
        </PinesUIMenuBar>
    );
};

export default MuseFlectMenuBar;
