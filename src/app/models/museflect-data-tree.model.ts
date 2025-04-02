import { immerable } from 'immer';

interface TreeStructureAdjacencyLists {
    children: {
        [key: string]: string[];
    };
    parents: {
        [key: string]: string | null;
    };
}

export class MuseFlectDataTree {
    [immerable] = true;
    nodeData: Map<string, any>;
    nodeStructure: TreeStructureAdjacencyLists;
    currentNewID: number;

    viewModel: MuseFlectDataTreeViewModel | null;

    constructor() {
        console.log("Initializing new tree...");
        this.currentNewID = 0;

        this.viewModel = null;

        this.nodeData = new Map();
        this.nodeData.set('0', { label: 'Content' });

        this.nodeStructure = {
            children: {
                '0': []
            },
            parents: {
                '0': null
            }
        };
    }

    //================================Basic Utility Methods================================//
    /**
     * Get root node
     * @returns {string} - Array of root node IDs
     */
    getRoot() {
        return Object.entries(this.nodeStructure.parents)
            .filter(([_, parentId]) => parentId === null)
            .map(([id]) => id)[0];
    }
    /**
     * Get node data by ID
     * @param {string} id - Node ID
     * @returns {any} - Node data or undefined if not found
     */
    getNode(id: string) {
        var targetNode = this.nodeData.get(id);
        targetNode["id"] = id;
        return targetNode;
    }
    /**
     * Get node's position among its siblings
     * @param {string} id - Node ID
     * @returns {number} - Position index or -1 if not found
     */
    getNodePositionAsChildren(id: string) {
        const parentId = this.nodeStructure.parents[id];
        if (parentId === null) return 1;
        if (parentId === undefined) return -1;

        const siblings = this.nodeStructure.children[parentId] || [];
        return siblings.indexOf(id);
    }
    /**
     * Get all children of a node
     * @param {string} id - Node ID
     * @returns {Array} - Array of child IDs
     */
    getChildren(id: string) {
        return this.nodeStructure.children[id] || [];
    }
    /**
     * Get parent of a node
     * @param {string|number} id - Node ID
     * @returns {string|number|null} - Parent ID or null if root
     */
    getParent(id: string) {
        return this.nodeStructure.parents[id];
    }
    /**
     * Get the path from a node to the root
     * @param {string} id - The ID of the node
     * @returns {Array<string>} Array of node IDs from the given node up to the root
     */
    getAncestors(id: string): string[] {
        const ancestors: string[] = [id]; // Include the starting node
        var currentId = id;

        // Keep adding parents until we reach a root node (null parent)
        while (this.nodeStructure.parents[currentId] !== null) {
            let parentId = this.nodeStructure.parents[currentId];
            if (parentId === undefined) break;
            else currentId = parentId || '-1';
            // If undefined, we've reached a node not in the tree

            ancestors.push(currentId);
        }
        
        return ancestors;
    }
    /**
     * Perform pre-order traversal starting from a given node
     * @param id - The ID of the starting node
     * @param callback - Function to call for each node during traversal
     */
    preorderTraversal(id: string, callback: (nodeId: string) => void): void {
        // Visit the current node first
        callback(id);

        // Then visit all children recursively
        const children = this.nodeStructure.children[id] || [];
        for (const childId of children) {
            this.preorderTraversal(childId, callback);
        }
    }
    /**
     * Performs a level-order (breadth-first) traversal of the tree starting from a given node
     * @param id - The ID of the starting node
     * @param callback - Function to call for each node during traversal
     */
    levelOrderTraversal(
        id: string,
        callback: (nodeId: string, level: number) => void
    ): void {
        const queue: Array<[string, number]> = [[id, 0]]; // [nodeId, level]
        const visited = new Set<string>();

        while (queue.length > 0) {
            const [currentId, level] = queue.shift()!;

            if (visited.has(currentId)) continue;
            visited.add(currentId);

            // Process the current node
            callback(currentId, level);

            // Add all children to the queue
            const children = this.nodeStructure.children[currentId] || [];
            for (const childId of children) {
                queue.push([childId, level + 1]);
            }
        }
    }

