import { Tree, NodeApi, NodeRendererProps, RowRendererProps } from 'react-arborist';
import useResourceStore from '../services/store/resource.store';
import { useEffect, useState } from 'react';
import { useGlobalUIStateStore } from '../services/store/ui-state.store';
import ExpandCaretIcon from "../../assets/icons/plus-square.svg"
import CollapseCaretIcon from "../../assets/icons/minus-square.svg"

export interface ResourcesTreeViewNodeData {
    id: number,
    label: string,
    canOnStage?: boolean,
    canHaveChildren?: boolean
}

export default function ResourcesTreeView() {
    const resourceTreeViewModelRef = useResourceStore(
        (state: any) => state.resourceDataTree.viewModel.nestedObjectTree
    );
    const globalUIStateRef = useGlobalUIStateStore(
        (state: any) => state.globalUIState
    )
    
    useEffect(() => {}, []);

    const selectHandler = (nodes: NodeApi[]) => {
        
    }

    return (
        <div className="mt-2 pl-4 flex flex-col items-start border rounded-md border-neutral-400/80">
            <div className="relative -top-2 text-xs px-2 font-bold text-neutral-400 bg-white">
                CONTENT MANAGER
            </div>
            <Tree
                data={resourceTreeViewModelRef}
                openByDefault={true}
                height={500}
                indent={24}
                // renderRow={ResourcesTreeViewRow}
                rowHeight={46}
                paddingBottom={10}
                disableMultiSelection={false}
                onSelect={selectHandler}
            >
                {ResourcesTreeViewNode}
            </Tree>
        </div>
    );
}

// export function ResourcesTreeViewRow<T>({
//     node,
//     attrs,
//     innerRef,
//     children,
// }: RowRendererProps<T>) {
//     return (
//         <div
//             {...attrs}
//             style={{
//                 height: (node.data as ResourcesTreeViewNodeData).canOnStage ? "3rem" : "2rem"
//             }}
//             id="node-row"
//             ref={innerRef}
//             onFocus={(e) => e.stopPropagation()}
//             onClick={node.handleClick}
//         >
//             {children}
//         </div>
//     );
// }

const normalNodeRowStyle = {
    textAlign: "left",
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
}
const onStageNodeRowStyle = {
    ...normalNodeRowStyle,
}
const normalNodeStyle = (isSelected: boolean) => {
    const common = { padding: "0.25rem 0.3rem" };
    if (isSelected) {
        return Object.assign(common, {color: 'white', background: 'grey'});
    }
    else {
        return Object.assign(common, { color: 'black', background: 'white' });
    }
}
const onStageNodeStyle = (isSelected: boolean) => {
    const common = { 
        padding: "0.38rem 0.6rem",
        border: "1px solid rgb(229 229 229 / 0.8)",
        borderRadius: "0.375rem",
    };
    if (isSelected) {
        return Object.assign(common, { color: 'white', background: 'grey' });
    }
    else {
        return Object.assign(common, { color: 'black', background: 'none' });
    }
}
const DOUBLE_CLICK_TIME_THRESHOLD = 500;
export function ResourcesTreeViewNode({
    node,
    style,
    dragHandle
}: NodeRendererProps<any>) {
    const [doubleClickTrigger, setDoubleClickTrigger] = useState(false);

    // Override & Customize react-arborist's Node API Click handler:
    // https://github.com/brimdata/react-arborist/blob/main/modules/react-arborist/src/interfaces/node-api.ts#L199
    node.handleClick = (e: React.MouseEvent) => {
        if (doubleClickTrigger)
            handleDoubleClick();
        else {
            setDoubleClickTrigger(true);
            setTimeout(() => {
                setDoubleClickTrigger(false);
            }, DOUBLE_CLICK_TIME_THRESHOLD);
        }
            
        if ((e.target as HTMLElement).id == "node-label-area") {
            if (e.metaKey && !node.tree.props.disableMultiSelection) {
                node.isSelected ? node.deselect() : node.selectMulti();
            } else if (e.shiftKey && !node.tree.props.disableMultiSelection) {
                node.selectContiguous();
            } else {
                node.select();
                node.activate();
            }
        }
    };

    const handleDoubleClick = () => {
        if (node.isOnlySelection) {
            if (node.data.canOnStage)
                useGlobalUIStateStore.getState().updateEditingResource(node.data.id);
        }
        setDoubleClickTrigger(false);
    }

    return (
        <div id="node-body"
            ref={dragHandle}
            style={Object.assign(
                { ...style }, node.data.canOnStage ? onStageNodeRowStyle : normalNodeRowStyle
            )}
        >
            <ResourcesTreeViewNodeCaret
                node={node} openIcon={ExpandCaretIcon} closeIcon={CollapseCaretIcon}
            ></ResourcesTreeViewNodeCaret>
            
            <span id="node-label-area"
                onClick={node.handleClick} 
                style={Object.assign(
                    {...style} ,( node.data.canOnStage ? 
                        onStageNodeStyle(node.isSelected) : 
                        normalNodeStyle(node.isSelected)
                    )
                )}
            > 
                {node.data.label} 
            </span>
        </div>
    );
}

// https://www.nngroup.com/articles/accordion-icons/
export function ResourcesTreeViewNodeCaret({
    node, openIcon, closeIcon
}: { node: NodeApi, openIcon: string, closeIcon: string}) {
    const caretSize = 0.75;
    const style = {
        padding: 0,
        marginRight: `${caretSize/2}rem`,
        maxHeight: `${caretSize}rem`,
        maxWidth: `${caretSize}rem`
    }
    const caretToggleHandler = (e: any) => {
        node.toggle();
    }
    return (
        ((node.children != null && node.children?.length != 0) ? (
            node.isOpen ?
                <img onClick={caretToggleHandler} src={closeIcon} style={{ ...style }}></img>
                :
                <img onClick={caretToggleHandler} src={openIcon} style={{ ...style }}></img>
            )
            :
            <svg style={{ ...style }}></svg>
        )
    )
        
}
