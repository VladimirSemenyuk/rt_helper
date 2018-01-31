import moment from 'moment';

export default class Sprint {
    constructor(id, tickets) {
        this.id = id;
        this.__tickets = tickets;
    }

    get report() {
        const report = {
            dates: new Set(),
            data: new Map()
        };
        const weekNum = parseInt(this.id.split('-w')[1], 10);
        const startDay = moment().day("Monday").week(weekNum).startOf('day');
        let endDay = moment().day("Friday").week(weekNum).endOf('day');
        const currentDayEnd = moment().isoWeekday( (new Date()).getDay() ).endOf('day');

        if (endDay > currentDayEnd) {
            endDay = currentDayEnd;
        }

        for (const t of this.__tickets) {
            let date = startDay.clone();

            let m = new Map();

            while (date < endDay) {
                report.dates.add(date.toDate().getTime());
                m.set(date.clone(), {
                    startOfDay: t.getTicketWithTrimmedHistory(null, date.clone().startOf('day').toDate()),
                    endOfDay: t.getTicketWithTrimmedHistory(null, date.clone().endOf('day').toDate())
                });
                date.add(1, 'days');
            }

            report.data.set(t, m);
        }    

        return report;
    }

    getWorkingWeek() {
        const weekNum = parseInt(this.id.split('-w')[1], 10);
        const startDay = moment().day("Monday").week(weekNum).startOf('day');
        let endDay = moment().day("Friday").week(weekNum).endOf('day');
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