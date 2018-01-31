import React, { Component } from 'react';
import { Timeline, Tag, Divider, Card, Icon, Radio } from 'antd';
import statusComponent from './statusComponent';
import loeComponent from './loeComponent';
import troublesComponent from './troublesComponent';
import lifetimeComponent from './lifetimeComponent';
import COLORS from './colors';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const CONTENT_STYLE = {
    maxHeight: '300px',
    overflow: 'scroll'
};

export default class TicketComponent extends Component {
    constructor() {
        super();

        this.state = {
            historyMode: HISTORY_MODES.ALL
        };

        this.__selectHistoryModel = this.__selectHistoryModel.bind(this);
    }

    render() {
        const ticket = this.props.ticket;
        const history = ticket.history;        
        const rtLink = `https://www.iponweb.net/rt/Ticket/Display.html?id=${ticket.id}`;
        
        return (
            <div>
                <a href={rtLink} target="_blank">{rtLink}</a>
                <Divider />
                <table style={{width: '100%'}}>
                    <tbody>
                        <tr>
                            <td style={{verticalAlign: 'top'}}>
                                <h3>Summary:</h3>
                                <div>Queue: <Tag>{ticket.Queue}</Tag></div>
                                <div>Status: {statusComponent(ticket.Status)}</div>
                                <div>Owner: <b>{ticket.Owner}</b></div>
                                <div>Time: {loeComponent(ticket.TimeWorked)} / {loeComponent(ticket.TimeEstimated)}  <i>({ticket.TimeWorked} / {ticket.TimeEstimated})</i></div>
                                <div>Life Time: {lifetimeComponent(ticket.lifeTime)}</div>
                                {troublesComponent(ticket.troubles)}
                            </td>
                            <td style={{verticalAlign: 'top'}}>
                                <h3>Statuses Lifetimes:</h3>
                                {
                                    Object.keys(ticket.statusesTimes).map((s) => {                                            
                                        return (
                                            <div key={s}>
                                                {statusComponent(s)} {lifetimeComponent(ticket.statusesTimes[s])}
                                            </div>
                                        )
                                    })
                                }
                            </td>
                        </tr>
                    </tbody>
                </table>
                

                <Divider />
                <h3>History:</h3>
                <div style={{marginBottom: 20}}>
                    <RadioGroup defaultValue={HISTORY_MODES.ALL} size="small" onChange={this.__selectHistoryModel}>
                        <RadioButton value={HISTORY_MODES.ALL}>All</RadioButton>
                        <RadioButton value={HISTORY_MODES.STATUS}>Status</RadioButton>
                        <RadioButton value={HISTORY_MODES.TIME}>Time Worked</RadioButton>
                        <RadioButton value={HISTORY_MODES.COMMENTS}>Comments</RadioButton>
                    </RadioGroup>
                </div>
                
                <Timeline>
                    {
                        history.filter((e) => {
                            switch (this.state.historyMode) {
                                case HISTORY_MODES.COMMENTS:
                                    return e.Type === 'Comment' || e.Type === 'Create'
                                    break;

                                case HISTORY_MODES.STATUS:
                                    return e.Type === 'Status'
                                    break;

                                case HISTORY_MODES.TIME:
                                    return e.Field === 'TimeWorked'
                                    break;
                            
                                default:
                                    return true
                                    break;
                            }
                        }).map(this.__getHistoryItem)
                    }
                </Timeline>
                
            </div>
        );
    }

    __selectHistoryModel(e) {
        this.setState({
            historyMode: e.target.value
        });
    }

    __getHistoryItem(entry) {
        let color;
        let body;
        let title = entry.Type;


        switch (entry.Type) {
            case 'Create':
                color = COLORS.green;
                body = <Card style={CONTENT_STYLE}><pre>{entry.Content}</pre></Card>
                break;

            case 'Comment':
                color = COLORS.blue;
                body = <Card style={CONTENT_STYLE}><pre>{entry.Content}</pre></Card>
                break;
            
                case 'Correspond':
                color = COLORS.blue;
                body = <Card style={CONTENT_STYLE}><pre>{entry.Content}</pre></Card>
                break;

            case 'Status':
                color = COLORS.green;
                body = (<div>
                    {statusComponent(entry.OldValue)} -> {statusComponent(entry.NewValue)}
                </div>);
                break;

            case 'Set':
                switch (entry.Field) {
                    case 'TimeWorked':
                        title = 'Time Worked';
                        color = COLORS.red;
                        body = <div><Icon type="clock-circle" /> {entry.minutesWorked} minutes ({entry.NewValue} total)</div>
                        break;
                    default:
                        title = 'Set ' + entry.Field;
                        color = COLORS.grey;
                        body = entry.NewValue
                }
                break;
        
            default:
                color = COLORS.blue;
                body = entry.Description;
                break;
        }

        return (
            <Timeline.Item key={`e-${entry.id}`} color={color}>
                <div><Tag>{title}</Tag> by <b>{entry.Creator}</b></div>
                <div><i>{entry.Created}</i></div>
                {body}
            </Timeline.Item>
        );
    }

    
}

const HISTORY_MODES = {
    ALL: 'ALL',
    TIME: 'TIME',
    COMMENTS: 'COMMENTS',
    STATUS: 'STATUS'
}
