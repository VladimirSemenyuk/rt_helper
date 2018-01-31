import { parseApiResponce, fetch } from '../utils';
import CONFIG from '../config';
import Ticket from './Ticket';
import { getWeek } from '../utils';

export default class Dashboard {
    get allQueues() {
        const queues = new Set();

        this.allTickets.forEach(t => {
            queues.add(t.Queue);
        });

        return [...queues];
    }

    get allOwners() {
        const owners = new Set();

        this.allTickets.forEach(t => {
            owners.add(t.Owner);
        });

        const res = [...owners];

        res.sort((o1, o2) => {
            if (o1 === 'Nobody') {
                return -1
            } else if (o2 === 'Nobody') {
                return 1
            }

            if (o1 < o2) {
                return -1;
            } else if (o1 > o2) {
                return 1;
            }

            return 0;
        });

        return res.filter((o) => {
            return o;
        });
    }

    constructor() {
        //this.__queues = args.queues || [],//CONFIG.QUEUES.map(q => new Queue(q));
        //this.__owners = args.owners || [],//CONFIG.QUEUES.map(q => new Queue(q));
        //this.__from = args.from,
        //this.__all = args.all,
        this.__tickets = {};
        this.loadingStatus = {};
        this.__onChangeLoadingStatusCallbacks = new Set();
    }

    onChangeLoadingStatus(fn) {
        this.__onChangeLoadingStatusCallbacks.add(fn);
    }

    offChangeLoadingStatus(fn) {
        this.__onChangeLoadingStatusCallbacks.delete(fn);
    }

    __setLoadingStatus(status) {
        this.loadingStatus = status;

        this.__onChangeLoadingStatusCallbacks.forEach(cb => cb(status));
    }


    async fetch(args) {
        const {queues, owners, sprints, from, allStatuses} = {
            queues: [],
            owners: [],
            sprints: [],
            from: null,
            allStatuses: false,
            ...args
        };
        this.__setLoadingStatus({
            text: 'Fetching Queues...'
        });
        const queuesWithTickets = await Promise.all(queues.map(q => fetch(`queue/${q}`)));

        this.__setLoadingStatus({
            text: 'Fetching Users...'
        });
        const users = await Promise.all(owners.map((t) => {
            let url = `user/${t}/tickets?`;

            if (allStatuses) {
                url += 'all=true&';
            }

            if (from) {
                url += `from=${from}&`;
            }

            return fetch(url);
        }));

        const ticketsInSprints = await Promise.all(sprints.map(s => fetch(`sprint/${s}/tickets`)));

        const ticketsTofetchIds = new Set();
        let ticketsFetchedCounter = 0;

        for (var q of queuesWithTickets) {
            q.forEach((t) => {
                ticketsTofetchIds.add(t.id);
            });
        }

        for (var u of users) {
            Object.keys(u).forEach((t) => ticketsTofetchIds.add(t));
        }

        for (var s of ticketsInSprints) {
            Object.keys(s).forEach((t) => ticketsTofetchIds.add(t));
        }

        this.__setLoadingStatus({
            text: `Fetching Tickets...`,
            done: ticketsFetchedCounter,
            total: ticketsTofetchIds.size
        });

        ticketsTofetchIds.forEach((t) => {
            this.__tickets[t] = this.__tickets[t] || new Ticket(t);
        });

        this.allTickets = Object.values(this.__tickets);

        await Promise.all([...ticketsTofetchIds].map(t => {
            const p = this.__tickets[t].fetch();

            p.then(() => {
                ticketsFetchedCounter++;
                this.__setLoadingStatus({
                    text: `Fetching Tickets...`,
                    done: ticketsFetchedCounter,
                    total: ticketsTofetchIds.size
                });
            });

            return p;
        }));

        this.__setLoadingStatus('Loaded');

        // const sprints = new Set();

        // this.allTickets.forEach(t => {
        //     sprints.add(t.sprint);
        // });

        // const d = new Date();
        // const year = (d).getFullYear();
        // const currentWeek = getWeek(d);

        // for (let i = 0; i < 4; i++) {
        //     sprints.add(`${year}-w${currentWeek + i}`);
        // }

        //const sp = [...sprints];

        //sp.sort();

        //this.allSprints = sp;

        return [...ticketsTofetchIds].map(t => this.__tickets[t])
    }
}
