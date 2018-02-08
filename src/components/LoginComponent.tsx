import * as React from 'react';
import { Form, Icon, Input, Button, Checkbox, Modal, Alert } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { bind } from '../decorators';
import { TCreds } from '../common';
import { fetchData } from '../utils';
import credentials from '../credentials';

interface IFormProps extends FormComponentProps {
    onLogin: (creds: TCreds) => void;
}

class LoginForm extends React.Component<IFormProps> {
    public state = {
        error: null,
        loading: false,
    };

    public componentDidMount() {
        this.load().catch();
    }

    public render() {
        const { getFieldDecorator } = this.props.form;
        // console.log(credentials.login);
        return (
            <Modal
                visible={true}
                title='Login Form'
                // okText='Login'
                closable={false}
                destroyOnClose={true}
                footer={<Button onClick={this.handleSubmit} type='primary'loading={this.state.loading}  >Login</Button>}
                // onCancel={onCancel}
                // onOk={onCreate}
            >
                <Form className='login-form'>
                    <Form.Item>
                        {getFieldDecorator('login', {
                            initialValue: credentials.login,
                            rules: [{ required: true, message: 'Please input your Username!' }],
                        })(
                            <Input
                                prefix={<Icon type='user' style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder='Username'
                                onPressEnter={this.handleSubmit}
                                autoFocus={true} />,
                            )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            initialValue: credentials.password,
                            rules: [{ required: true, message: 'Please input your Password!' }],
                        })(
                            <Input
                                prefix={<Icon type='lock' style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type='password'
                                placeholder='Password'
                                onPressEnter={this.handleSubmit} />,
                            )}
                    </Form.Item>
                </Form>
                {
                    this.state.error &&
                    <Alert
                        message={this.state.error}
                        type='error'
                    />
                }
            </Modal>
        );
    }

    @bind
    public async handleSubmit(e: React.FormEvent<any>) {
        e.preventDefault();

        await this.load();
    }

    private async load() {
        return new Promise((res, rej) => {
            this.props.form.validateFields(async (err, values) => {
                if (!err) {
                    Object.assign(credentials, values);

                    try {
                        this.setState({
                            loading: true,
                        });

                        await fetchData(`user/${values.login}`);

                        this.setState({
                            loading: false,
                        }, () => {
                            this.props.onLogin(values);

                            res();
                        });

                    } catch (e) {
                        this.setState({
                            error: 'Login Failed',
                            loading: false,
                        }, () => {

                            rej();
                        });
                    }
                }
            });
        });
    }
}

export default Form.create()(LoginForm);
