const fetch = require('./fetch');
const { parseApiResponce } = require('./utils');

const STATUS_HISTORY_REGEXP = /Status changed from '([a-zA-Z]*)' to '([a-zA-Z]*)'/;

module.exports = class Ticket {
    constructor(id, name) {
        this.id = id;
        this.subject = name;
    }

    get lifeTime() {
        if (this.status === 'deployed') {
            return this.lastUpdated - this.created;
        } else {
            return Date.now() - this.created;
        }
    }

    get statusesTimes() {
        const res = {};
        const statusChanges = this.__history.filter(record => record.Type === 'Status');
        let prevRecord = this.created;

        //console.log(statusChanges);

        for (const change of statusChanges) {
            //console.log(change.OldValue, change.NewValue)
            const date = new Date(change.Created);
            const delta = date - prevRecord;

            res[change.OldValue] = (res[change.OldValue] || 0) + delta;

            prevRecord = date;
        }

        return res;
    }

    async fetch() {
        const data = parseApiResponce(await fetch(`ticket/${this.id}`));

        this.queue = data.Queue;
        this.owner = data.Owner;
        this.creator = data.Creator;
        this.subject = data.Subject;
        this.status = data.Status;
        this.priority = parseInt(data.Priority, 10);
        this.initialPriority = parseInt(data.InitialPriority, 10);
        this.finalPriority = parseInt(data.FinalPriority, 10);
        this.requestors = data.Requestors;
        this.created = new Date(data.Created);
        this.lastUpdated = new Date(data.LastUpdated);
        this.timeEstimated = data.TimeEstimated;
        this.timeWorked = data.TimeWorked;
        this.timeLeft = data.TimeLeft;

        this.__history = await this.__fetchHistory();

        return this;
    }

    async __fetchHistory() {
        const data = await fetch(`ticket/${this.id}/history?format=l`);

        this.__history = data.split('--\n').map(parseApiResponce);

        return this.__history;
    }
}
