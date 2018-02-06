import credentials from './credentials';

const REGEXP = /^([^:]+): (.+)$/;
const SYMBOL = '<f--s!s--f>';

export function parseApiResponce<T extends object>(text: string, rowsToSlice = 2): T {
    const result: T = {} as T;

    text = text.replace(/\n( +)/gi, SYMBOL);

    for (const record of text.split('\n').slice(rowsToSlice)) {
        if (record) {
            const data = record.match(REGEXP);

            if (data) {
                if (typeof data[2] === 'string') {
                    data[2] = data[2].replace(new RegExp(SYMBOL, 'gi'), '\n');
                }
                (result as any)[data[1]] = data[2];
            }
        }
    }

    return result;
}

export async function fetchData(url: string, init: any = {headers: Object}) {
    init.headers = {
        ...init.headers || {},
        Authorization: 'Basic ' + Buffer.from(`${credentials.login}:${credentials.password}`).toString('base64'),
    };

    const res = await fetch(`https://www.iponweb.net/rt/REST/1.0/${url}`, init);

    if (res.status >= 400) {
        throw new Error(res.statusText);
    }

    return res.text();
}

export function calculateLifeTime(ms: number) {
    let d;
    let h;
    let m;
    let s;

    s = Math.floor(ms / 1000);

    d = Math.floor(s / 60 / 60 / 24);

    s = s - (d * 60 * 60 * 24);

    h = Math.floor(s / 60 / 60);

    s = s - (h * 60 * 60);

    m = Math.floor(s / 60);

    s = s - (m * 60);

    return { d, h, m, s };
};
