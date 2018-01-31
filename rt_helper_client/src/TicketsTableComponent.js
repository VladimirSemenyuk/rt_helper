import React, { Component } from 'react';
import moment from 'moment';
import { Table, Tag, Tooltip, Progress, Select, Button, Row, Col, Checkbox, DatePicker, Spin } from 'antd';
import CONFIG from './config';
import COLORS from './colors';
import Dashboard from './models/Dashboard';
import Ticket, {TROUBLES} from './models/Ticket';
import TicketIdComponent from './TicketIdComponent';
import statusComponent from './statusComponent';
import loeComponent from './loeComponent';
import troublesComponent from './troublesComponent';
import lifetimeComponent from './lifetimeComponent';
import loaderComponent from './loaderComponent';
import state from './state';

const troublesFilters = Object.keys(TROUBLES).map((t) => {
    return {
        value: t,
        text: t,
    };
});

let previouslyLoadedTickets = [];

export default class TicketsTableComponent extends Component {

    constructor(...args) {
        super(...args);

        this.state = {
            tickets: previouslyLoadedTickets,
            owners: state.owners,
            // allOwners: null,
            // sprints: null,
            // allSprints: null,
            queues: state.queues,
            // allQueues: null,
            loading: false,
            loadingStatus: '',
            allStatuses: state.allStatuses,
            fromDate: state.fromDate
        };

        this.__onTableChange = this.__onTableChange.bind(this);
        this.__load = this.__load.bind(this);
        this.__changeAllStatuses = this.__changeAllStatuses.bind(this);
        this.__changeOwners = this.__changeOwners.bind(this);
        this.__changeQueues = this.__changeQueues.bind(this);
        this.__onChangeLoadingStatus = this.__onChangeLoadingStatus.bind(this);
        this.__changeFromDate = this.__changeFromDate.bind(this);
    }