    //================================Node Manipulations (Update/Add/Move/Delete)================================//
    /**
     * Set node data properties and update viewModel if necessary
     * @param {string} id - Node ID
     * @param {Object} payload - Object containing properties to update
     */
    updateNode(id: string, payload: any) {
        const target = this.nodeData.get(id);
        if (!target) {
            console.warn(`Node with ID ${id} not found`);
            return;
        }

        const updateNestedProps = (target: any, source: any) => {
            for (const key in source) {
                if (
                    typeof source[key] === 'object' &&
                    source[key] !== null &&
                    typeof target[key] === 'object' &&
                    target[key] !== null
                ) {
                    updateNestedProps(target[key], source[key]);
                } else {
                    try {
                        target[key] = source[key];
                    } catch (err) {
                        console.warn(
                            `Cannot set property ${key} on node ${id}`
                        );
                    }
                }
            }
        };

        updateNestedProps(target, payload);

        // Update viewModel if it exists and if payload contains view-related attributes
        if (this.viewModel) {
            // Check if any of the updated properties are view-related
            const hasViewRelatedProps = Object.keys(payload).some((key) =>
                this.viewModel?.viewModelRelatedAttributes.includes(key)
            );

            if (hasViewRelatedProps) {
                // Get the node's ancestry path (in reverse to get path from root to node)
                const ancestryPath = this.getAncestors(id).reverse();
                const nodeAncestry = { path: ancestryPath };

                // Update the node in the viewModel
                this.viewModel.update(nodeAncestry, payload);
            }
        }
    }

    /**
     * Move a node to a new parent at specified position
     * @param {string} id - Node ID to move
     * @param {string} parentId - New parent ID
     * @param {number} pos - Position to insert at (-1 for end)
     */
    moveNode(id: string, parentId: string, pos = -1) {
        // Get the original ancestry before moving
        const originalAncestry = { path: this.getAncestors(id).reverse() };

        const currentParentId = this.nodeStructure.parents[id];
        // Don't do anything if moving to same parent at same position
        if (currentParentId === parentId) {
            const currentPos = this.getNodePositionAsChildren(id);
            if (
                currentPos === pos ||
                (pos === -1 &&
                    currentPos ===
                        this.nodeStructure.children[parentId].length - 1)
            ) {
                return;
            }
            // Remove from current parent's children list
            const siblings = this.nodeStructure.children[parentId];
            siblings.splice(currentPos, 1);
            // Reinsert at new position
            if (pos === -1 || pos >= siblings.length) {
                siblings.push(id);
            } else {
                siblings.splice(pos, 0, id);
            }

            // Update viewModel if it exists (for reordering within same parent)
            if (this.viewModel) {
                const parentAncestry = {
                    path: this.getAncestors(parentId).reverse()
                };
                this.viewModel.move(originalAncestry, parentAncestry, pos);
            }

            return;
        }

        // Remove from old parent's children list
        if (currentParentId !== null) {
            const oldSiblings = this.nodeStructure.children[currentParentId];
            const index = oldSiblings.indexOf(id);
            if (index !== -1) {
                oldSiblings.splice(index, 1);
            }
        }

        // Update parent reference
        this.nodeStructure.parents[id] = parentId;

        // Add to new parent's children list
        if (!this.nodeStructure.children[parentId]) {
            this.nodeStructure.children[parentId] = [];
        }

        const newSiblings = this.nodeStructure.children[parentId];
        if (pos === -1 || pos >= newSiblings.length) {
            newSiblings.push(id);
        } else {
            newSiblings.splice(pos, 0, id);
        }

        // Update viewModel if it exists
        if (this.viewModel) {
            const targetParentAncestry = {
                path: this.getAncestors(parentId).reverse()
            };
            this.viewModel.move(originalAncestry, targetParentAncestry, pos);
        }
    }

