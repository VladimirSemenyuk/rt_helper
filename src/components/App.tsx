import * as React from 'react';
import {
    bind,
} from '../decorators';
import Ticket from '../models/Ticket';
import { fetchData, parseApiResponce } from '../utils';
import { TCreds } from '../common';
import TicketsTableComponent from './TicketsTableComponent';
import SprintComponent from './SprintComponent';
import {
    Col,
    Layout,
    Menu,
    Row,
    Modal,
    Button
} from 'antd';
import Dashboard from '../models/Dashboard';
import LoginComponent from './LoginComponent';
import { ClickParam } from 'antd/lib/menu';

const { Header, Content, Footer, Sider } = Layout;

class App extends React.Component {
    public state = {
        section: 'table',
        isLoggedIn: false,
    };

    private dashboard = new Dashboard();

    public render() {
        let content: any = '';

        if (!this.state.isLoggedIn) {
            return <LoginComponent onLogin={this.onLogin} />;

        } else 
        if (this.state.section === 'table') {
            content = <TicketsTableComponent dashboard={this.dashboard} />;
        } else if (this.state.section === 'sprint') {
            content = <SprintComponent dashboard={this.dashboard} />;
        }

        return (
            <Layout>
                <Header>
                    <Row>
                        <Col span={4}>
                            <h1 style={{color: '#fefefe', display: 'inline-block'}}>
                                rt_helper
                            </h1>
                        </Col>
                        <Col span={20}>
                            <Menu
                                selectedKeys={[this.state.section]}
                                mode='horizontal'
                                onClick={this.changeSection}
                                theme='dark'
                                style={{lineHeight: '64px'}}
                            >
                                <Menu.Item key='table'>Tickets</Menu.Item>
                                <Menu.Item key='sprint'>Sprint</Menu.Item>
                            </Menu>
                        </Col>
                    </Row>
                </Header>

                <Content>
                    <div>
                        {content}
                    </div>
                </Content>
            </Layout>
        );
    }

    @bind
    private changeSection(e: ClickParam) {
        this.setState({
            section: e.key,
        });
    }

    @bind
    private onLogin(creds: TCreds) {
        this.setState({
            isLoggedIn: true,
        });
    }
}

export default App;
