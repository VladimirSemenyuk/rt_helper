const CONFIG = require('./config');
const Queue = require('./Queue');

module.exports = class Dashboard {
    constructor() {
        this.__queues = CONFIG.QUEUES.map(q => new Queue(q));
    }

    async fetch() {
        return Promise.all(this.__queues.map(q => q.fetchOpenedTickets()));
    }
}