    /**
     * Add a new child node to a parent
     * @param {string} parentId - Parent node ID
     * @param {Object} data - Node data
     * @param {number} pos - Position to insert at (-1 for end)
     * @param {number|string} id - Specific ID to use, or -1 to auto-generate
     * @returns {Object} - New node data
     */
    addChildren(
        parentId: string,
        data: any,
        pos = -1,
        id: number | string = -1
    ) {
        parentId = parentId.toString();
        var newId = id;
        if (id == -1) {
            this.currentNewID++;
            newId = `${this.currentNewID}`;
        } else {
            newId = `${id}`;
            this.currentNewID = +id + 1;
        }

        // Store node data
        this.nodeData.set(newId, data);

        // Update structure
        this.nodeStructure.parents[newId] = parentId;

        if (!this.nodeStructure.children[newId]) {
            this.nodeStructure.children[newId] = [];
        }

        if (!this.nodeStructure.children[parentId]) {
            this.nodeStructure.children[parentId] = [];
        }

        const siblings = this.nodeStructure.children[parentId];
        if (pos === -1 || pos >= siblings.length) {
            siblings.push(newId);
        } else {
            siblings.splice(pos, 0, newId);
        }

        // Update viewModel if it exists
        if (this.viewModel) {
            // Create a filtered data object with only view-related attributes
            const viewData: any = { id: newId };

            for (const attr of this.viewModel.viewModelRelatedAttributes) {
                if (attr in data) {
                    viewData[attr] = data[attr];
                }
            }

            // Get parent ancestry path
            const parentAncestryPath = this.getAncestors(parentId).reverse();
            const parentNodeAncestry = { path: parentAncestryPath };

            console.log("add to viewmodel: ", viewData);
            console.log("parentNodeAncestry = ", parentNodeAncestry);
            // Add the node to the viewModel
            this.viewModel.add(parentNodeAncestry, viewData);
        }

        return this.getNode(newId);
    }

    /**
     * Delete a node and all its descendants
     * @param {string} id - Node ID to delete
     * @returns {Array} - Array of deleted node IDs
     */
    deleteNode(id: string) {
        const deletedNodes: Array<string> = [];

        // Get the ancestry of nodes to be deleted (for view model updates)
        const nodeAncestries: { id: string; ancestry: { path: string[] } }[] =
            [];

        const collectAncestries = (nodeId: string) => {
            const ancestry = { path: this.getAncestors(nodeId).reverse() };
            nodeAncestries.push({ id: nodeId, ancestry });

            const children = this.nodeStructure.children[nodeId] || [];
            for (const childId of children) {
                collectAncestries(childId);
            }
        };

        // Collect ancestries before altering the tree structure
        collectAncestries(id);

        const deleteRecursive = (nodeId: string) => {
            // Kill all its children first
            const children = this.nodeStructure.children[nodeId] || [];
            for (const childId of [...children]) {
                deleteRecursive(childId);
            }

            // Ostracize the node from parent's children list
            const parentId = this.nodeStructure.parents[nodeId];
            if (parentId !== null && parentId !== undefined) {
                const siblings = this.nodeStructure.children[parentId];
                const index = siblings.indexOf(nodeId);
                if (index !== -1) {
                    siblings.splice(index, 1);
                }
            }

            // Obliterate its data and structure
            this.nodeData.delete(nodeId);
            delete this.nodeStructure.children[nodeId];
            delete this.nodeStructure.parents[nodeId];

            deletedNodes.push(nodeId);
        };

        deleteRecursive(id);

        // Update the viewModel if it exists (delete in reverse order - deepest first)
        if (this.viewModel) {
            // Sort ancestries by path length (longest first) to delete deepest nodes first
            nodeAncestries.sort(
                (a, b) => b.ancestry.path.length - a.ancestry.path.length
            );

            for (const { ancestry } of nodeAncestries) {
                this.viewModel.delete(ancestry);
            }
        }

        // Transport dead bodies
        return deletedNodes;
    }

