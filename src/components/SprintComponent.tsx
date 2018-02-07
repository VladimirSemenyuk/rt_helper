import * as React from 'react';
import { Table, Button, Select, InputNumber, Row, Col, Card } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as moment from 'moment';
import Ticket from '../models/Ticket';
import Dashboard from '../models/Dashboard';
import TicketIdComponent from './TicketIdComponent';
import statusComponent from './statusComponent';
import loeComponent from './loeComponent';
import troubleIconComponent from './troubleIconComponent';
import TimeComponent from './TimeComponent';
import Sprint from '../models/Sprint';
import loaderComponent from './loaderComponent';
import GlobalState from '../GlobalState';
import { COLORS, TSTATUS, getColumnConfig, TAGS_FIELD_NAME, TCreds } from '../common';
import { bind } from '../decorators';
import { SelectValue } from 'antd/lib/select';

const globalState = new GlobalState('SprintComponent');
const DONE_STATUSES = ['merged', 'deployed', 'staging', 'resolved', 'rejected', 'accepted'];

function getSprintId(mdt: moment.Moment) {
    return `${mdt.year()}-w${mdt.week()}`;
}

const sprints = [getSprintId(moment())];

for (let i = 0; i < 10; i++) {
    sprints.unshift(getSprintId(moment().subtract((1 + i), 'w')));
}

for (let i = 0; i < 3; i++) {
    sprints.push(getSprintId(moment().add((1 + i), 'w')));
}

let previouslyLoadedTickets: Ticket[] = [];

export default class SprintComponent extends React.Component<{dashboard: Dashboard}> {
    public state = {
        currentSprintId: getSprintId(moment()),
        loading: false,
        loadingStatus: {} as TSTATUS,
        queues: globalState.queues,
        tickets: previouslyLoadedTickets,
    };

    public componentDidMount() {
        this.load();
    }

