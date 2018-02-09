
import * as React from 'react';
import * as moment from 'moment';
import { Table, Tag, Tooltip, Progress, Select, Button, Row, Col, Checkbox, DatePicker, Spin } from 'antd';
import { COLORS, SPRINT_FIELD_NAME, TAGS_FIELD_NAME, BIZ_VALUE_FIELD_NAME, TSTATUS, getColumnConfig, TCreds, knownQueuesWith } from '../common';
import Dashboard from '../models/Dashboard';
import Ticket, {TROUBLES} from '../models/Ticket';
import TicketIdComponent from './TicketIdComponent';
import TimeComponent from './TimeComponent';
import statusComponent from './statusComponent';
import loeComponent from './loeComponent';
import troublesComponent from './troublesComponent';
import lifetimeComponent from './lifetimeComponent';
import loaderComponent from './loaderComponent';
import GlobalState from '../GlobalState';
import { bind } from '../decorators';
import { SelectValue } from 'antd/lib/select';

const troublesFilters = Object.keys(TROUBLES).map((t) => {
    return {
        text: t,
        value: t,
    };
});

let previouslyLoadedTickets: Ticket[] = [];

const globaleState = new GlobalState<{
    allStatuses: boolean;
    fromDate: string;
    owners: string[];
    queues: string[];
}>('TicketsTableComponent');

export default class TicketsTableComponent extends React.Component<{dashboard: Dashboard}> {
    public state = {
        allStatuses: globaleState.get('allStatuses'),
        fromDate: globaleState.get('fromDate'),
        loading: false,
        loadingStatus: {},
        owners: globaleState.get('owners'),
        queues: globaleState.get('queues'),
        tickets: previouslyLoadedTickets,
    };

    public render() {
        let content: any = '';

        if (this.state.loading) {
            content = loaderComponent(this.state.loadingStatus || {});
        } else {
            const map: {[key: string]: number} = {};
            const allTickets = [...this.state.tickets];
            const ticketIdsToShow = [];

            let ticket = allTickets.shift();

            while (ticket) {
                for (const c of ticket.children || []) {
                    allTickets.push(c);
                }

                map[ticket.id] = map[ticket.id] || 0;

                map[ticket.id]++;

                ticket = allTickets.shift();
            }

            const tickets = this.state.tickets.filter((t) => map[t.id] === 1);
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

            content = <Table onChange={this.onTableChange} pagination={false} size='small' columns={[
                {
                    dataIndex: 'id',
                    render: (id: string, t: Ticket) => <TicketIdComponent ticket={t} />,
                    sorter: (a: Ticket, b: Ticket) => parseInt(a.id, 10) - parseInt(b.id, 10),
                    title: 'id',
                },
                {
                    ...getColumnConfig('title'),
                    title: 'Subject',
                },
                {
                    ...getColumnConfig('Queue', queues),
                    render: (q: string) => {
                        let tmp = knownQueuesWith.find((item) => item.name === q);

                        tmp = tmp || {
                            color: COLORS.blue,
                            name: 'undef',
                        };

                        return <Tag color={tmp.color}>{q}</Tag>;
                    },
                },
                {
                    ...getColumnConfig('Status', statuses),
                    render: statusComponent,
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
                    onFilter: (value, t: Ticket) => (Boolean(t.hasBizValue)).toString() === value,
                    title: 'Biz. Value',
                },
                {
                    ...getColumnConfig('Owner', owners),
                    render: o => <b>{o}</b>,
                },
                {
                    ...getColumnConfig('estimatedMinutes'),
                    render: (left, t: Ticket) => <TimeComponent ticket={t}>
                            {loeComponent(t.workedMinutes)} / {loeComponent(t.estimatedMinutes)}
                        </TimeComponent>,
                    title: 'loe',
                },
                {
                    ...getColumnConfig('sprint', sprints),
                    dataIndex: 'sprint',
                    title: 'Sprint',
                },
                {
                    dataIndex: TAGS_FIELD_NAME,
                    title: 'tags',
                },
                {
                    dataIndex: 'lifeTime',
                    render: lifetimeComponent,
                    title: 'Life Time',
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
                            {/* { [...new Set(this.state.queues.concat(globaleState.get('queues')))].map(q =>
                                <Select.Option key={q}>{q}</Select.Option>) } */}

                            {
                                knownQueuesWith.map((item) => <Select.Option key={item.name}>{item.name}</Select.Option>)
                            }
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
                            { [...new Set(this.state.owners.concat(globaleState.get('owners')))].map(owner =>
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
                text: 'Loading',
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
        globaleState.set('owners', values as string[]);

        this.setState({
            ...this.state,
            owners: globaleState.get('owners'),
        });
    }

    @bind
    private changeQueues(values: SelectValue) {
        globaleState.set('queues', values as string[]);

        this.setState({
            ...this.state,
            queues: globaleState.get('queues'),
        });
    }

    @bind
    private changeAllStatuses(e: React.ChangeEvent<HTMLInputElement>) {
        globaleState.set('allStatuses', e.target.checked);

        this.setState({
            ...this.state,
            allStatuses: globaleState.get('allStatuses'),
        });
    }

    @bind
    private changeFromDate(date: moment.Moment, dateStr: string) {
        globaleState.set('fromDate', dateStr);

        this.setState({
            ...this.state,
            fromDate: globaleState.get('fromDate'),
        });
    }

    @bind
    private onChangeLoadingStatus(status: TSTATUS) {
        this.setState({
            ...this.state,
            loadingStatus: status,
        });
    }

    @bind
    private onTableChange(pagination: any, filters: any, sorter: any) {
        const filtered = this.state.tickets.filter((t: any) => {
            let res = true;

            for (const f of Object.keys(filters)) {
                if (filters[f].indexOf(t[f]) === -1) {
                    res = false;
                }
            }

            return res;
        });

        // console.log(filtered.map(t => {
        //     return `${t.Queue} — ${t.id} — ${t.Subject}: ${t.statusesTimes.merged}`;
        // }).join(',\n'));
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
