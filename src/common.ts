import Ticket from './models/Ticket';

export const SPRINT_FIELD_NAME = 'CF.{Sprint}';
export const BIZ_VALUE_FIELD_NAME = 'CF.{biz_value}';
export const TAGS_FIELD_NAME = 'CF.{Tags}';

export type TSTATUS = {
    done?: number,
    text?: string,
    total?: number,
};

export type TCreds = {
    login: string;
    password: string;
};

export const COLORS = {
    black: '#101010',
    blue: '#108ee9',
    green: '#87d068',
    grey: '#808080',
    lightBlue: '#2db7f5',
    purple: '#800080',
    red: '#f50',
    silver: '#C0C0C0',
    teal: '#008080',
};

export function getColumnConfig<T>(fieldName: keyof T, filters?: string[]) {
    const res: any = {
        dataIndex: fieldName,
        sorter: (t1: T, t2: T) => {
            if (t1[fieldName] < t2[fieldName]) {
                return -1;
            }
            if (t1[fieldName] > t2[fieldName]) {
                return 1;
            }
            return 0;
        },
        title: fieldName,
    };

    if (filters && filters.length) {
        res.onFilter = (value: string, o: T) => {
            return o[fieldName] === value as any;
        };

        res.filters = filters.map(q => {
            return {
                text: q,
                value: q,
            };
        });
    }

    return res;
}

export const knownQueuesWith = [
    {name: 'bsw-msoa-dev', color: COLORS.purple},
    {name: 'bsw-reporting-dev', color: COLORS.blue},
    {name: 'bsw-bm-dev', color: COLORS.green},
    {name: 'bsw-lua-dev', color: COLORS.grey},
    {name: 'bsw-frontend-dev', color: COLORS.lightBlue},
    {name: 'bsw-imp_anomaly-dev', color: COLORS.black},
    {name: 'bsw-ui-qa', color: COLORS.red},
    {name: 'bsw-rnd', color: COLORS.silver},
    {name: 'bidswitch-support', color: COLORS.teal},
    {name: 'bsw-clients-issues', color: COLORS.black},
    {name: 'bsw-sysops', color: COLORS.blue},
    {name: 'bidswitch-feedback', color: COLORS.green},
    {name: 'bsw-alerts', color: COLORS.grey},
    {name: 'bsw-biz', color: COLORS.lightBlue},
    {name: 'bsw-cm', color: COLORS.purple},
    {name: 'bsw-devops', color: COLORS.red},
    {name: 'bsw-discrepancy', color: COLORS.silver},
    {name: 'bsw-docs', color: COLORS.teal},
    {name: 'bsw-incidents', color: COLORS.black},
    {name: 'bsw-jp', color: COLORS.blue},
];
