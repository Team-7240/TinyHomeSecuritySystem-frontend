import React, {Component} from "react";
import config from "../config";
import postWrapper from "../utils/postWrapper";
import {Button, Form, Input, Table, Select, message} from "antd";

const layout = {
  labelCol: {span: 6},
  wrapperCol: {span: 16},
};

const { Option } = Select;

export default class Users extends Component {
  constructor(props) {
    super(props);

    this.state = {
      usersList: []
    }
  }

  componentDidMount() {
    this.updateUsersList();
  }

  updateUsersList() {
    fetch(`${config.server}/api/users/all`, {
      method: "post",
      body: postWrapper({
        uid: localStorage.getItem("uid"),
        authKey: localStorage.getItem("authKey")
      })
    })
      .then(res => res.json())
      .then(data => {
        this.setState({
          usersList: data.payload
        })
      });
  }

  renderUsersList() {
    if (this.state.usersList.length === 0)
      return null;
    const columns = [
      {
        title: "ID",
        dataIndex: "uid",
        key: "uid"
      },
      {
        title: "用户名",
        dataIndex: "username",
        key: "username"
      },
      {
        title: "权限",
        dataIndex: "permission",
        key: "permission",
        render: (value) => {
          if (value === 0)
            return "普通用户";
          if (value === 1)
            return "管理员";
          if (value ===2 )
            return "超级管理员";
        }
      },
      {
        title: "操作",
        key: "action",
        render: (text, record) => {
          return (
            <Button
              disabled={Number(record.uid) === Number(localStorage.getItem("uid"))}
              onClick={() => this.deleteUser(record.uid)}
              type={"link"}>
              删除用户
            </Button>
          );
        }
      }
    ];
    return <Table dataSource={this.state.usersList} columns={columns}/>;
  }

  deleteUser(target) {
    // eslint-disable-next-line
    if (confirm("确定要删除该用户吗？")) {
      const uid = localStorage.getItem("uid"),
        authKey = localStorage.getItem("authKey");
      fetch(`${config.server}/api/users/delete`, {
        method: "post",
        body: postWrapper({uid, authKey, target})
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === "success")
            message.success("用户已删除。");
          else
            message.error("用户删除失败。");
          this.updateUsersList();
        });
    }
  }

  onAddUser(data) {
    const username = data.username,
      password = data.password,
      permission = data.permission,
      uid = localStorage.getItem("uid"),
      authKey = localStorage.getItem("authKey");
    fetch(`${config.server}/api/users/add`, {
      method: "post",
      body: postWrapper({ username, password, permission, uid, authKey })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          message.success("添加新用户成功！");
          this.updateUsersList();
        }
        else {
          message.error("添加新用户失败。");
        }
      });
  }

  render() {
    return (
      <div className={"users"}>
        <h3 className={"part-title"}>
          用户列表
        </h3>
        {this.renderUsersList()}

        <h3 className={"part-title"}>
          添加用户
        </h3>
        <Form
          {...layout}
          initialValues={{
            permission: "0"
          }}
          name="admin"
          onFinish={(data) => this.onAddUser(data)}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{required: true, message: '需要设置一个用户名。'}]}
          >
            <Input/>
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{required: true, message: '需要设置一个密码。'}]}
          >
            <Input.Password/>
          </Form.Item>

          <Form.Item
            label="权限"
            name="permission"
            rules={[{required: true, message: '需要指定用户权限。'}]}
          >
            <Select>
              <Option value="0">普通用户</Option>
              <Option value="1">管理员</Option>
            </Select>
          </Form.Item>
          <div style={{textAlign: 'center'}}>
            <Button type="primary" htmlType="submit">
              新建用户
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}