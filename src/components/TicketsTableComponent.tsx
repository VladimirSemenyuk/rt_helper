
import * as React from 'react';
import * as moment from 'moment';
import { Table, Tag, Tooltip, Progress, Select, Button, Row, Col, Checkbox, DatePicker, Spin } from 'antd';
import { COLORS, SPRINT_FIELD_NAME, TAGS_FIELD_NAME, BIZ_VALUE_FIELD_NAME, TSTATUS, getColumnConfig } from '../common';
import Dashboard from '../models/Dashboard';
import Ticket, {TROUBLES} from '../models/Ticket';
import TicketIdComponent from './TicketIdComponent';
import timeComponent from './timeComponent';
import statusComponent from './statusComponent';
import loeComponent from './loeComponent';
import troublesComponent from './troublesComponent';
import lifetimeComponent from './lifetimeComponent';
import loaderComponent from './loaderComponent';
import GlobalState from '../GlobalState';
import { bind } from '../decorators';
import { TCreds } from '../common';
import { SelectValue } from 'antd/lib/select';

const troublesFilters = Object.keys(TROUBLES).map((t) => {
    return {
        text: t,
        value: t,
    };
});

let previouslyLoadedTickets: Ticket[] = [];

const globaleState = new GlobalState('TicketsTableComponent');

export default class TicketsTableComponent extends React.Component<{dashboard: Dashboard}> {
    public state = {
        allStatuses: globaleState.allStatuses,
        fromDate: globaleState.fromDate,
        loading: false,
        loadingStatus: {},
        owners: globaleState.owners,
        queues: globaleState.queues,
        tickets: previouslyLoadedTickets,
    };

    public render() {
        let content: any = '';

        if (this.state.loading) {
            content = loaderComponent(this.state.loadingStatus || {});
        } else {
            const tickets = this.state.tickets;
            const statuses = [...new Set(tickets.map(t => t.Status))];
            const owners = [...new Set(tickets.map(t => t.Owner))];
            const queues = [...new Set(tickets.map(t => t.Queue))];
            const sprints = [...new Set(tickets.map(t => t[SPRINT_FIELD_NAME]))];

            const sprintsFilters = sprints.map((s) => {
                return {
                    text: s,
                    value: s,
                };
            });

            content = <Table pagination={false} size='small' columns={[
                {
                    dataIndex: 'id',
                    render: (id: string, ticket: Ticket) => <TicketIdComponent ticket={ticket} />,
                    sorter: (a: Ticket, b: Ticket) => parseInt(a.id, 10) - parseInt(b.id, 10),
                    title: 'id',
                },
                {
                    dataIndex: TAGS_FIELD_NAME,
                    title: 'tags',
                },
                {
                    ...getColumnConfig('title'),
                    title: 'Subject',
                    //render: (title: string, ticket: Ticket) => <span title={ticket.Subject}>{title}</span>,
                },
                {
                    ...getColumnConfig('Status', statuses),
                    render: statusComponent,
                },
                {
                    ...getColumnConfig('Queue', queues),
                    render: q => <Tag>{q}</Tag>,
                },
                {
                    ...getColumnConfig('Owner', owners),
                    render: o => <b>{o}</b>,
                },
                {
                    ...getColumnConfig('Priority'),
                    render: o => <b>{o}</b>,
                },
                {
                    ...getColumnConfig(BIZ_VALUE_FIELD_NAME),
                    filters: [
                        {
                            text: 'With Biz Value',
                            value: true,
                        },
                        {
                            text: 'Without Biz Value',
                            value: false,
                        },
                    ],
                    onFilter: (value, ticket: Ticket) => (Boolean(ticket.hasBizValue)).toString() === value,
                    title: 'Biz. Value',
                },
                {
                    ...getColumnConfig('sprint', sprints),
                    dataIndex: 'sprint',
                    title: 'Sprint',
                },
                {
                    dataIndex: 'lifeTime',
                    render: lifetimeComponent,
                    title: 'Life Time',
                },
                {
                    ...getColumnConfig('estimatedMinutes'),
                    render: (left, ticket: Ticket) => {
                        return timeComponent(ticket, (t: Ticket) => <span>
                            {loeComponent(t.workedMinutes)} / {loeComponent(t.estimatedMinutes)}
                        </span>);
                    },
                    title: 'loe',
                },
                // {
                //     ...getColumnConfig('leftMinutes'),
                //     render: (left, ticket: Ticket) => {
                //         return timeRender(ticket, t => <span>
                //             {t.workedMinutes} / {t.estimatedMinutes}
                //         </span>);
                //     },
                //     title: 'Time',
                // },
                // {
                //     ...getColumnConfig('troubles', [...Object.keys(TROUBLES)]),
                //     render: troublesComponent,
                //     title: 'Troubles',
                // },
            ]} dataSource={tickets} />;
        }

        return (
            <div>
                <Row style={{padding: '8px 15px'}}>
                    <Col span={6}>
                        <Select
                            mode='tags'
                            placeholder='Queues'
                            onChange={this.changeQueues}
                            defaultValue={this.state.queues}
                            style={{minWidth: '300px'}}
                        >
                            { [...new Set(this.state.queues.concat(globaleState.queues))].map(q =>
                                <Select.Option key={q}>{q}</Select.Option>) }
                        </Select>
                    </Col>
                    <Col span={11}>
                        <Select
                            mode='tags'
                            placeholder='Owners'
                            onChange={this.changeOwners}
                            defaultValue={this.state.owners}
                            style={{minWidth: '300px'}}
                        >
                            { [...new Set(this.state.owners.concat(globaleState.owners))].map(owner =>
                                <Select.Option key={owner}>{owner}</Select.Option>) }
                        </Select>
                    </Col>
                    <Col span={3}>
                        <Checkbox
                            onChange={this.changeAllStatuses}
                            defaultChecked={this.state.allStatuses}>Resolved, Rejected and Closed
                        </Checkbox>
                    </Col>
                    <Col span={2}>
                        <DatePicker
                            placeholder='Last Updated'
                            onChange={this.changeFromDate}
                            defaultValue={this.state.fromDate ? moment(this.state.fromDate, 'YYYY-MM-DD') : undefined}
                        />
                    </Col>
                    <Col span={2} style={{textAlign: 'right'}}>
                        {
                            this.state.loading &&
                                <Button onClick={this.load} disabled={this.state.loading} type='primary'>Load</Button>
                        }

                        {
                            !this.state.loading && <Button onClick={this.load} type='primary'>Load</Button>
                        }
                    </Col>
                </Row>
                {content}
            </div>
        );
    }

