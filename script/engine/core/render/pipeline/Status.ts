
interface StatusReadonly {
    readonly materials: number;
    readonly pipelines: number;
    readonly draws: number;
    readonly stages: number;
}

export class Status implements StatusReadonly {
    static readonly Event = Event;

    materials: number = 0;

    pipelines: number = 0;

    draws: number = 0;

    stages: number = 0;

    clear() {
        this.materials = 0;
        this.pipelines = 0;
        this.draws = 0;
        this.stages = 0;

        return this;
    }
}

export declare namespace Status {
    export { StatusReadonly as Readonly }
}