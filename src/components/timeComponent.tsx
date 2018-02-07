import * as React from 'react';
import { COLORS } from '../common';
import Ticket from '../models/Ticket';

export default class TimeRenderComponent extends React.Component<{ticket: Ticket}> {
    public render() {
        let color = COLORS.blue;
        const d = this.props.ticket.workedMinutes / this.props.ticket.estimatedMinutes;

        if (d > 1.25) {
            color = COLORS.red;
        } else if (d > 1) {
            color = COLORS.black;
        }

        return (
            <span style={{color}}>
                {this.props.children}
            </span>
        );
    }
}
