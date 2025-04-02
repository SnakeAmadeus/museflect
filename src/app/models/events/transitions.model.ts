export class ScoreVideoTransition {
    timeBeforeNext: number;

    prevObjectAnimations: Animation[];
    nextObjectAnimations: Animation[];

    constructor(
        timeBeforeNext: number, 
        prevObjectAnimations: Animation[] = [], 
        nextObjectAnimations: Animation[] = []
    ) {
        this.timeBeforeNext = timeBeforeNext;
        this.prevObjectAnimations = prevObjectAnimations;
        this.nextObjectAnimations = nextObjectAnimations;
    }
}