    @bind
    private load() {
        this.setState({
            loading: true,
            loadingStatus: {
                text: 'Loading'
            },
        }, () => {
            this.props.dashboard.fetch({
                allStatuses: this.state.allStatuses,
                from: this.state.fromDate,
                owners: this.state.owners,
                queues: this.state.queues,
            }).then((tickets) => {
                this.setState({
                    loading: false,
                    loadingStatus: this.props.dashboard.loadingStatus,
                    tickets,
                });
    
                previouslyLoadedTickets = tickets;
    
                this.props.dashboard.offChangeLoadingStatus(this.onChangeLoadingStatus);
            });
    
            this.props.dashboard.onChangeLoadingStatus(this.onChangeLoadingStatus);
        });
    }

    @bind
    private changeOwners(values: SelectValue) {
        globaleState.owners = values as string[];

        globaleState.sync();

        this.setState({
            ...this.state,
            owners: globaleState.owners,
        });
    }

    @bind
    private changeQueues(values: SelectValue) {
        globaleState.queues = values as string[];

        globaleState.sync();

        this.setState({
            ...this.state,
            queues: globaleState.queues,
        });
    }

    @bind
    private changeAllStatuses(e: React.ChangeEvent<HTMLInputElement>) {
        globaleState.allStatuses = e.target.checked;

        globaleState.sync();

        this.setState({
            ...this.state,
            allStatuses: globaleState.allStatuses,
        });
    }

    @bind
    private changeFromDate(date: moment.Moment, dateStr: string) {
        globaleState.fromDate = dateStr;

        globaleState.sync();

        this.setState({
            ...this.state,
            fromDate: globaleState.fromDate,
        });
    }

    @bind
    private onChangeLoadingStatus(status: TSTATUS) {
        this.setState({
            ...this.state,
            loadingStatus: status,
        });
    }
}

function timeRender(ticket: Ticket, toRenderFn: (t: Ticket) => JSX.Element) {
    let color = COLORS.blue;
    const d = ticket.workedMinutes / ticket.estimatedMinutes;

    if (d > 1.25) {
        color = COLORS.red;
    } else if (d > 1) {
        color = COLORS.black;
    }

    return (
        <span style={{color}}>
            {toRenderFn(ticket)}
        </span>
    );
}
