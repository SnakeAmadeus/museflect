export class EventRenderTask {
    taskId: number;
    start: number;
    end: number;
    prev: EventRenderTask | null;
    next: EventRenderTask | null;

    constructor(
        taskId: number,
        start: number,
        end: number,
        prev: EventRenderTask | null,
        next: EventRenderTask | null
    ) {
        this.taskId = taskId;
        this.start = start;
        this.end = end;
        this.prev = prev;
        this.next = next;
    }
}
