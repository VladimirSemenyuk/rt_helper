export default class GlobalState {
    public allStatuses = false;
    public fromDate = '2018-01-01';
    public owners: string[] = [];
    public queues: string[] = [];
    public name: string;

    constructor(name: string) {
        this.name = name;

        Object.assign(this, JSON.parse(window.localStorage.getItem(name) || '{}'), {
            name,
        });

        this.sync();
    }

    public sync() {
        window.localStorage.setItem(this.name, JSON.stringify(this));
    }
}
