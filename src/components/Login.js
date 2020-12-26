import React, { Component } from "react";

import "../styles/Login.styl";
import config from "../config";
import {Button, Form, Input, message} from "antd";
import postWrapper from "../utils/postWrapper";
import checkInstallation from "../utils/checkInstallation";

const layout = {
  labelCol: {span: 4},
  wrapperCol: {span: 16},
};

export default class Login extends Component {
  componentDidMount() {
    checkInstallation(this.props.history);
  }

  onLogin(data) {
    fetch(`${config.server}/api/user/login`, {
      method: "post",
      body: postWrapper({
        username: data.username,
        password: data.password
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          message.success("登录成功！");
          localStorage.setItem("uid", data.uid);
          localStorage.setItem("authKey", data.authKey);
          this.props.history.push("/app/index");
        }
        else {
          message.error("登录失败，请检查用户名或密码。");
        }
      })
  }

  render() {
    return (
      <div className={"login-page"}>
        <div className={"container"}>
          <h1 className={"app-title"}>
            {config.appName}
          </h1>
          <h2 className={"action-title"}>
            登录系统
          </h2>

          <Form
            {...layout}
            initialValues={{
              permission: "0"
            }}
            name="admin"
            onFinish={(data) => this.onLogin(data)}
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{required: true, message: '需要输入用户名。'}]}
            >
              <Input/>
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{required: true, message: '需要输入密码。'}]}
            >
              <Input.Password/>
            </Form.Item>

            <div style={{textAlign: 'center'}}>
              <Button type="primary" htmlType="submit">
                登录
              </Button>
            </div>
          </Form>

        </div>
      </div>
    );
  }
}