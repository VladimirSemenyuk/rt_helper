import React, { Component } from 'react';
import { Table, Button, Select, InputNumber, Row, Col, } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import TicketIdComponent from './TicketIdComponent';
import statusComponent from './statusComponent';
import troubleIconComponent from './troubleIconComponent';
import Sprint from './models/Sprint';
import CONFIG from './config';
import timeComponent from './timeComponent';
import loaderComponent from './loaderComponent';
import loeComponent from './loeComponent';
import state from './state';
import colors from './colors';

const DONE_STATUSES = ['merged', 'deployed', 'staging', 'resolved', 'rejected', 'accepted'];

function getSprintId(mdt) {
    return `${mdt.year()}-w${mdt.week()}`;
}

const sprints = [getSprintId(moment())];

for (let i = 0; i < 10; i++) {
    sprints.unshift(getSprintId(moment().subtract((1 + i), 'w')));
}

for (let i = 0; i < 3; i++) {
    sprints.push(getSprintId(moment().add((1 + i), 'w')));
}

let previouslyLoadedTickets = [];

export default class SprintComponent extends Component {
    constructor(...args) {
        super(...args);

        this.state = {
            tickets: previouslyLoadedTickets,
            currentSprintId: getSprintId(moment()),
            loading: false,
            loadingStatus: '',
            queues: state.queues,
        };

        this.__selectSprint = this.__selectSprint.bind(this);
        this.__onChangeLoadingStatus = this.__onChangeLoadingStatus.bind(this);
        this.__changeQueues = this.__changeQueues.bind(this);
        this.__load = this.__load.bind(this);
    }

    componentDidMount() {
        this.__load();
    }

