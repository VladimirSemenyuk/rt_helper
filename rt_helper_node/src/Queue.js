const fetch = require('./fetch');
const Ticket = require('./Ticket');
const { parseApiResponce } = require('./utils');


module.exports = class Queue {
    constructor(id) {
        this.id = id;
        this.tickets = [];
        this.length = 0;
    }

    async fetchOpenedTickets() {
        const data = parseApiResponce(await fetch(`search/ticket?query=Queue='${this.id}' AND Status != 'resolved' AND Status != 'rejected'`));
        //const data = parseApiResponce(await fetch(`search/ticket?query=Queue='${this.id}'`));

        for (var id of Object.keys(data)) {
            this.tickets.push(new Ticket(id, data[id]));
        }

        await Promise.all(this.tickets.map(ticket => ticket.fetch()));
        
        this.tickets.map((ticket) => {
            //console.log(ticket.id, ticket.status, ticket.lifeTime);
           // console.log(ticket.id, ticket.statusesTimes);
        });

        this.length = this.tickets.length;

        return this.tickets;
    }
}
