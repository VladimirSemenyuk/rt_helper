import React, { Component } from 'react';
import './App.css';
import CONFIG from './config';
import TicketsTableComponent from './TicketsTableComponent';
import SprintComponent from './SprintComponent';
import { Layout, Menu, Row, Col,} from 'antd';
import Dashboard from './models/Dashboard';
import Grid from 'antd/lib/card/Grid';

const { Header, Content, Footer, Sider } = Layout;

class App extends Component {
    constructor() {
        super();

        this.state = {
            section: 'table'
        };

        this.__dashboard = new Dashboard();
        
        this.__changeSection = this.__changeSection.bind(this);
    }

    render() {
        let content;

        if (this.state.section === 'table') {
            content = <TicketsTableComponent dashboard={this.__dashboard} />
        } else if (this.state.section === 'sprint') {
            content = <SprintComponent dashboard={this.__dashboard} />;
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
                                //onClick={this.handleClick}
                                selectedKeys={[this.state.section]}
                                mode="horizontal"
                                onClick={this.__changeSection}
                                theme="dark"
                                style={{lineHeight: '64px'}}
                            >
                                <Menu.Item key="table">Tickets</Menu.Item>
                                <Menu.Item key="sprint">Sprint</Menu.Item>
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

    __changeSection(e) {
        this.setState({
            section: e.key
        }); 
    }
}

export default App;
