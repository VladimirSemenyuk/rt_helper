import * as React from 'react';
import { Form, Icon, Input, Button, Checkbox, Modal, Alert } from 'antd'
import { FormComponentProps } from 'antd/lib/form';
import { bind } from '../decorators';
import { TCreds } from '../common';
import { fetchData } from '../utils';
import credentials from '../credentials';

interface IFormProps extends FormComponentProps {
    onLogin: (creds: TCreds) => void;
    //loginFn: (value: TCreds) => Promise<TCreds>
}

class LoginForm extends React.Component<IFormProps> {
    public state = {
        error: null,
        loading: false,
    };

    public render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                visible={true}
                title="Login Form"
                // okText="Login"
                closable={false}
                destroyOnClose={true}
                footer={<Button onClick={this.handleSubmit} type='primary'loading={this.state.loading}  >Login</Button>}
                // onCancel={onCancel}
                // onOk={onCreate}
            >
                <Form className="login-form">
                    <Form.Item>
                        {getFieldDecorator('login', {
                            rules: [{ required: true, message: 'Please input your username!' }],
                        })(
                            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
                            )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: 'Please input your Password!' }],
                        })(
                            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
                            )}
                    </Form.Item>
                </Form>

                {
                    this.state.error &&
                    <Alert
                        message={this.state.error}
                        //description="Error Description Error Description Error Description Error Description Error Description Error Description"
                        type="error"
                    />
                }
                
            </Modal>
        );
    }

    @bind
    public async handleSubmit(e: React.FormEvent<any>) {
        e.preventDefault();
        
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
                    });
                    
                    this.props.onLogin(values);
                } catch (e) {
                    this.setState({
                        error: 'Login Failed',
                        loading: false,
                    });
                }
            }
        });
    }
}

export default Form.create()(LoginForm);
