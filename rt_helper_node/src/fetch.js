const fetchFn = require('node-fetch');
const CONFIG = require('./config');

const GENERAL_HEADERS = {
    Authorization: 'Basic ' + Buffer.from(`${CONFIG.RT_USER}:${CONFIG.RT_PASSWORD}`).toString('base64')
};

//const cache = new Map();

module.exports = async function fetch(url, init = {}) {
    //console.log(url);
    init.headers = {
        ...init.headers || {},
        ...GENERAL_HEADERS
    }

    try {
        url = `${CONFIG.API_URL}/${url}`;

        return await (await fetchFn(url, init)).text();
        
        // if (!cache.has(url)) {
        //     cache.set(url, await (await fetchFn(url, init)).text());
        // }

        // return cache.get(url);
    } catch(e) {
        console.error(e);
    }
};
