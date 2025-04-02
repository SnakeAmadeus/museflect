import { create } from 'zustand/react';
import {
    MuseFlectDataTree,
    MuseFlectDataTreeViewModel
} from '../../models/museflect-data-tree.model';
import { produce } from 'immer';
import { enableMapSet } from 'immer';
import { Page, ScoreBook } from '@/app/models/score-video-object';

const initialResourceDataTreeViewModel = (() => {
    let newTreeViewModel = new MuseFlectDataTreeViewModel(
        ['id', 'label', 'canOnStage', 'canHaveChildren'],
        (nodeData) => false
    );
    return newTreeViewModel;
})();

const initialResourceDataTree = (() => {
    let newTree = new MuseFlectDataTree();
    const rootId = newTree.getRoot();
    newTree.addChildren(
        rootId,
        {
            label: 'Music',
            canOnStage: false,
            canHaveChildren: false
        },
        -1,
        '1'
    );
    newTree.addChildren(
        rootId,
        {
            label: 'Graphics',
            canOnStage: false,
            canHaveChildren: false
        },
        -1,
        '2'
    );
    newTree.connectViewModel(initialResourceDataTreeViewModel);
    return newTree;
})();

enableMapSet();
export const useResourceStore = create<any>((set) => ({
    resourceDataTree: initialResourceDataTree,

    addScoreBook: (data: any) => {
        ScoreBook.create(data, 'pdf').then((newScoreBook) => set(
            produce((state: any) => {
                const newNode = state.resourceDataTree.addChildren('2', newScoreBook);
                const newPagesFromBook = newScoreBook.toPages();
                (newPagesFromBook as Page[]).forEach((p, i) => {
                    state.resourceDataTree.addChildren(newNode['id'], p);
                });
            })
        ));
    },

    updateNode: (id: string, data: any) =>
        set(
            produce((state: any) => {
                state.resourceDataTree.updateNode(id, data);
            })
        ),

    moveNode: (id: string, parentId: string, position: number = -1) =>
        set(
            produce((state: any) => {
                state.resourceDataTree.moveNode(id, parentId, position);
            })
        ),

    deleteNode: (id: string) =>
        set(
            produce((state: any) => {
                state.resourceDataTree.deleteNode(id);
            })
        )
}));

export default useResourceStore;
