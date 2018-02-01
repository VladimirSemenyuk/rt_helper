import { fetch } from '../utils';
import Ticket from './Ticket';
import { debug } from 'util';

export default class Dashboard {
    constructor() {
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

    async fetch(args) {
        this.__setLoadingStatus({
            text: 'Fetching Queues...'
        });

        const {queues, owners, sprints, from, allStatuses} = {
            queues: [],
            owners: [],
            sprints: [],
            from: null,
            allStatuses: false,
            ...args
        };
        const queuesWithTickets = await this.__fetchQueuesTickets(queues, allStatuses, from);

        this.__setLoadingStatus({
            text: 'Fetching Users...'
        });

        const usersTickets = await this.__fetchUsersTickets(owners, allStatuses, from);
        const ticketsInSprints = await Promise.all(sprints.map(s => fetch(`sprint/${s}/tickets`)));

        const ticketsTofetchIds = new Set([
            ...queuesWithTickets.reduce((arr, q) => arr.concat(q), []).map(t => t.id), 
            ...usersTickets.reduce((arr, i) => arr.concat(Object.keys(i)), []),
            ...ticketsInSprints.reduce((arr, i) => arr.concat(Object.keys(i)), [])
        ]);

        ticketsTofetchIds.forEach((t) => {
            this.__tickets[t] = this.__tickets[t] || new Ticket(t);
        });

        await this.__fetchTickets([...ticketsTofetchIds]);

        this.__setLoadingStatus('Loaded');

        return [...ticketsTofetchIds].map(t => this.__tickets[t])
    }

    async __fetchUsersTickets(users, allStatuses, from) {
        return Promise.all(users.map((t) => {
            let url = `user/${t}/tickets?`;

            if (allStatuses) {
                url += 'all=true&';
            }

            if (from) {
                url += `from=${from}&`;
            }

            return fetch(url);
        }));
    }

    async __fetchQueuesTickets(queues, allStatuses, from) {
        return Promise.all(queues.map((q) => {
            let url = `queue/${q}?`;

            if (allStatuses) {
                url += 'all=true&';
            }

            if (from) {
                url += `from=${from}&`;
            }

            return fetch(url);
        }));
    }

    async __fetchTickets(ids) {
        let ticketsFetchedCounter = 0;

        this.__setLoadingStatus({
            text: `Fetching Tickets...`,
            done: ticketsFetchedCounter,
            total: ids.length
        });

        return Promise.all(ids.map(t => {
            const p = this.__tickets[t].fetch();

            p.then(() => {
                ticketsFetchedCounter++;
                this.__setLoadingStatus({
                    text: `Fetching Tickets...`,
                    done: ticketsFetchedCounter,
                    total: ids.length
                });
            });

            return p;
        }))
    }

    __setLoadingStatus(status) {
        this.loadingStatus = status;

        this.__onChangeLoadingStatusCallbacks.forEach(cb => cb(status));
    }
}
