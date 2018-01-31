const CONFIG = require('./config');
const fetch = require('./fetch');
const { parseApiResponce } = require('./utils');
const os = require('os');
const cluster = require('cluster');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    const express = require('express')
    const app = express();

    //const ttl = 60 * 15;

    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        //res.header('Cache-Control', 'max-age=' + ttl);
        
        next();
    });

    //const cache = new Map();

    function fetchTicket(id) {
        // if (cache.has(id)) {
        //     const o = cache.get(id);
        //     const r = Promise.resolve(o.data)

        //     if ((Date.now() - o.time) > (ttl * 1000)) {
        //         cache.delete(id);

        //         __fetchTicket(id);
        //     }

        //     return r;
        // }

        return __fetchTicket(id);
    }

    function __fetchTicket(id) {
        return Promise.all([
            fetch(`ticket/${id}`).then((data) => {
                const parsed = parseApiResponce(data);
        
                return parsed;
            }),
            fetch(`ticket/${id}/history?format=l`).then((data) => {
                data = data.split('\n--\n');
                const parsed = [parseApiResponce(data.shift(), 4), ...data.map(d => parseApiResponce(d))];
        
                return parsed;
            })
        ]).then((data) => {
            const r = {
                ...data[0],
                history: data[1]
            };

            // cache.set(id, {
            //     data: r,
            //     time: Date.now()
            // });
            return r;
        });
    }

    app.get('/ticket/:id', (req, res) => {
        fetchTicket(req.params.id).then((data) => {
            res.send(data);
        });
        
    });

    app.get('/user/:id/tickets', (req, res) => {
        let url = `search/ticket?query=Owner='${req.params.id}'`;

        if (!req.query.all) {
            url += ` AND (Status != 'resolved' AND Status != 'rejected' AND Status != 'closed')`;
        }

        if (req.query.from) {
            url += ` AND LastUpdated > '${req.query.from}'`;
        }

        //console.log(req.params.id);
        return fetch(url)
        //return fetch(`search/ticket?query=Owner='${req.params.id}' AND ((Status != 'resolved' AND Status != 'rejected' AND Status != 'closed') OR LastUpdated > '2018-01-22')`)
        //return fetch(`search/ticket?query=Owner='${req.params.id}' AND Status != 'resolved' AND Status != 'rejected' AND Status != 'closed'`)
            .then((d) => {
                return parseApiResponce(d);
            })
            .then((data) => {
                res.send(data);
            });
    });

    app.get('/sprint/:id/tickets', (req, res) => {
        let url = `search/ticket?query='CF.{Sprint}'='${req.params.id}'`;
        return fetch(url)
            .then((d) => {
                return parseApiResponce(d);
            })
            .then((data) => {
                res.send(data);
            });
    });

    function fetchQueue(id, fromDate, all) {
        let url = `search/ticket?query=Queue='${id}'`;

        if (!all) {
            url += ` AND (Status != 'resolved' AND Status != 'rejected' AND Status != 'closed')`;
        }

        if (fromDate) {
            url += ` AND LastUpdated > '${fromDate}'`;
        }
        
        return fetch(url).then((data) => {
        //return fetch(`search/ticket?query=Queue='${id}' AND ((Status != 'resolved' AND Status != 'rejected' AND Status != 'closed') OR LastUpdated > '2018-01-22')`).then((data) => {
        //return fetch(`search/ticket?query=Queue='${id}' AND Status != 'resolved' AND Status != 'rejected' AND Status != 'closed'`).then((data) => {
            return parseApiResponce(data);
        });
    }


    app.get('/queue/:id', (req, res) => {
        fetchQueue(req.params.id, req.query.from, req.query.all).then((data) => {
            res.send(Object.keys(data).sort().map((key) => {
                return {
                    id: key, Subject: data[key]
                }
            }));
        });
    });

    app.listen(8000, () => console.log('Example app listening on port 8000!'));
}

