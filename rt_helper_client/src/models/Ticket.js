import { parseApiResponce, fetch, calculateLifeTime } from '../utils';
import HistoryEntry from './HistoryEntry'

const SUBJECT_TRESHOLD = 70;

export default class Ticket {
    constructor(id, name) {
        this.id = id;
        this.history = [];
        this.__historyTroubles = new Set();
    }

    get key() {
        return this.id;
    }

    get sprint() {
        return this['CF.{Sprint}'] || ''
    }

    get title() {
        if (this.Subject.length > SUBJECT_TRESHOLD) {
            return this.Subject.substring(0, SUBJECT_TRESHOLD) + '...';
        }

        return this.Subject;
    }

    get hasBizValue() {
        return !!this['CF.{biz_value}'];
    }

    get createdAt() {
        return new Date(this.Created);
    }

    get lastUpdatedAt() {
        return new Date(this.LastUpdated);
    }

    get estimatedMinutes() {
        return this.history.reduce((r, e) => {
            if (e.Field === 'TimeEstimated') {
                return e.NewValue ? parseInt(e.NewValue.replace(' minutes', ''), 10) : 0
            }
            return r;
        }, parseInt(this.TimeEstimated.replace(' minutes', ''), 10));
    }

    get workedMinutes() {
        return this.history.reduce((r, e) => {
            if (e.Field === 'TimeWorked') {
                return parseInt((e.NewValue || '0').replace(' minutes', ''), 10);
            }
            return r;
        }, 0);
    }

    get leftMinutes() {
        return this.estimatedMinutes - this.workedMinutes;
    }

    get troubles() {
        const troubles = [...this.__historyTroubles];

        if (['New', 'Backlog'].indexOf(this.Status) === -1 && !this.estimatedMinutes) {
            troubles.push(TROUBLES.NO_ESTIMATION);
        }

        if (this.sprint && !this.estimatedMinutes) {
            troubles.push(TROUBLES.IN_SPRINT_WITHOUT_ESTIMATION);
        }
        
        if (this.estimatedMinutes && this.leftMinutes < 0) {
            troubles.push(TROUBLES.WRONG_ESTIMATION);
        }

        if (this.Owner === 'Nobody') {
            troubles.push(TROUBLES.UNASSIGNED);
        }

        if (this.lifeTime > (1000 * 60 * 60 * 24 * 92)) { // 92 days
            troubles.push(TROUBLES.TOO_OLD);
        }

        if (this.statusesTimes['code_review'] > (1000 * 60 * 60 * 24 * 3)) { // 3 days
            troubles.push(TROUBLES.LONG_REVIEW);
        }

        return troubles;
    }

    get lifeTime() {
        if (this.status === 'deployed' || this.status === 'closed') {
            return this.lastUpdatedAt - this.createdAt;
        } else {
            return Date.now() - this.createdAt;
        }
    }

    async fetch() {
        const data = await fetch(`ticket/${this.id}`);
        const history = data.history;

        delete data.id;
        delete data.history;

        Object.assign(this, data);

        this.__processHistory(history);
    }

    __processHistory(history, upToDate = new Date()) {
        const statusesTimes = {};
        let lastTimeSeen = new Date(history.length ? history[0].Created : undefined);

        for (const e of history) {
            if (e.Field === 'TimeWorked') {
                const oldValue = parseInt((e.OldValue || '0').replace(' minutes', ''), 10);
                const newValue = parseInt((e.NewValue || '0').replace(' minutes', ''), 10);

                e.minutesWorked = newValue - oldValue;
            }

            if (e.Type === 'Status') {
                const d = new Date(e.Created);

                this.firstStatus = this.firstStatus || e.OldValue;

                statusesTimes[e.OldValue] = statusesTimes[e.OldValue] || 0;
                statusesTimes[e.OldValue] = (statusesTimes[e.OldValue] + (d - lastTimeSeen));
                lastTimeSeen = d;

                if (e.NewValue === 'need_info' && statusesTimes['development'])  {
                    this.__historyTroubles.add(TROUBLES.POOR_RESEARCH);
                }
            }

            this.history.push(new HistoryEntry(e));
        }

        statusesTimes[this.Status] = statusesTimes[this.Status] || 0;
        statusesTimes[this.Status] = (statusesTimes[this.Status] + (upToDate - lastTimeSeen));

        if (statusesTimes.need_info > (7 * 24 * 60 * 60 * 1000)) {
            this.__historyTroubles.add(TROUBLES.LONG_NEED_INFO);
        }

        this.statusesTimes = statusesTimes;
    }

    getTicketWithTrimmedHistory(dateStart = new Date(0), dateEnd) {
        const ticket = new Ticket(this.id, this.Subject);
        const trimmedHistory = [];
        let status = 'new';

        for (let i = 0; i < this.history.length; i++) {
            const e = this.history[i];

            if (e.createdAt > dateStart && e.createdAt < dateEnd) {
                trimmedHistory.push(e);
            }

            if (e.Type === 'Status' && e.createdAt < dateEnd) {
                status = e.NewValue;
            }
        }

        Object.assign(ticket, this, {
            history: [],
            __historyTroubles: new Set(),
            firstStatus: status,
            Status: status
        });

        ticket.__processHistory(trimmedHistory, dateEnd);

        return ticket;
    }
}

export const TROUBLES = {
    IN_SPRINT_WITHOUT_ESTIMATION: 'IN_SPRINT_WITHOUT_ESTIMATION',
    WRONG_ESTIMATION: 'WRONG_ESTIMATION',
    UNASSIGNED: 'UNASSIGNED',
    TOO_OLD: 'TOO_OLD',
    POOR_RESEARCH: 'POOR_RESEARCH',
    LONG_REVIEW: 'LONG_REVIEW',
    LONG_NEED_INFO: 'LONG_NEED_INFO',
    NO_ESTIMATION: 'NO_ESTIMATION'
}
