import React, { Component } from 'react';
import { Icon, Tooltip } from 'antd';
import COLORS from './colors';
import { TROUBLES } from './models/Ticket';

export default function troubleIconComponent(trouble) {
    const key = Math.random();

    switch (trouble) {
        case TROUBLES.NO_ESTIMATION:
        return (
            <Tooltip key={key} title="No estimation">
                <Icon type="close-circle" style={{color: COLORS.blue}} />&nbsp;
            </Tooltip>
        )
        break

        case TROUBLES.LONG_NEED_INFO:
        return (
            <Tooltip key={key} title="need_info > 7 d">
                <Icon type="info-circle" style={{color: COLORS.grey}} />&nbsp;
            </Tooltip>
        )
        break

        case TROUBLES.IN_SPRINT_WITHOUT_ESTIMATION:
        return (
            <Tooltip key={key} title="No estimation but in sprint">
                <Icon type="close-circle-o" style={{color: COLORS.blue}} />&nbsp;
            </Tooltip>
        )
        break

        case TROUBLES.WRONG_ESTIMATION:
        return (
            <Tooltip key={key} title="Out of time">
                <Icon type="clock-circle" style={{color: COLORS.red}} />&nbsp;
            </Tooltip>
        )
        break

        case TROUBLES.UNASSIGNED:
        return (
            <Tooltip key={key} title="Unassigned">
                <Icon type="question-circle-o" style={{color: COLORS.teal}} />&nbsp;
            </Tooltip>
        )
        break

        case TROUBLES.TOO_OLD:
        return (
            <Tooltip key={key} title="Too old">
                <Icon type="dislike" style={{color: COLORS.black}} />&nbsp;
            </Tooltip>
        )
        break

        case TROUBLES.LONG_REVIEW:
        return (
            <Tooltip key={key} title="Long code review">
                <Icon type="exclamation-circle" style={{color: COLORS.lightBlue}} />&nbsp;
            </Tooltip>
        )
        break

        case TROUBLES.POOR_RESEARCH:
        return (
            <Tooltip key={key} title="Need info after some development has happend">
                <Icon type="question-circle" style={{color: COLORS.purple}} />&nbsp;                
            </Tooltip>
        )
        break
    }
}
