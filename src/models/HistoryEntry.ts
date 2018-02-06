export default class HistoryEntry {
    public id: string = '';
    public Created: string = '';
    public Creator: string = '';
    public Field?: string;
    public Description?: string;
    public Type?: string;
    public NewValue?: string;
    public OldValue?: string;
    public MinutesWorked?: number;
    public Content?: string;

    get createdAt() {
        return new Date(this.Created);
    }

    constructor(data: object) {
        Object.assign(this, data);
    }
}
