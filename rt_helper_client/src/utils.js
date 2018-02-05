//const REGEXP = /(*.!(: ))(: )(.*)/;
import CONFIG from './config';

export function parseApiResponce(text, rowsToSlice = 2) {
    const result = {};

    for (const record of text.split('\n').slice(rowsToSlice)) {
        if (record) {
            //const data = record.match(REGEXP);
            const data = record.split(': ');

            if (data) {
                result[data[0]] = data[1];
            }
        }
    }

    return result;
}

export function calculateLifeTime(ms) {
    var d, h, m, s;

    s = Math.floor(ms / 1000);

    d = Math.floor(s / 60 / 60 / 24);

    s = s - (d * 60 * 60 * 24);

    h = Math.floor(s / 60 / 60);

    s = s - (h * 60 * 60);

    m = Math.floor(s / 60);

    s = s - (m * 60);

    return { d:d, h: h, m: m, s: s };
};

export async function fetch(url, init = {}) {
    init.headers = {
        ...init.headers || {},
    }

    init.mode = 'cors';

    return await (await window.fetch(`${CONFIG.API_URL}${url}`, init)).json();
};

export function getWeek(date) {
    if (!(date instanceof Date)) date = new Date();
  
    // ISO week date weeks start on Monday, so correct the day number
    var nDay = (date.getDay() + 6) % 7;
  
    // ISO 8601 states that week 1 is the week with the first Thursday of that year
    // Set the target date to the Thursday in the target week
    date.setDate(date.getDate() - nDay + 3);
  
    // Store the millisecond value of the target date
    var n1stThursday = date.valueOf();
  
    // Set the target to the first Thursday of the year
    // First, set the target to January 1st
    date.setMonth(0, 1);
  
    // Not a Thursday? Correct the date to the next Thursday
    if (date.getDay() !== 4) {
      date.setMonth(0, 1 + ((4 - date.getDay()) + 7) % 7);
    }
  
    // The week number is the number of weeks between the first Thursday of the year
    // and the Thursday in the target week (604800000 = 7 * 24 * 3600 * 1000)
    return 1 + Math.ceil((n1stThursday - date) / 604800000);
}

