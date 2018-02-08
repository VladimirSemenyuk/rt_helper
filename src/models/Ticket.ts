import {
    calculateLifeTime,
    fetchData as fetch,
    parseApiResponce,
} from '../utils';
import HistoryEntry from './HistoryEntry';
import { SPRINT_FIELD_NAME, BIZ_VALUE_FIELD_NAME } from '../common';

const SUBJECT_TRESHOLD = 70;

export default class Ticket {
    private static getEstimatedMinutes(ticket: Ticket) {
        if (ticket.history && ticket.history.length) {
            return ticket.history.reduce((r, e) => {
                if (e.Field === 'TimeEstimated') {
                    return e.NewValue ? parseInt(e.NewValue.replace(' minutes', ''), 10) : 0;
                }
                return r;
            }, parseInt(ticket.TimeEstimated.replace(' minutes', ''), 10));
        } else {
            return parseInt((ticket.TimeEstimated || '0').replace(' minutes', ''), 10);
        }
    }

    private static getWorkedMinutes(ticket: Ticket) {
        if (ticket.history && ticket.history.length) {
            return ticket.history.reduce((r, e) => {
                if (e.Field === 'TimeWorked') {
                    return e.NewValue ? parseInt(e.NewValue.replace(' minutes', ''), 10) : 0;
                }
                return r;
            }, parseInt(ticket.TimeWorked.replace(' minutes', ''), 10));
        } else {
            return parseInt((ticket.TimeWorked || '0').replace(' minutes', ''), 10);
        }
    }

    private static getTroubles(ticket: Ticket) {
        const troubles = [...ticket.historyTroubles || []];

        if (['New', 'Backlog'].indexOf(ticket.Status) === -1 && !ticket.estimatedMinutes) {
            troubles.push(TROUBLES.NO_ESTIMATION);
        }

        if (ticket.sprint && !ticket.estimatedMinutes) {
            troubles.push(TROUBLES.IN_SPRINT_WITHOUT_ESTIMATION);
        }

        if (ticket.estimatedMinutes && ticket.leftMinutes < 0) {
            troubles.push(TROUBLES.WRONG_ESTIMATION);
        }

        if (ticket.Owner === 'Nobody') {
            troubles.push(TROUBLES.UNASSIGNED);
        }

        if (ticket.lifeTime > (1000 * 60 * 60 * 24 * 92)) { // 92 days
            troubles.push(TROUBLES.TOO_OLD);
        }

        if (ticket.statusesTimes && ticket.statusesTimes.code_review > (1000 * 60 * 60 * 24 * 3)) { // 3 days
            troubles.push(TROUBLES.LONG_REVIEW);
        }

        return troubles;
    }

    public readonly id: string;
    public readonly key: string;
    public readonly sprint: string = '';
    public readonly title: string = '';
    public readonly hasBizValue: boolean = false;
    public readonly Subject: string = '';
    public readonly Status: string = '';
    public readonly Created: string = '';
    public readonly LastUpdated: string = '';
    public readonly TimeEstimated: string = '';
    public readonly Owner: string = '';
    public readonly Queue: string = '';
    public readonly TimeWorked: string = '';
    public readonly Priority: string = '';
    public readonly estimatedMinutes: number = 0;
    public readonly workedMinutes: number = 0;
    public readonly leftMinutes: number = 0;
    public readonly troubles: string[] = [];
    public readonly createdAt: Date = new Date();
    public readonly lastUpdatedAt: Date = new Date();
    public statusesTimes: {[key: string]: number} = {};
    public [BIZ_VALUE_FIELD_NAME]: number | void = 0;
    public [SPRINT_FIELD_NAME]: string = '';

    public history: HistoryEntry[] = [];
    public children?: Ticket[];

    private historyTroubles = new Set();
    private firstStatus: string = '';

    constructor(id: string) {
        this.id = id;
        this.key = id;
    }

    // get key() {
    //     return this.id;
    // }

    // get sprint() {
    //     return this[SPRINT_FIELD_NAME];
    // }

    // get title() {
    //     if (this.Subject.length > SUBJECT_TRESHOLD) {
    //         return this.Subject.substring(0, SUBJECT_TRESHOLD) + '...';
    //     }

    //     return this.Subject;
    // }

    // get hasBizValue() {
    //     return !!this[BIZ_VALUE_FIELD_NAME];
    // }

    // get createdAt() {
    //     return new Date(this.Created);
    // }

    // get lastUpdatedAt() {
    //     return new Date(this.LastUpdated);
    // }

    // get estimatedMinutes() {
    //     return this.history.reduce((r, e) => {
    //         if (e.Field === 'TimeEstimated') {
    //             return e.NewValue ? parseInt(e.NewValue.replace(' minutes', ''), 10) : 0;
    //         }
    //         return r;
    //     }, parseInt(this.TimeEstimated.replace(' minutes', ''), 10));
    // }

    // get workedMinutes() {
    //     return this.history.reduce((r, e) => {
    //         if (e.Field === 'TimeWorked') {
    //             return parseInt((e.NewValue || '0').replace(' minutes', ''), 10);
    //         }
    //         return r;
    //     }, 0);
    // }

    // get leftMinutes() {
    //     return this.estimatedMinutes - this.workedMinutes;
    // }

    // get troubles() {
    //     const troubles = [...this.historyTroubles];

    //     if (['New', 'Backlog'].indexOf(this.Status) === -1 && !this.estimatedMinutes) {
    //         troubles.push(TROUBLES.NO_ESTIMATION);
    //     }

