export default class GlobalState<T extends object> {
    // public allStatuses = false;
    // public fromDate = '2018-01-01';
    // public owners: string[] = [];
    // public queues: string[] = [];
    private name: string;

    private data: T = {} as T;

    constructor(name: string) {
        this.name = name;

        this.data = JSON.parse(window.localStorage.getItem(name) || '{}');

        this.sync();
    }

    public get<F extends keyof T>(field: F): T[F] {
        return this.data[field];
    }

    public set<F extends keyof T>(field: F, value: T[F]): void {
        this.data[field] = value;

        this.sync();
    }

    private sync() {
        window.localStorage.setItem(this.name, JSON.stringify(this.data));
    }
}
