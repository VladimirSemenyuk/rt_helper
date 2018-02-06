import * as React from 'react';
import { COLORS } from '../common';
import Ticket from '../models/Ticket';

export default function timeRender(ticket: Ticket, toRenderFn: any) {
    let color = COLORS.blue;
    const d = ticket.workedMinutes / ticket.estimatedMinutes

    if (d > 1.25) {
        color = COLORS.red;
    } else if (d > 1) {
        color = COLORS.black;
    }

    return (
        <span style={{color: color}}>
            {toRenderFn(ticket)}
        </span>
    );
}