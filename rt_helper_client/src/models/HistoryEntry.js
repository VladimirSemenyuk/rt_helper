export default class HistoryEntry {
    get createdAt() {
        return new Date(this.Created);
    }

    constructor(data) {
        Object.assign(this, data);
    }
}