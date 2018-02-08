import * as React from 'react';
import { Timeline, Tag, Divider, Card, Icon, Radio } from 'antd';
import Ticket from '../models/Ticket';
import HistoryEntry from '../models/HistoryEntry';
import statusComponent from './statusComponent';
import loeComponent from './loeComponent';
import troublesComponent from './troublesComponent';
import lifetimeComponent from './lifetimeComponent';
import { COLORS } from '../common';
import { bind } from '../decorators';
import { shell } from 'electron';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const CONTENT_STYLE: React.CSSProperties = {
    maxHeight: '300px',
    overflow: 'auto',
};

const HISTORY_MODES = {
    ALL: 'ALL',
    COMMENTS: 'COMMENTS',
    STATUS: 'STATUS',
    TIME: 'TIME',
};

export default class TicketComponent extends React.Component<{ticket: Ticket}> {
    public state = {
        historyMode: HISTORY_MODES.ALL,
        loading: true,
    };

    constructor(p: {ticket: Ticket}, c: any) {
        super(p, c);

        this.props.ticket.fetchHistory().then(() => {
            this.setState({
                loading: false,
            });
        });
    }

    public render() {
        const ticket = this.props.ticket;
        const history = ticket.history;
        const rtLink = `https://www.iponweb.net/rt/Ticket/Display.html?id=${ticket.id}`;
        const timeWorked = parseInt(ticket.TimeWorked, 10);
        const timeEstimated = parseInt(ticket.TimeEstimated, 10);

        return (
            <Card loading={this.state.loading} bordered={false} style={{padding: 0}} >
                <a href={rtLink} target='_blank' onClick={this.openLink} >{rtLink}</a>
                <Divider />
                <table style={{width: '100%'}}>
                    <tbody>
                        <tr>
                            <td style={{verticalAlign: 'top'}}>
                                <h3>Summary:</h3>
                                <div>Queue: <Tag>{ticket.Queue}</Tag></div>
                                <div>Status: {statusComponent(ticket.Status)}</div>
                                <div>Owner: <b>{ticket.Owner}</b></div>
                                <div>Time: {loeComponent(timeWorked)} / {loeComponent(timeEstimated)}
                                    <i>({ticket.TimeWorked} / {ticket.TimeEstimated})</i>
                                </div>
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
                                        );
                                    })
                                }
                            </td>
                        </tr>
                    </tbody>
                </table>

                <Divider />
                <h3>History:</h3>
                <div style={{marginBottom: 20}}>
                    <RadioGroup defaultValue={HISTORY_MODES.ALL} size='small' onChange={this.selectHistoryMode}>
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
                                    return e.Type === 'Comment' || e.Type === 'Create';

                                case HISTORY_MODES.STATUS:
                                    return e.Type === 'Status';

                                case HISTORY_MODES.TIME:
                                    return e.Field === 'TimeWorked';

                                default:
                                    return true;
                            }
                        }).map(this.getHistoryItem)
                    }
                </Timeline>
            </Card>
        );
    }

    @bind
    private openLink(e: React.MouseEvent<HTMLAnchorElement>) {
        e.preventDefault();

        shell.openExternal((e.target as any).href);
    }

    @bind
    private selectHistoryMode(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            historyMode: e.target.value,
        });
    }

    private  getHistoryItem(entry: HistoryEntry) {
        let color;
        let body;
        let title = entry.Type;

        switch (entry.Type) {
            case 'Create':
                color = COLORS.green;
                body = <Card style={CONTENT_STYLE}><pre>{entry.Content}</pre></Card>;
                break;

            case 'Comment':
                color = COLORS.blue;
                body = <Card style={CONTENT_STYLE}><pre>{entry.Content}</pre></Card>;
                break;

                case 'Correspond':
                color = COLORS.blue;
                body = <Card style={CONTENT_STYLE}><pre>{entry.Content}</pre></Card>;
                break;

            case 'Status':
                color = COLORS.green;
                body = (<div>
                    {statusComponent(entry.OldValue || '')} -> {statusComponent(entry.NewValue || '')}
                </div>);
                break;

            case 'Set':
                switch (entry.Field) {
                    case 'TimeWorked':
                        title = 'Time Worked';
                        color = COLORS.red;
                        body = <div>
                                 {entry.MinutesWorked} minutes ({entry.NewValue} total)
                            </div>;
                        break;
                    default:
                        title = 'Set ' + entry.Field;
                        color = COLORS.grey;
                        body = entry.NewValue || '';
                }
                break;

            default:
                color = COLORS.blue;
                body = entry.Description;
                break;
        }

        return (
            <Timeline.Item key={`e-${entry.id}`} color={color} dot={(entry.Field === 'TimeWorked') ? <Icon type='clock-circle-o' style={{color}} /> : undefined}>
                <div><Tag>{title}</Tag> by <b>{entry.Creator}</b></div>
                <div><i>{entry.Created}</i></div>
                {body}
            </Timeline.Item>
        );
    }
}