    render() {
        let content = '';

        if (this.state.loading && this.state.loadingStatus) {
            content = loaderComponent(this.state.loadingStatus)
        } else {
            let tickets = this.state.tickets;
            let statuses = tickets.map(t => t.Status).filter((value, index, self) => self.indexOf(value) === index);
            let owners = tickets.map(t => t.Owner).filter((value, index, self) => value && self.indexOf(value) === index);
            let queues = tickets.map(t => t.Queue).filter((value, index, self) => self.indexOf(value) === index);
            let sprints = tickets.map(t => t.sprint).filter((value, index, self) => self.indexOf(value) === index).sort().reverse();

            const sprintsFilters = sprints.map((s) => {
                return {
                    value: s,
                    text: s
                }
            });
            
            content = <Table pagination={false} size='small' columns={[,
                {
                    title: 'id',
                    dataIndex: 'id',
                    sorter: (a, b) => a.id - b.id,
                    render: (id, ticket) => <TicketIdComponent ticket={ticket} />
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
                    },
                    render: (title, ticket) => <span title={ticket.Subject}>{title}</span>
                },
                {
                    title: 'Status',
                    dataIndex: 'Status',
                    sorter: (t1, t2) => {
                        if (t1.Status < t2.Status)
                            return -1
                        if (t1.Status > t2.Status)
                            return 1
                        return 0
                    },
                    filters: statuses.map((s) => {
                        return {
                            text: s,
                            value: s
                        }
                    }),
                    onFilter: (value, ticket) => ticket.Status === value,
                    render: statusComponent,
                },
                {
                    title: 'Queue',
                    dataIndex: 'Queue',
                    sorter: (t1, t2) => {
                        if (t1.Queue < t2.Queue)
                            return -1
                        if (t1.Queue > t2.Queue)
                            return 1
                        return 0
                    },
                    filters: queues.map(q => {
                        return {
                            text: q,
                            value: q
                        }
                    }),
                    onFilter: (value, ticket) => {
                        return ticket.Queue === value;
                    },
                    render: q => <Tag>{q}</Tag>
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
                    },
                    render: o => <b>{o}</b>,
                    filters: owners.map(o => {
                        return {
                            text: o,
                            value: o
                        }
                    }),
                    onFilter: (value, ticket) => ticket.Owner === value,
                },
                {
                    title: 'Priority',
                    dataIndex: 'Priority',
                    sorter: (t1, t2) => {
                        if (t1.Priority < t2.Priority)
                            return -1
                        if (t1.Priority > t2.Priority)
                            return 1
                        return 0
                    }
                },
                {
                    title: 'Biz Value',
                    dataIndex: 'CF.{biz_value}',
                    filters: [
                        {
                            text: 'With Biz Value',
                            value: true,
                        },
                        {
                            text: 'Without Biz Value',
                            value: false,
                        }
                    ],
                    onFilter: (value, ticket) => (Boolean(ticket.hasBizValue)).toString() === value,
                    sorter: (t1, t2) => {
                        if (t1['CF.{biz_value}'] < t2['CF.{biz_value}'])
                            return -1
                        if (t1['CF.{biz_value}'] > t2['CF.{biz_value}'])
                            return 1
                        return 0
                    }
                },
                {
                    title: 'Sprint',
                    dataIndex: 'sprint',
                    filters: sprintsFilters,
                    sorter: (t1, t2) => {
                        if (t1.sprint < t2.sprint)
                            return -1
                        if (t1.sprint > t2.sprint)
                            return 1
                        return 0
                    },
                    onFilter: (value, ticket) => value === ticket.sprint,
                },
                {
                    title: 'Life Time',
                    dataIndex: 'lifeTime',
                    render: lifetimeComponent
                },
                {
                    title: 'loe',
                    dataIndex: 'estimatedMinutes',
                    render: (left, ticket) => {
                        return timeRender(ticket, ticket => <span>{loeComponent(ticket.workedMinutes)} / {loeComponent(ticket.estimatedMinutes)}</span>);
                    },
                    sorter: (t1, t2) => {
                        if (t1.workedMinutes < t2.workedMinutes)
                            return -1
                        if (t1.workedMinutes > t2.workedMinutes)
                            return 1
                        return 0
                    }
                },
                {
                    title: 'Time',
                    dataIndex: 'leftMinutes',
                    render: (left, ticket) => {
                        return timeRender(ticket, ticket => <span>{ticket.workedMinutes} / {ticket.estimatedMinutes}</span>);
                    },
                    sorter: (t1, t2) => {
                        if (t1.workedMinutes < t2.workedMinutes)
                            return -1
                        if (t1.workedMinutes > t2.workedMinutes)
                            return 1
                        return 0
                    }
                },
                {
                    title: 'Troubles',
                    dataIndex: 'troubles',
                    filters: troublesFilters,
                    onFilter: (value, ticket) => ticket.troubles.indexOf(value) !== -1,//(!!ticket.troubles.length).toString() === value,
                    render: troublesComponent
                }
            ]} dataSource={tickets} onChange={this.__onTableChange} />
        }


        return (
            <div>
                <Row style={{padding: '8px 15px'}}>
                    <Col span={6}>
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
                    <Col span={11}>
                        <Select
                            mode="tags"
                            placeholder="Owners"
                            onChange={this.__changeOwners}
                            defaultValue={this.state.owners}
                            style={{minWidth: '300px'}}
                        >
                            { [...new Set(this.state.owners.concat(CONFIG.TEAM))].map(owner => <Select.Option key={owner}>{owner}</Select.Option>) }
                        </Select>
                    </Col>
                    <Col span={3}>
                        <Checkbox onChange={this.__changeAllStatuses} defaultChecked={this.state.allStatuses}>Resolved, Rejected and Closed</Checkbox>
                    </Col>
                    <Col span={2}>
                        <DatePicker placeholder="Last Updated" onChange={this.__changeFromDate} defaultValue={moment(this.state.fromDate, 'YYYY-MM-DD')}/>
                    </Col>
                    <Col span={2} style={{textAlign: 'right'}}>
                        {
                            this.state.loading && <Button onClick={this.__load} disabled={this.state.loading} type="primary">Load</Button>
                        }

                        {
                            !this.state.loading && <Button onClick={this.__load} type="primary">Load</Button>
                        }
                    </Col>
                </Row>
                {content}
            </div>
            
                
        );
    }

    __load() {

        this.setState({
            loading: true,
            loadingStatus: this.props.dashboard.loadingStatus,
        }); 

        this.props.dashboard.fetch({
            queues: this.state.queues,
            owners: this.state.owners,
            allStatuses: this.state.allStatuses,
            from: this.state.fromDate
        }).then((tickets) => {
            this.setState({
                tickets: tickets,
                // allOwners: dash.allOwners,
                // allSprints: dash.allSprints,
                // allQueues: dash.allQueues,
                // section: this.state.section,
                loading: false,
                loadingStatus: this.props.dashboard.loadingStatus
            });

            previouslyLoadedTickets = tickets;

            this.props.dashboard.offChangeLoadingStatus(this.__onChangeLoadingStatus);
        });

        this.props.dashboard.onChangeLoadingStatus(this.__onChangeLoadingStatus);
    }

    __changeOwners(values) {
        state.owners = values;

        state.sync();

        this.setState({
            ...this.state,
            owners: state.owners
        })
    }

    __changeQueues(values) {
        state.queues = values;

        state.sync();

        this.setState({
            ...this.state,
            queues: state.queues
        })
    }

    __changeAllStatuses(e) {
        state.allStatuses = e.target.checked;

        state.sync();

        this.setState({
            ...this.state,
            allStatuses: state.allStatuses
        })
    }

    __changeFromDate(date, dateStr) {
        state.fromDate = dateStr;

        state.sync();

        this.setState({
            ...this.state,
            fromDate: state.fromDate
        })
    }

    __onChangeLoadingStatus(status) {
        this.setState({
            ...this.state,
            loadingStatus: status
        });
    }

    __onTableChange() {
        console.log(arguments);
    }

    
}

function timeRender(ticket, toRenderFn) {
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