    render() {
        let content = '';
        const tickets = this.state.tickets.filter(t => {
            return this.state.queues.indexOf(t.Queue) !== -1;
        });

        if (this.state.loading && this.state.loadingStatus) {
            content = loaderComponent(this.state.loadingStatus)
        } else if (tickets.length) {
            const sprint = new Sprint(this.state.currentSprintId, tickets);
            const ticketsByStatuses = {};
            const ticketsByTroubles = {};
            const trimmedTicketsByTroubles = {};

            const totalEstimatedMinutes = tickets.reduce((acc, t) => {
                return acc += t.estimatedMinutes
            }, 0);
    
            for (const t of tickets) {
                ticketsByStatuses[t.Status] = ticketsByStatuses[t.Status] || [];
                ticketsByStatuses[t.Status].push(t);
            }
    
            const weekNum = parseInt(this.state.currentSprintId.split('-w')[1], 10);
            const date = moment().day("Monday").week(weekNum);

            tickets.map(t => {
                t.troubles.forEach((tr) => {
                    ticketsByTroubles[tr] = ticketsByTroubles[tr] || [];
                    ticketsByTroubles[tr].push(t); 
                });
                
                return {
                    original: t,
                    trimmed: t.getTicketWithTrimmedHistory(date.startOf('isoWeek').toDate(), date.endOf('isoWeek').toDate())
                }
            }).forEach((o) => {
                o.trimmed.troubles.forEach((tr) => {
                    trimmedTicketsByTroubles[tr] = trimmedTicketsByTroubles[tr] || [];
                    trimmedTicketsByTroubles[tr].push(o.trimmed); 
                });
            });
    
            const rs = (ticket) => statusComponent(ticket.Status);
            const report = sprint.report;
            const columns = [
                {
                    title: 'id',
                    dataIndex: 'original',
                    sorter: (a, b) => a.id - b.id,
                    render: (original) => <TicketIdComponent ticket={original} />
                },
                {
                    title: 'tags',
                    dataIndex: 'CF.{Tags}'
                },
                {
                    title: 'Subject',
                    dataIndex: 'title',
                    sorter: (t1, t2) => {
                        if (t1.Subject < t2.Subject)
                            return -1
                        if (t1.Subject > t2.Subject)
                            return 1
                        return 0
                    }
                },
                {
                    title: 'Owner',
                    dataIndex: 'Owner',
                    sorter: (t1, t2) => {
                        if (t1.Owner < t2.Owner)
                            return -1
                        if (t1.Owner > t2.Owner)
                            return 1
                        return 0
                    }
                },
                {
                    title: 'loe',
                    dataIndex: 'estimatedMinutes',
                    render: (left, o) => {
                        return timeComponent(o.original, ticket => <span>{loeComponent(ticket.workedMinutes)} / {loeComponent(ticket.estimatedMinutes)}</span>);
                    },
                    sorter: (t1, t2) => {
                        if (t1.workedMinutes < t2.workedMinutes)
                            return -1
                        if (t1.workedMinutes > t2.workedMinutes)
                            return 1
                        return 0
                    }
                },
                ...[...report.dates].map(m => {
                    const d = moment(m).format('MM.DD');
                    
                    return {
                        title: d,
                        dataIndex: d,
                        render: rs
                    };
                })];
    
            const data = [...[...report.data.entries()].map((e) => {
                const res = {
                    key: e[0].id,
                    original: e[0],
                    title: e[0].title,
                    Owner: e[0].Owner
                };

                const entries = e[1].entries();
    
                for (const [d, t] of entries) {
                    res[d.format('MM.DD')] = t.endOfDay
                    res[d.format('MM.DD') + '_start'] = t.startOfDay
                }
    
                return res;
            })];
    
            const ticketsDone = [];
    
            for (const t of tickets) {
                if (DONE_STATUSES.indexOf(t.Status) !== -1) {
                    ticketsDone.push(t);
                }
            }
    
            let ticketsDonePercents = tickets ? Math.round(ticketsDone.length / tickets.length * 100 ) : 0;

            const workingWeek = sprint.getWorkingWeek().map(m => m.format('MM.DD'));
            const chartData = workingWeek.map((d, index) => {
                return {
                    name: d,
                    left: data.reduce((r, o) => {
                        let d2 = d;

                        if (!index) {
                            d2 = d2 + '_start';
                        }

                        if (o[d2]) {
                            return (r || 0) + o[d2].leftMinutes;
                        }

                        return r;
                    }, null)
                };
            });

            content = <div>
                <Row>
                    <Col span={12}>
                        <h3>Sprint Overview</h3>
                    </Col>

                    <Col span={4}>
                        <h3>Troubles Occured</h3>
                        {/* <h3>Troubles Occured in Sprint</h3> */}
                    </Col>

                    <Col span={8}>
                        <h3>Burndown Chart</h3>
                    </Col>
                </Row>

                <Row>
                    <Col span={12}>
                        <div>
                        <b>Tickets total:</b> {sprint.__tickets.length}&nbsp;&nbsp;&nbsp;
                            {
                                sprint.__tickets.map(t => <span key={'sprint-ticket-all-' + t.id}><TicketIdComponent ticket={t} />, </span>)
                            }
                        </div>
                        <div>
                            <b>Tickets by statuses:</b>
                            {
                                Object.keys(ticketsByStatuses).map(status => {
                                    return (
                                        <div key={status}>
                                            {statusComponent(status)} {ticketsByStatuses[status].length}&nbsp;&nbsp;&nbsp;
                                            {
                                                ticketsByStatuses[status].map(t => <span key={'sprint-ticket-by-status-' + t.id}><TicketIdComponent ticket={t} />, </span>)
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div>
                            <b>Completed:</b> {ticketsDonePercents}%
                        </div>
                    </Col>

                    <Col span={4}>
                        {
                            Object.keys(ticketsByTroubles).map(trouble => {
                                return (
                                    <div key={trouble}>
                                        {troubleIconComponent(trouble)} {ticketsByTroubles[trouble].length}&nbsp;&nbsp;&nbsp;
                                        {
                                            ticketsByTroubles[trouble].map(t => <span key={'sprint-ticket-by-trouble-' + t.id}><TicketIdComponent ticket={t} />, </span>)
                                        }
                                    </div>
                                )
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
                    </Col>

                    <Col span={8}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                <CartesianGrid stroke="#ccc" />
                                <YAxis />
                                <XAxis dataKey="name" />
                                <Line type="linear" name="Minutes left" dataKey="left" isAnimationActive={false} strokeWidth={2}  stroke={colors.red} />
                                <Tooltip/>
                            </LineChart>
                        </ResponsiveContainer>
                    </Col>

                </Row>
  
                <Table columns={columns} dataSource={data} pagination={false}/>
            </div>
        }

        return (
            <div>
                <Row style={{padding: '8px 15px'}}>
                    <Col span={3}>
                        <Select style={{ width: 200 }} defaultValue={this.state.currentSprintId} onChange={this.__selectSprint}>
                            {
                                sprints.sort().reverse().map((s) => {
                                    return <Select.Option value={s} key={'sprint-' + s}>{s}</Select.Option>
                                })
                            }
                        </Select>
                    </Col>
                    <Col span={19}>
                        <Select
                            mode="tags"
                            placeholder="Queues"
                            onChange={this.__changeQueues}
                            defaultValue={this.state.queues}
                            style={{minWidth: '300px'}}
                        >
                            { [...new Set(this.state.queues.concat(CONFIG.QUEUES))].map(q => <Select.Option key={q}>{q}</Select.Option>) }
                        </Select>
                    </Col>
                    <Col span={2} style={{textAlign: 'right'}}>
                        {/* {
                            this.state.loading && <Button onClick={this.__load} disabled={this.state.loading} type="primary">Load</Button>
                        }

                        {
                            !this.state.loading && <Button onClick={this.__load} type="primary">Load</Button>
                        } */}
                    </Col>
                </Row>

                {content}
            </div>
        )
    }

    __load() {
        this.setState({
            loading: true,
            loadingStatus: this.props.dashboard.loadingStatus,
        }); 

        this.props.dashboard.fetch({
            sprints: [this.state.currentSprintId]
        }).then((tickets) => {
            this.setState({
                tickets: tickets,
                loading: false,
                loadingStatus: this.props.dashboard.loadingStatus
            });

            previouslyLoadedTickets = tickets;

            this.props.dashboard.offChangeLoadingStatus(this.__onChangeLoadingStatus);
        });

        this.props.dashboard.onChangeLoadingStatus(this.__onChangeLoadingStatus);
    }

    __onChangeLoadingStatus(status) {
        this.setState({
            loadingStatus: status
        });
    }

    __selectSprint(id) {
        this.setState({
            currentSprintId: id
        }, this.__load);
    }

    __changeQueues(values) {
        state.queues = values;

        state.sync();

        this.setState({
            queues: state.queues
        })
    };
}