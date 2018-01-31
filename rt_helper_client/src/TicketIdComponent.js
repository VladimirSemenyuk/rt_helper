import React, { Component } from 'react';
import {Modal} from 'antd';
import TicketComponent from './TicketComponent';

export default class TicketIdComponent extends Component {
    constructor(...args) {
        super(...args);

        this.__openTicket = this.__openTicket.bind(this);
    }
    
    render() {
        return (
            <a key={this.props.ticket.id} onClick={this.__openTicket}>{this.props.ticket.id}</a>
        );
    }

    __openTicket(e) {
        e.preventDefault();

        Modal.info({
            title: `${this.props.ticket.id} — ${this.props.ticket.Subject}`,
            content: <TicketComponent ticket={this.props.ticket} />,
            width: '80%'
        });
    }
}
