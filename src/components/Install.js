import React, {Component} from "react";
import {Steps, Button, Form, Input, Spin, message} from "antd";
import {LoadingOutlined} from '@ant-design/icons';
import postWrapper from "../utils/postWrapper";

import config from "../config";
import ScanCamera from "./ScanCamera";


import "../styles/Install.styl";

const {Step} = Steps;

const layout = {
  labelCol: {span: 6},
  wrapperCol: {span: 16},
};

export default class Install extends Component {
  steps = [
    {title: "设置管理员账号"},
    {title: "设置推流服务器"},
    {title: "添加网络摄像头"},
    {title: "完成安装"}
  ]

  componentDidMount() {
    fetch(`${config.server}/install/status`)
      .then(res => res.json())
      .then(res => {
        if (res.installed)
          this.props.history.push('/');
      })
  }

  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      showWait: false,
      waitContent: "",
      cameras: []
    };
  }

  setStep(step) {
    this.setState({
      currentStep: step,
      showWait: false
    });
  }

  guessStreamingServer() {
    return `rtmp://${document.domain}/live`;
  }

  guessFlvServer() {
    return `http://${document.domain}:5002/live`;
  }

  onStreamingFinish(data) {
    const ref = data;
    this.setState({
      showWait: true,
      waitContent: "正在保存设置..."
    }, async () => {
      let uid = localStorage.getItem("uid"),
        authKey = localStorage.getItem("authKey"),
        name = "streaming_server",
        value = ref.server;

      await fetch(`${config.server}/api/option/set`, {
        method: "post",
        body: postWrapper({ uid, authKey, name, value })
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === "failed")
            message.error("设置推流服务器失败!");
        });

      name = "flv_server";
      value = ref.flvserver;

      await fetch(`${config.server}/api/option/set`, {
        method: "post",
        body: postWrapper({ uid, authKey, name, value })
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === "failed")
            message.error("设置 FLV 服务器失败!");
          this.setStep(2);
        });
    })
  }

  onAdminFinish(data) {
    const ref = data;

    this.setState({
      showWait: true,
      waitContent: "正在新建用户.."
    }, () => {
      const form = new FormData();
      form.append("admin_username", data.username);
      form.append("admin_password", data.password);

      // 发送 install 请求
      fetch(`${config.server}/install/install`, {
        method: "POST",
        body: form
      })
        .then(res => res.json())
        .then(data => {
          if (data.status !== "success")
            return false;
          // 安装成功后登录
          fetch(`${config.server}/api/user/login`, {
            method: "post",
            body: postWrapper({
              username: ref.username,
              password: ref.password
            })
          })
            .then(res => res.json())
            .then(data => {
              // 保存登录状态，进入下一步
              localStorage.setItem("uid", data.uid);
              localStorage.setItem("authKey", data.authKey);

              this.setState({
                currentStep: 1,
                showWait: false
              });
            })
        })
    });
  }

  render() {
    return (
      <div className={"installer"}>
        {this.state.showWait && (
          <div className={"wait-page"}>
            <Spin
              tip={this.state.waitContent}
              indicator={<LoadingOutlined style={{fontSize: 80, margin: "10px 0"}} spin/>}
            />
          </div>
        )}

        <div className={`container installer-container ${this.state.showWait ? "blur" : ""}`}>
          <h1 className={"page-title"}>
            安装向导
          </h1>
          <p className={"page-description"}>
            初次使用 {config.appName}， 需要设置管理员账户和推流服务器。
          </p>

          <Steps current={this.state.currentStep}>
            {this.steps.map(item => (
              <Step key={item.title} title={item.title}/>
            ))}
          </Steps>

          {this.state.currentStep === 0 && (
            <div className={"install-step"}>
              <Form
                {...layout}
                name="admin"
                onFinish={(data) => this.onAdminFinish(data)}
              >
                <Form.Item
                  label="管理员用户名"
                  name="username"
                  rules={[{required: true, message: '需要设置一个用户名。'}]}
                >
                  <Input/>
                </Form.Item>

                <Form.Item
                  label="管理员密码"
                  name="password"
                  rules={[{required: true, message: '需要设置一个密码。'}]}
                >
                  <Input.Password/>
                </Form.Item>
                <div style={{textAlign: 'center'}}>
                  <Button type="primary" htmlType="submit">
                    下一步
                  </Button>
                </div>
              </Form>
            </div>
          )}

          {this.state.currentStep === 2 && (
            <div className={"install-step"}>
              <ScanCamera/>
              <div style={{textAlign: 'center'}}>
                <Button onClick={() => this.setStep(0)}>
                  上一步
                </Button>
                <Button type="primary" onClick={() => this.setStep(3)}>
                  完成
                </Button>
              </div>
            </div>
          )}

          {this.state.currentStep === 1 && (
            <div className={"install-step"}>
              <Form
                {...layout}
                name="streaming"
                initialValues={{
                  server: this.guessStreamingServer(),
                  flvserver: this.guessFlvServer()
                }}
                onFinish={(data) => this.onStreamingFinish(data)}
              >
                <Form.Item
                  label="推流服务器"
                  name="server"
                  rules={[{required: true, message: '需要填写推流服务器'}]}
                >
                  <Input/>
                </Form.Item>

                <p style={{ color: '#999' }}>
                  设置 RTMP 协议推流服务器，一般是形如 rtmp://&lt;domain&gt;/live 的形式。如果自动检测的值不正确，请自行更正。
                </p>

                <Form.Item
                  label="推流服务器"
                  name="flvserver"
                  rules={[{required: true, message: '需要填写播放服务器'}]}
                >
                  <Input/>
                </Form.Item>
                <p style={{ color: '#999' }}>
                  设置 FLV 播放源，一般是形如 http://&lt;domain:port&gt;/live 的形式。如果自动检测的值不正确，请自行更正。
                </p>


                <div style={{textAlign: 'center'}}>
                  <Button onClick={() => this.setStep(1)}>
                    上一步
                  </Button>
                  <Button type="primary" htmlType="submit">
                    下一步
                  </Button>
                </div>
              </Form>
            </div>
          )}

          {this.state.currentStep === 3 && (
            <div className={"install-step"}>
              <p>你已经完成了 {config.appName} 的安装！现在可以开始使用了！</p>
              <p style={{ textAlign: 'center' }}>
                <Button onClick={() => this.props.history.push("/app/index")} type={"primary"}>进入主界面</Button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}