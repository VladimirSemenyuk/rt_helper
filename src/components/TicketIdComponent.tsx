import * as React from 'react';
import { Modal } from 'antd';
import Ticket from '../models/Ticket';
import TicketComponent from './TicketComponent';
import { bind } from '../decorators';

export default class TicketIdComponent extends React.Component<{ticket: Ticket}> {
    public render() {
        return (
            <a key={this.props.ticket.id} onClick={this.openTicket}>{this.props.ticket.id}</a>
        );
    }

    @bind
    private openTicket(e: React.MouseEvent<HTMLAnchorElement>) {
        e.preventDefault();

        Modal.info({
            content: <TicketComponent ticket={this.props.ticket} />,
            title: `${this.props.ticket.id} — ${this.props.ticket.Subject}`,
            width: '80%',
        });
    }
}