    //================================View Model Related Operations================================//
    /**
     * Connect a MuseFlectDataTreeViewModel instance to the data tree.
     * @param viewmodel
     * @return reference to the connected viewmodel
     */
    connectViewModel(viewmodel: MuseFlectDataTreeViewModel) {
        this.viewModel = viewmodel;
        this.forceSyncViewModel();
        return this.viewModel;
    }
    /**
     * Synchronizes the entire data tree with the view model
     * Rebuilds the view model's nested object tree from scratch
     */
    forceSyncViewModel() {
        if (this.viewModel === null) {
            console.warn(
                'MuseFlectDataTree: forceSyncViewModel(): ViewModel not found!'
            );
            return;
        }

        // Clear the existing view model tree
        this.viewModel.nestedObjectTree = [];

        // Get the root node ID
        const rootId = this.getRoot();
        if (!rootId) {
            console.warn(
                'MuseFlectDataTree: forceSyncViewModel(): Root node not found!'
            );
            return;
        }

        // Add the root node to the view model
        const rootData = this.getNode(rootId);
        const rootViewData: any = { id: rootId, children: [] };
        // Copy view-related attributes from the root node data
        for (const attr of this.viewModel.viewModelRelatedAttributes) {
            if (attr in rootData) {
                rootViewData[attr] = rootData[attr];
            }
        }
        // Initialize the view model with the root node
        this.viewModel.nestedObjectTree = [rootViewData];
        // Process all nodes using level-order traversal (skip the root as it's already added)
        this.levelOrderTraversal(rootId, (nodeId, level) => {
            // Skip the root node (level 0)
            if (level === 0) return;
            // Get the node data
            const nodeData = this.getNode(nodeId);
            if (!nodeData) return;
            // Skip nodes that should be ignored based on the condition
            if (this.viewModel!.ignoreNodeCondition(nodeData)) return;
            // Create a filtered data object with only view-related attributes
            const viewData: any = { id: nodeId };
            for (const attr of this.viewModel!.viewModelRelatedAttributes) {
                if (attr in nodeData) {
                    viewData[attr] = nodeData[attr];
                }
            }
            // Get the parent ID and construct the ancestry path
            const parentId = this.nodeStructure.parents[nodeId];
            if (parentId === null || parentId === undefined) return; // Skip orphaned nodes

            // Build the ancestry path from root to parent
            const parentPath = this.getAncestors(parentId).reverse();
            const parentNodeAncestry = { path: parentPath };

            // Add the node to the view model under its parent
            this.viewModel!.add(parentNodeAncestry, viewData);
        });
    }
}

/**
 * NodeAncestry Represents a path to a specific node within a nested object tree structure.
 *
 * The NodeAncestry attempts to bridge two different tree representation approaches:
 * 1. Adjacency List (used in MuseFlectDataTree): Nodes are indexed by ID and relationships
 *    are stored in separate structures (parents, children maps)
 * 2. Nested Object Tree (used in MuseFlectDataTreeViewModel): Nodes contain their children directly
 *    as nested arrays, creating a hierarchical structure. This is for the data binding to
 *    react-arborist treeview library.
 *
 * NodeAncestry (a list of node IDs from root to target)
 * allows direct navigation to any node in the nested tree structure
 * and avoids expensive tree traversals when manipulating the view model
 */
export interface NodeAncestry {
    /**
     * Array of node IDs, starting from the root node and ending with the target node.
     * For example: ["0", "5", "12"] represents: root → node 5 → node 12
     */
    path: string[];
}
export interface MuseFlectDataTreeViewModelNode {
    id: string;
    children: Array<MuseFlectDataTreeViewModelNode>;
    [key: string]: any;
}
export class MuseFlectDataTreeViewModel {
    [immerable] = true;
    /**
     * The hierarchical tree representation used for UI rendering.
     * Compatible format to the react-arborist treeview library.
     */
    nestedObjectTree: Array<MuseFlectDataTreeViewModelNode>;
    /**
     * List of node attributes that should be included in the view model (UI-related attributes).
     * Only these properties will be copied from the data tree to the view model.
     */
    viewModelRelatedAttributes: string[];
    /**
     * Callback Function that determines whether a node should be included in the view model
     */
    ignoreNodeCondition: (nodeData: any) => boolean;

    /**
     * Creates a new MuseFlectDataTreeViewModel instance
     * @param viewModelRelatedAttributes - Array of attribute names that should be included in the view model
     * @param ignoredConditions - Function that returns true if a node should be excluded from the view model
     */
    constructor(
        viewModelRelatedAttributes: string[] = [
            'id',
            'label',
            'icon',
            'canBeOnStage',
            'canHaveChildren'
        ],
        ignoredConditions: (nodeData: any) => boolean = () => false
    ) {
        this.nestedObjectTree = [{ id: '0', label: 'Content', children: [] }];
        this.viewModelRelatedAttributes = viewModelRelatedAttributes;
        this.ignoreNodeCondition = ignoredConditions;
    }

