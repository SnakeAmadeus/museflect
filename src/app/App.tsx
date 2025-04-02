import { useState } from 'react';
import * as PDFJS from 'pdfjs-dist';
import './App.scss';
import MuseFlectMenuBar from './components/menu-bar';
import ResourcesTreeView from './views/resources-tree-view';

import { CommandService } from './services/command.service';
import { FileService } from './services/file-service.service';
import { GloabalStateService } from './services/global-states.service';
import useResourceStore from './services/store/resource.store';
import MuseflectButton from './components/museflect-button';
import MuseFlectDock from './components/museflect-dock';
import ResourcesEditCanvas from './views/resources-edit-canvas';

PDFJS.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

function App() {
    const [count, setCount] = useState(0);

    const commandService = new CommandService();
    const fileService = new FileService();
    const globalStateService = new GloabalStateService();

    const resourceTreeRef = useResourceStore(
        (state: any) => state.resourceDataTree
    );
    const resourceTreeViewModelRef = useResourceStore(
        (state: any) => state.resourceDataTree.viewModel.nestedObjectTree
    );

    return (
        <div className="App">
            <div className="title-bar draggable-region"></div>
            <div className="layout-left-temp non-draggable-region mt-1">
                <MuseFlectMenuBar></MuseFlectMenuBar>
                <div className="mt-5 bg-white drop-shadow-sm hover:drop-shadow-md">
                    <ResourcesTreeView></ResourcesTreeView>
                </div>
                {/* <MuseflectButton
                    label="Test"
                    className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                    onClick={(e) => console.log(resourceTreeRef)}
                ></MuseflectButton> */}
            </div>
            <div className="layout-dock-container non-draggable-region">
                <MuseFlectDock dockDirection="top" dockHandleThickness={0.2} dockHandleLength={6}>
                    {/* <div>
                        <MuseFlectMenuBar></MuseFlectMenuBar>
                    </div> */}
                    <MuseflectButton
                        label="Navigation Bar Goes Here"
                        className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                        onClick={(e) => console.log(resourceTreeRef)}
                    ></MuseflectButton>
                </MuseFlectDock>
            </div>
            <div className='layout-right-temp non-draggable-region'>
                <ResourcesEditCanvas></ResourcesEditCanvas>
            </div>
        </div>
    );
}

export default App;
