import * as moment from 'moment';
import Ticket from './Ticket';

export default class Sprint {
    public id: string;

    public tickets: Ticket[];

    constructor(id: string, tickets: Ticket[]) {
        this.id = id;
        this.tickets = tickets;
    }

    get report() {
        const report = {
            data: new Map(),
            dates: new Set(),
        };

        const weekNum = parseInt(this.id.split('-w')[1], 10);
        const startDay = moment().day('Monday').week(weekNum).startOf('day');
        let endDay = moment().day('Friday').week(weekNum).endOf('day');
        const currentDayEnd = moment(); // moment().isoWeekday((new Date()).getDay()).endOf('day');

        if (endDay > currentDayEnd) {
            endDay = currentDayEnd;
        }

        for (const t of this.tickets) {
            let date = startDay.clone();
            const m = new Map();

            while (date < endDay) {
                report.dates.add(date.toDate().getTime());
                m.set(date.clone(), {
                    endOfDay: t.getTicketWithTrimmedHistory(undefined, date.clone().endOf('day').toDate()),
                    startOfDay: t.getTicketWithTrimmedHistory(undefined, date.clone().startOf('day').toDate()),
                });
                date.add(1, 'days');
            }

            report.data.set(t, m);
        }

        return report;
    }

    public getWorkingWeek() {
        const weekNum = parseInt(this.id.split('-w')[1], 10);
        const startDay = moment().day('Monday').week(weekNum).startOf('day');
        const endDay = moment().day('Friday').week(weekNum).endOf('day');
        let date = startDay.clone();

        const res = [];

        while (date < endDay) {
            res.push(date);
            date = date.clone();
            date.add(1, 'days');
        }

        return res;
    }
}
