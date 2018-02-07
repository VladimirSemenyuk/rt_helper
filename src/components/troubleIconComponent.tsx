import * as React from 'react';
import { Icon, Tooltip } from 'antd';
import { COLORS } from '../common';
import { TROUBLES } from '../models/Ticket';

export default function troubleIconComponent(trouble: string) {
    const key = Math.random();

    switch (trouble) {
        case TROUBLES.POOR_RESEARCH:
        return (
            <Tooltip key={key} title='Poor research'>
                <Icon type='warning' style={{color: COLORS.purple}} />&nbsp;
            </Tooltip>
        );

        case TROUBLES.NO_ESTIMATION:
        return (
            <Tooltip key={key} title='No estimation'>
                <Icon type='close-circle' style={{color: COLORS.blue}} />&nbsp;
            </Tooltip>
        );

        case TROUBLES.LONG_REVIEW:
        return (
            <Tooltip key={key} title='Long review'>
                <Icon type='question-circle-o' style={{color: COLORS.lightBlue}} />&nbsp;
            </Tooltip>
        );

        case TROUBLES.LONG_NEED_INFO:
        return (
            <Tooltip key={key} title='need_info > 7 d'>
                <Icon type='info-circle' style={{color: COLORS.grey}} />&nbsp;
            </Tooltip>
        );

        case TROUBLES.IN_SPRINT_WITHOUT_ESTIMATION:
        return (
            <Tooltip key={key} title='No estimation but in sprint'>
                <Icon type='close-circle-o' style={{color: COLORS.blue}} />&nbsp;
            </Tooltip>
        );

        case TROUBLES.WRONG_ESTIMATION:
        return (
            <Tooltip key={key} title='Out of time'>
                <Icon type='clock-circle' style={{color: COLORS.red}} />&nbsp;
            </Tooltip>
        );

        case TROUBLES.UNASSIGNED:
        return (
            <Tooltip key={key} title='Unassigned'>
                <Icon type='frown' style={{color: COLORS.teal}} />&nbsp;
            </Tooltip>
        );

        case TROUBLES.TOO_OLD:
        return (
            <Tooltip key={key} title='Too old'>
                <Icon type='dislike' style={{color: COLORS.black}} />&nbsp;
            </Tooltip>
        );
    }
}