    /**
     * Finds a node in the viewModelTree based on its ancestry path
     * @param ancestry - The ancestry path to the target node
     * @returns The node if found, or null if not found
     */
    find(ancestry: NodeAncestry): any {
        if (!ancestry.path || ancestry.path.length === 0) {
            return null;
        }

        // Start with the root node
        let currentNode = this.nestedObjectTree[0];
        // Skip the first element (root) since we already have it
        for (let i = 1; i < ancestry.path.length; i++) {
            const currentId = ancestry.path[i];
            // Search for the node with matching ID in the children array
            const foundChild = currentNode.children.find(
                (child: any) => child.id === currentId
            );
            if (!foundChild) {
                return null;
            }
            currentNode = foundChild;
        }
        return currentNode;
    }

    /**
     * Adds a new node to the viewModelTree
     * @param parentNodeAncestry - The ancestry path to the parent node
     * @param nodeData - The data for the new node
     * @returns The added node or null if parent wasn't found
     */
    add(parentNodeAncestry: NodeAncestry, nodeData: any): any {
        const parentNode = this.find(parentNodeAncestry);
        if (!parentNode) {
            return null;
        }
        // Check if this node should be included
        if (this.ignoreNodeCondition(nodeData)) {
            return null;
        }
        // Create a new view model node with only the relevant attributes
        const viewModelNode: any = { children: [] };
        for (const attr of this.viewModelRelatedAttributes) {
            if (attr in nodeData) {
                viewModelNode[attr] = nodeData[attr];
            }
        }
        // Ensure ID is always included
        if (!viewModelNode.id && nodeData.id) {
            viewModelNode.id = nodeData.id;
        }
        // Add to parent's children
        if (!parentNode.children) {
            parentNode.children = [];
        }
        parentNode.children.push(viewModelNode);

        return viewModelNode;
    }

    /**
     * Deletes a node from the viewModelTree
     * @param targetNodeAncestry - The ancestry path to the node to delete
     * @returns Boolean indicating success
     */
    delete(targetNodeAncestry: NodeAncestry): boolean {
        if (targetNodeAncestry.path.length < 2) {
            // Can't delete the root node
            return false;
        }
        // Get parent ancestry by removing the last element
        const parentAncestry: NodeAncestry = {
            path: targetNodeAncestry.path.slice(0, -1)
        };
        const parentNode = this.find(parentAncestry);
        if (!parentNode || !parentNode.children) {
            return false;
        }
        const targetId =
            targetNodeAncestry.path[targetNodeAncestry.path.length - 1];
        const targetIndex = parentNode.children.findIndex(
            (child: any) => child.id === targetId
        );
        if (targetIndex === -1) {
            return false;
        }
        // Remove the node
        parentNode.children.splice(targetIndex, 1);
        return true;
    }

    /**
     * Moves a node to a new parent in the viewModelTree at a specific position
     * @param originNodeAncestry - The ancestry path to the node to move
     * @param targetParentNodeAncestry - The ancestry path to the new parent
     * @param position - The position to insert at (0-based index).
     *                  If -1 or >= children.length, appends to the end
     * @returns The moved node if successful, false otherwise
     */
    move(
        originNodeAncestry: NodeAncestry,
        targetParentNodeAncestry: NodeAncestry,
        position: number = -1
    ): any {
        const nodeToMove = this.find(originNodeAncestry);
        if (!nodeToMove) {
            return false;
        }
        const targetParentNode = this.find(targetParentNodeAncestry);
        if (!targetParentNode) {
            return false;
        }
        // First delete the node from its original location
        if (!this.delete(originNodeAncestry)) {
            return false;
        }
        // Add it to the new location
        if (!targetParentNode.children) {
            targetParentNode.children = [];
        }
        // Handle position logic
        if (position === -1 || position >= targetParentNode.children.length) {
            // Append to the end if position is -1 or beyond array bounds
            targetParentNode.children.push(nodeToMove);
        } else {
            // Insert at the specified position
            targetParentNode.children.splice(position, 0, nodeToMove);
        }
        // Return reference to the moved node
        return nodeToMove;
    }

    /**
     * Updates the data of a node in the viewModelTree
     * @param targetNodeAncestry - The ancestry path to the node to update
     * @param data - The new data for the node
     * @returns Boolean indicating success
     */
    update(targetNodeAncestry: NodeAncestry, data: any): boolean {
        const targetNode = this.find(targetNodeAncestry);
        if (!targetNode) {
            return false;
        }
        // Update only view model related attributes
        for (const attr of this.viewModelRelatedAttributes) {
            if (attr in data) {
                targetNode[attr] = data[attr];
            }
        }
        return true;
    }
}
