interface ScoreVideoEvent {
    id: string;
    resourceId: string;
    sequenceId: number;
    renderer: RenderManager;
    attribute: Record<string, any>;
    actions: (attr: Record<string, any>) => void;
}

interface ScoreVideoEventGroup {
    id: string; 
    children: Array<ScoreVideoEvent>
}

interface BaseScoreVideoEventAttribute extends Record<string, any> {
    sequenceId: number;
    startTime: number;
    endTime: number | "next" | null ;
    target: number; // Resource Id
}