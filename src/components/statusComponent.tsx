import * as React from 'react';
import { Tag } from 'antd';
import { COLORS } from '../common';

export default function statusComponent(status: string) {
    let color;

    switch (status) {
        case 'deployed':
            color = COLORS.green;
            break;

        case 'merged':
            color = COLORS.teal;
            break;

        case 'code_review':
            color = COLORS.lightBlue;
            break;

        case 'development':
            color = COLORS.red;
            break;

        case 'need_info':
            color = COLORS.purple;
            break;

        case 'backlog':
            color = COLORS.grey;
            break;

        case 'closed':
            color = COLORS.black;
            break;

        case 'staging':
            color = COLORS.silver;
            break;

        case 'rejected':
            color = COLORS.black;
            break;

        case 'resolved':
            color = COLORS.green;
            break;

        default:
            color = COLORS.blue;
            break;
    }

    return <Tag color={color}>{status}</Tag>;
}