    public render() {
        let content: any = '';
        const tickets = this.state.tickets.filter(t => {
            return  this.state.queues.length ? this.state.queues.indexOf(t.Queue) !== -1 : true;
        });

        if (this.state.loading && this.state.loadingStatus) {
            content = loaderComponent(this.state.loadingStatus);
        } else if (tickets.length) {
            const sprint = new Sprint(this.state.currentSprintId, tickets);
            const ticketsByStatuses: {[key: string]: Ticket[]} = {};
            const ticketsByTroubles: {[key: string]: Ticket[]} = {};
            const trimmedTicketsByTroubles: {[key: string]: Ticket[]} = {};

            const totalEstimatedMinutes = tickets.reduce((acc, t) => {
                return acc += t.estimatedMinutes;
            }, 0);

            for (const t of tickets) {
                ticketsByStatuses[t.Status] = ticketsByStatuses[t.Status] || [];
                ticketsByStatuses[t.Status].push(t);
            }

            const weekNum = parseInt(this.state.currentSprintId.split('-w')[1], 10);
            const date = moment().day('Monday').week(weekNum);

            tickets.map(t => {
                t.troubles.forEach((tr) => {
                    ticketsByTroubles[tr] = ticketsByTroubles[tr] || [];
                    ticketsByTroubles[tr].push(t);
                });

                return {
                    original: t,
                    trimmed: t.getTicketWithTrimmedHistory(
                        date.startOf('isoWeek').toDate(),
                        date.endOf('isoWeek').toDate(),
                    ),
                };
            }).forEach((o) => {
                o.trimmed.troubles.forEach((tr) => {
                    trimmedTicketsByTroubles[tr] = trimmedTicketsByTroubles[tr] || [];
                    trimmedTicketsByTroubles[tr].push(o.trimmed);
                });
            });

            const report = sprint.report;
            const columns = [
                {
                    ...getColumnConfig('original'),
                    render: (original: Ticket) => <TicketIdComponent ticket={original} />,
                    sorter: (a: Ticket, b: Ticket) => parseInt(a.id, 10) - parseInt(b.id, 10),
                    title: 'id',
                },
                {
                    dataIndex: 'tags',
                    title: 'tags',
                },
                {
                    ...getColumnConfig('title'),
                    title: 'Subject',
                },
                {
                    ...getColumnConfig('Owner', [...new Set(tickets.map(t => t.Owner))]),
                },
                {
                    ...getColumnConfig('estimatedMinutes'),
                    render: (left: any, ticket: Ticket) => <TimeComponent ticket={ticket}>
                            {loeComponent(ticket.workedMinutes)} / {loeComponent(ticket.estimatedMinutes)}
                        </TimeComponent>,
                    title: 'loe',
                },
                ...[...report.dates].map(m => {
                    const d = moment(m).format('MM.DD');
                    return {
                        dataIndex: d,
                        render: (ticket: Ticket) => statusComponent(ticket.Status),
                        title: d,
                    };
                })];

            const data = [...[...report.data.entries()].map((e) => {
                const res: any = {
                    Owner: e[0].Owner,
                    estimatedMinutes: e[0].estimatedMinutes,
                    key: e[0].id,
                    original: e[0],
                    tags: e[0][TAGS_FIELD_NAME],
                    title: e[0].title,
                    workedMinutes: e[0].workedMinutes,
                };

                const entries = e[1].entries();

                for (const [d, t] of entries) {
                    res[d.format('MM.DD')] = t.endOfDay;
                    res[d.format('MM.DD') + '_start'] = t.startOfDay;
                }

                return res;
            })];

            const ticketsDone = [];

            for (const t of tickets) {
                if (DONE_STATUSES.indexOf(t.Status) !== -1) {
                    ticketsDone.push(t);
                }
            }

            const ticketsDonePercents = tickets ? Math.round(ticketsDone.length / tickets.length * 100) : 0;

            const workingWeek = sprint.getWorkingWeek().map(m => m.format('MM.DD'));
            const chartData = workingWeek.map((d, index) => {
                return {
                    left: data.reduce((r, o) => {
                        let d2 = d;

                        if (!index) {
                            d2 = d2 + '_start';
                        }

                        if (o[d2]) {
                            return (r || 0) + o[d2].leftMinutes;
                        }

                        return r;
                    }, null),
                    name: d,
                };
            });

            content = <div>
                <Row>
                    <Col span={12}>
                        <Card title='Sprint Overview'>
                            <p>
                            <b>Tickets total:</b> {sprint.tickets.length}&nbsp;&nbsp;&nbsp;
                                {
                                    sprint.tickets.map(t => <span key={'sprint-ticket-all-' + t.id}>
                                        <TicketIdComponent ticket={t} />, </span>)
                                }
                            </p>
                            <div>
                                <b>Tickets by statuses:</b>
                                {
                                    Object.keys(ticketsByStatuses).map(status => {
                                        return (
                                            <div key={status}>
                                                {statusComponent(status)} {ticketsByStatuses[status].length}&nbsp;&nbsp;&nbsp;
                                                {
                                                    ticketsByStatuses[status].map(t => <span key={'sprint-ticket-by-status-' + t.id}>
                                                        <TicketIdComponent ticket={t} />, </span>)
                                                }
                                            </div>
                                        );
                                    })
                                }
                            </div>
                            <div>
                                <b>Completed:</b> {ticketsDonePercents}%
                            </div>
                        </Card>
                    </Col>

                    <Col span={4}>
                        <Card title='Troubles Occured'>
                            {
                                Object.keys(ticketsByTroubles).map(trouble => {
                                    return (
                                        <div key={trouble}>
                                            {troubleIconComponent(trouble)} {ticketsByTroubles[trouble].length}&nbsp;&nbsp;&nbsp;
                                            {
                                                ticketsByTroubles[trouble].map(t => <span key={'sprint-ticket-by-trouble-' + t.id}><TicketIdComponent ticket={t} />, </span>)
                                            }
                                        </div>
                                    );
                                })
                            }

                            {/* <td style={tableStyle}>
                                {
                                    Object.keys(trimmedTicketsByTroubles).map(trouble => {
                                        return (
                                            <div key={trouble}>
                                                {troubleIconComponent(trouble)} {trimmedTicketsByTroubles[trouble].length}&nbsp;&nbsp;&nbsp;
                                                {
                                                    trimmedTicketsByTroubles[trouble].map(t => <span key={'sprint-ticket-by-trouble-' + t.id}><TicketIdComponent ticket={t} />, </span>)
                                                }
                                            </div>
                                        )
                                    })
                                }
                            </td> */}
                        </Card>
                    </Col>

                    <Col span={8}>
                        <Card title='Burndown Chart'>
                            <ResponsiveContainer width='100%' height={300}>
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                    <CartesianGrid stroke='#ccc' />
                                    <YAxis />
                                    <XAxis dataKey='name' />
                                    <Line type='linear' name='Minutes left' dataKey='left' isAnimationActive={false} strokeWidth={2}  stroke={COLORS.red} />
                                    <Tooltip/>
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>

                </Row>
                <Table columns={columns} dataSource={data} pagination={false}/>
            </div>;
        }

        return (
            <div>
                <Row style={{padding: '8px 15px'}}>
                    <Col span={3}>
                        <Select style={{ width: 200 }} defaultValue={this.state.currentSprintId} onChange={this.selectSprint}>
                            {
                                sprints.sort().reverse().map((s) => <Select.Option value={s} key={'sprint-' + s}>{s}</Select.Option>)
                            }
                        </Select>
                    </Col>
                    <Col span={19}>
                        <Select
                            mode='tags'
                            placeholder='Queues'
                            onChange={this.changeQueues}
                            defaultValue={this.state.queues}
                            style={{minWidth: '300px'}}
                        >
                            { [...new Set(this.state.queues.concat(tickets.map(t => t.Queue)))].map(q => <Select.Option key={q}>{q}</Select.Option>) }
                        </Select>
                    </Col>
                    <Col span={2} style={{textAlign: 'right'}}>
                        {
                            this.state.loading && <Button onClick={this.load} disabled={this.state.loading} type='primary'>Load</Button>
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
        });

        this.props.dashboard.fetch({
            sprints: [this.state.currentSprintId],
            withHistory: true,
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
    }

    @bind
    private onChangeLoadingStatus(status: TSTATUS) {
        this.setState({
            loadingStatus: status,
        });
    }

    @bind
    private selectSprint(id: SelectValue) {
        this.setState({
            currentSprintId: id,
        }, this.load);
    }

    @bind
    private changeQueues(values: SelectValue) {
        globalState.queues = values as string[];

        globalState.sync();

        this.setState({
            queues: globalState.queues,
        });
    }
}
