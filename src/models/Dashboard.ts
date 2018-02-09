import { fetchData as fetch, parseApiResponce } from '../utils';
import Ticket from './Ticket';
import { SPRINT_FIELD_NAME, TSTATUS, TCreds } from '../common';

export default class Dashboard {
    public loadingStatus: TSTATUS = {};
    private readonly tickets: {[key: string]: Ticket} = {};
    private readonly onChangeLoadingStatusCallbacks = new Set();

    public onChangeLoadingStatus(fn: (status: any) => void) {
        this.onChangeLoadingStatusCallbacks.add(fn);
    }

    public offChangeLoadingStatus(fn: (status: any) => void) {
        this.onChangeLoadingStatusCallbacks.delete(fn);
    }

    public async fetch(args: TFecthArgs) {
        this.setLoadingStatus({
            text: 'Fetching Queues...',
        });

        const {queues, owners, sprints, from, allStatuses, withHistory} = {
            allStatuses: true,
            // from: null,
            owners: [] as string[],
            queues: [] as string[],
            sprints: [] as string[],
            withHistory: false,
            ...args,
        };

        this.setLoadingStatus({
            text: 'Fetching Tickets Lists...',
        });

        const ticketsToFetch = await this.getAllTicketToFetch([...new Set([
            ...await this.fetchTicketsListWithQuery('Owner', owners, allStatuses, from),
            ...await this.fetchTicketsListWithQuery('Queue', queues, allStatuses, from),
            ...await this.fetchTicketsListWithQuery(SPRINT_FIELD_NAME, sprints, allStatuses, from),
        ])]);

        const ticketsTofetchIds = ticketsToFetch.ids;
        const map = ticketsToFetch.map;

        ticketsTofetchIds.forEach((id) => {
            this.tickets[id] = this.tickets[id] || new Ticket(id);
        });

        await this.fetchTickets(ticketsTofetchIds, withHistory);

        ticketsTofetchIds.forEach((id) => {
            this.tickets[id].children = (map[id] && map[id].length) ? map[id].map(i => this.tickets[i]) : undefined;
        });

        this.setLoadingStatus({
            text: 'Loaded',
        });

        return ticketsTofetchIds.map(t => this.tickets[t]);
    }

    private async getAllTicketToFetch(ids: string[]) {
        const idsSet = new Set(ids);
        let count = 0;
        const map: {[key: string]: string[]} = {};

        while (count !== idsSet.size) {
            count = idsSet.size;

            const promises = [];

            for (const id of [...idsSet]) {
                const p = fetch(`search/ticket?query=MemberOf=${id}`).then((resp) => {
                    const data = Object.keys(parseApiResponce(resp));

                    map[id] = data;

                    return data;
                });

                promises.push(p);
            }

            (await Promise.all(promises)).forEach((is: string[]) => {
                is.forEach(id => idsSet.add(id));
            });
        }

        return {
            ids: [...idsSet],
            map,
        };
    }

    private async fetchTicketsListWithQuery(field: string, fieldValues: string[], allStatuses = false, from?: string) {
        if (!fieldValues.length) {
            return [];
        }

        let url = `search/ticket?query=(${fieldValues.map(v => `'${field}'='${v}'`).join(' OR ')})`;

        if (!allStatuses) {
            url += ` AND (Status != 'resolved' AND Status != 'rejected' AND Status != 'closed')`;
        }

        if (from) {
            url += ` AND LastUpdated > '${from}'`;
        }

        return Object.keys(parseApiResponce(await fetch(url)));
    }

    private async fetchTickets(ids: string[], withHistory: boolean) {
        let ticketsFetchedCounter = 0;

        this.setLoadingStatus({
            done: ticketsFetchedCounter,
            text: `Fetching Tickets...`,
            total: ids.length,
        });

        return Promise.all(ids.map(t => {
            let p = this.tickets[t].fetch();

            if (withHistory) {
                p = p.then(() => {
                    return this.tickets[t].fetchHistory();
                });
            }

            p.then(() => {
                ticketsFetchedCounter++;
                this.setLoadingStatus({
                    done: ticketsFetchedCounter,
                    text: `Fetching Tickets...`,
                    total: ids.length,
                });
            });

            return p;
        }));
    }

    private setLoadingStatus(status: TSTATUS) {
        this.loadingStatus = status;

        this.onChangeLoadingStatusCallbacks.forEach(cb => cb(status));
    }
}

type TFecthArgs = {
    allStatuses?: boolean,
    from?: string,
    owners?: string[],
    queues?: string[],
    sprints?: string[],
    withHistory?: boolean,
};
