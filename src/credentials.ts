// import * as keytar from 'keytar';
import * as os from 'os';
import * as CryptoJS from 'crypto-js';
import GlobalState from './GlobalState';
import { TCreds } from './common';

const globaleState = new GlobalState<{
    login: string;
    password: string;
}>('Credentials');

const SERVICE_NAME = 'rt_helper';
const KEY = os.hostname() + '_salt_' + os.userInfo().uid;

class Credentials {
    private l: string = globaleState.get('login') || '';
    private p: string = '';

    get login() {
        return this.l;
    }

    set login(value: string) {
        globaleState.set('login', value);

        this.l = value;
    }

    get password() {
        return this.p;
    }

    set password(value: string) {
        const encrypted = CryptoJS.AES.encrypt(value, KEY);

        globaleState.set('password', encrypted.toString());

        this.p = value;
    }

    constructor() {
        const password = globaleState.get('password');

        if (password) {
            this.p = CryptoJS.AES.decrypt(password, KEY).toString(CryptoJS.enc.Utf8);
        } else {
            this.p = '';
        }
    }
}

export default new Credentials();
