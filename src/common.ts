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
