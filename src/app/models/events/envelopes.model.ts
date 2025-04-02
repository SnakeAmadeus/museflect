const EASING_FUNCTIONS = {
    "linear": (t: number) => t,
    "ease-in": (t: number) => t * t,              // Quadratic ease-in
    "ease-out": (t: number) => 1 - (1 - t) * (1 - t), // Quadratic ease-out
    "ease-in-out": (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    "cubic-bezier": (t: number) => t             // Placeholder—needs bezierParams
};

export type EasingFunction = keyof typeof EASING_FUNCTIONS;

// A point on the envelope
export interface EnvelopePoint {
    time: number;  // in ticks
    value: number; // e.g., opacity 0-1
}

// A segment between two points
export interface EnvelopeSegment {
    start: EnvelopePoint;
    end: EnvelopePoint;
    easing: EasingFunction;
    bezierParams?: [number, number, number, number]; // For cubicBezier: [x1, y1, x2, y2]
}

// Full envelope description
export interface EnvelopeDescriptor {
    points: EnvelopePoint[];
    segments: EnvelopeSegment[];
}

export class Envelope {
    protected descriptor: EnvelopeDescriptor;

    constructor(points: EnvelopePoint[], easing: EasingFunction | EasingFunction[] = "linear") {
        this.descriptor = this.buildDescriptor(points, easing);
    }

    private buildDescriptor(points: EnvelopePoint[], easing: EasingFunction | EasingFunction[]): EnvelopeDescriptor {
        if (points.length < 1) throw new Error("Need at least one point");
        points.sort((a, b) => a.time - b.time);

        const segments: EnvelopeSegment[] = [];
        const easingArray = Array.isArray(easing) ? easing : Array(points.length - 1).fill(easing);

        for (let i = 0; i < points.length - 1; i++) {
            segments.push({
                start: points[i],
                end: points[i + 1],
                easing: easingArray[i] || "linear",
            });
        }

        return { points, segments };
    }

    getFunction( ...args: any[] ): (t: number) => number {
        const { segments } = this.descriptor;
        if (segments.length === 0) {
            const singlePoint = this.descriptor.points[0];
            return () => singlePoint.value;
        }

        return (t: number) => {
            if (t < segments[0].start.time) return segments[0].start.value;
            if (t >= segments[segments.length - 1].end.time) return segments[segments.length - 1].end.value;

            const segment = segments.find(s => t >= s.start.time && t < s.end.time) || segments[segments.length - 1];
            const duration = segment.end.time - segment.start.time;
            const progress = (t - segment.start.time) / duration;
            return segment.start.value + (segment.end.value - segment.start.value) * EASING_FUNCTIONS[segment.easing]!(progress);
        };
    }
}

export class LinearEnvelope extends Envelope {
    constructor() {
        super([{ time: 0, value: 0 }, { time: 1, value: 1 }], "linear"); // Dummy points—overridden
    }

    getFunction(duration: number): (t: number) => number {
        return (t) => (t < 0 ? 0 : t > duration ? 1 : t / duration);
    }
}

export class EaseInEnvelope extends Envelope {
    constructor() {
        super([{ time: 0, value: 0 }, { time: 1, value: 1 }], "ease-in");
    }

    getFunction(duration: number): (t: number) => number {
        return (t) => {
            if (t < 0) return 0;
            if (t > duration) return 1;
            const progress = t / duration;
            return progress * progress; // Quadratic ease-in
        };
    }
}

export class EaseOutEnvelope extends Envelope {
    constructor() {
        super([{ time: 0, value: 0 }, { time: 1, value: 1 }], "ease-out");
    }

    getFunction(duration: number): (t: number) => number {
        return (t) => {
            if (t < 0) return 0;
            if (t > duration) return 1;
            const progress = t / duration;
            return 1 - (1 - progress) * (1 - progress); // Quadratic ease-out
        };
    }
}

export class EaseInOutEnvelope extends Envelope {
    constructor() {
        super([{ time: 0, value: 0 }, { time: 1, value: 1 }], "ease-in-out");
    }

    getFunction(duration: number): (t: number) => number {
        return (t) => {
            if (t < 0) return 0;
            if (t > duration) return 1;
            const progress = t / duration;
            return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        };
    }
}

export const DefaultEnvelopes = {
    "linear": new LinearEnvelope(),
    "ease-in": new EaseInEnvelope(),
    "ease-out": new EaseOutEnvelope(),
    "ease-in-out": new EaseInOutEnvelope()
}
export type SupportedDefaultEnvelopes = keyof typeof DefaultEnvelopes;