    //     if (this.sprint && !this.estimatedMinutes) {
    //         troubles.push(TROUBLES.IN_SPRINT_WITHOUT_ESTIMATION);
    //     }

    //     if (this.estimatedMinutes && this.leftMinutes < 0) {
    //         troubles.push(TROUBLES.WRONG_ESTIMATION);
    //     }

    //     if (this.Owner === 'Nobody') {
    //         troubles.push(TROUBLES.UNASSIGNED);
    //     }

    //     if (this.lifeTime > (1000 * 60 * 60 * 24 * 92)) { // 92 days
    //         troubles.push(TROUBLES.TOO_OLD);
    //     }

    //     if (this.statusesTimes.code_review > (1000 * 60 * 60 * 24 * 3)) { // 3 days
    //         troubles.push(TROUBLES.LONG_REVIEW);
    //     }

    //     return troubles;
    // }

    get lifeTime() {
        if (this.Status === 'deployed' || this.Status === 'closed') {
            return this.lastUpdatedAt.getTime() - this.createdAt.getTime();
        } else {
            return Date.now() - this.createdAt.getTime();
        }
    }

    public async fetch() {
        const parsedTicketData = parseApiResponce(await fetch(`ticket/${this.id}`)) as any;
        this.updateData(parsedTicketData);
    }

    // public async fetchChildrenIds() {
    //     return this.childrenIds = Object.keys(parseApiResponce(await fetch(`search/ticket?query=MemberOf=${this.id}`)));
    // }

    public async fetchHistory() {
        const ticketHistoryData = (await fetch(`ticket/${this.id}/history?format=l`)).split('\n--\n');

        this.processHistory([
            parseApiResponce(ticketHistoryData.shift() as string, 4),
            ...ticketHistoryData.map(d => parseApiResponce(d)),
        ]);
    }

    public getTicketWithTrimmedHistory(dateStart = new Date(0), dateEnd: Date) {
        const ticket = new Ticket(this.id);
        const trimmedHistory = [];
        let status = 'new';

        for (const e of this.history) {
            if (e.createdAt > dateStart && e.createdAt < dateEnd) {
                trimmedHistory.push(e);
            }

            if (e.Type === 'Status' && e.createdAt < dateEnd) {
                status = e.NewValue || '';
            }
        }

        Object.assign(ticket, this, {
            Status: status,
            firstStatus: status,
            history: [],
            historyTroubles: new Set(),
        });

        ticket.processHistory(trimmedHistory, dateEnd);

        return ticket;
    }

    private updateData(ticket: Ticket) {
        const estimated = Ticket.getEstimatedMinutes(ticket);
        const worked = Ticket.getWorkedMinutes(ticket);
        const left = estimated - worked;

        /* tslint:disable */
        Object.assign(this, {
            ...ticket,
            id: this.id,
            key: ticket.id,
            sprint: ticket[SPRINT_FIELD_NAME],
            title: (ticket.Subject.length > SUBJECT_TRESHOLD) ? (ticket.Subject.substring(0, SUBJECT_TRESHOLD) + '...') : ticket.Subject,
            hasBizValue: ticket[BIZ_VALUE_FIELD_NAME],
            createdAt: new Date(ticket.Created),
            lastUpdatedAt: new Date(ticket.LastUpdated),
            estimatedMinutes: estimated,
            workedMinutes: worked,
            leftMinutes: left,
            troubles: Ticket.getTroubles(ticket),
        });
        /* tslint:enable */
    }

    private processHistory(history: any[], upToDate = new Date()) {
        this.history = [];

        const statusesTimes: {[key: string]: any} = {};
        let lastTimeSeen = new Date(history.length ? history[0].Created : undefined);

        for (const e of history) {
            if (e.Field === 'TimeWorked') {
                const oldValue = parseInt((e.OldValue || '0').replace(' minutes', ''), 10);
                const newValue = parseInt((e.NewValue || '0').replace(' minutes', ''), 10);

                e.MinutesWorked = newValue - oldValue;
            }

            if (e.Type === 'Status') {
                const d = new Date(e.Created);

                this.firstStatus = this.firstStatus || e.OldValue;

                statusesTimes[e.OldValue] = statusesTimes[e.OldValue] || 0;
                statusesTimes[e.OldValue] = (statusesTimes[e.OldValue] + (d.getTime() - lastTimeSeen.getTime()));
                lastTimeSeen = d;

                if (e.NewValue === 'need_info' && statusesTimes.development)  {
                    this.historyTroubles.add(TROUBLES.POOR_RESEARCH);
                }
            }

            this.history.push(new HistoryEntry(e));
        }

        statusesTimes[this.Status] = statusesTimes[this.Status] || 0;
        statusesTimes[this.Status] = (statusesTimes[this.Status] + (upToDate.getTime()  - lastTimeSeen.getTime()));

        if (statusesTimes.need_info > (7 * 24 * 60 * 60 * 1000)) {
            this.historyTroubles.add(TROUBLES.LONG_NEED_INFO);
        }

        this.statusesTimes = statusesTimes;

        this.updateData(this);
    }
}

export const TROUBLES = {
    IN_SPRINT_WITHOUT_ESTIMATION: 'IN_SPRINT_WITHOUT_ESTIMATION',
    LONG_NEED_INFO: 'LONG_NEED_INFO',
    LONG_REVIEW: 'LONG_REVIEW',
    NO_ESTIMATION: 'NO_ESTIMATION',
    POOR_RESEARCH: 'POOR_RESEARCH',
    TOO_OLD: 'TOO_OLD',
    UNASSIGNED: 'UNASSIGNED',
    WRONG_ESTIMATION: 'WRONG_ESTIMATION',
};
