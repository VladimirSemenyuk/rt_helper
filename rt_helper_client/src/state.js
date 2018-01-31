const NAME = 'rt_helper';

class State {
    constructor() {
        const data = JSON.parse(window.localStorage.getItem(NAME));

        Object.assign(this, {
            queues: [
                'bsw-msoa-dev',
                'bsw-reporting-dev',
                'bsw-bm-dev'
            ],
            owners: [
                'abardukov',
                'ademidyuk',
                'ashokhin',
                //'dnasikanov',
                'dorlyakov',
                //'isukhov',
                'mshogin',
                'mtaipov',
                'nmakeev',
                'olontsov',
                'pgoltsev',
                'spapilin',
                //'vsemenyuk',
                'vpiskarev',
                'ybochkarev'
            ],
            allStatuses: false,
            fromDate: '2018-01-01'
        }, data);

        this.sync();
    }

    sync() {
        window.localStorage.setItem(NAME, JSON.stringify(this));
    }
}

export default new State();
