import React, { Component } from 'react';
import COLORS from './colors';

export default function timeRender(ticket, toRenderFn) {
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
