import React, { Component } from "react";
import ScanCamera from "./ScanCamera";
import {Button, message, Table} from "antd";
import config from "../config";
import postWrapper from "../utils/postWrapper";


export default class Cameras extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraList: []
    };
  }

  componentDidMount() {
    this.updateCameraList();
  }

  updateCameraList() {
    fetch(`${config.server}/api/camera/get`, {
      method: "post",
      body: postWrapper({
        uid: localStorage.getItem("uid"),
        authKey: localStorage.getItem("authKey")
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log(data.payload);
        this.setState({
          cameraList: data.payload
        })
      });
  }

  deleteCamera(target) {
    fetch(`${config.server}/api/camera/delete`, {
      method: "post",
      body: postWrapper({
        uid: localStorage.getItem("uid"),
        authKey: localStorage.getItem("authKey"),
        target
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status)
          message.success("删除摄像头成功。你可能需要重启服务器以使改动生效。");
        else
          message.error("删除摄像头失败。");
        this.updateCameraList();
      })
  }

  renderCameraList() {
    if (this.state.cameraList.length === 0)
      return null;
    const columns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id"
      },
      {
        title: "摄像头名称",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "摄像头网络地址",
        dataIndex: "ip",
        key: "ip",
      },
      {
        title: "操作",
        key: "action",
        render: (text, record) => {
          return (
            <Button
              onClick={() => this.deleteCamera(record.id)}
              type={"link"}>
              删除摄像头
            </Button>
          );
        }
      }
    ];
    return <Table dataSource={this.state.cameraList} columns={columns}/>;
  }

  render() {
    return (
      <div className={"cameras"}>
        <h3 className={"part-title"}>
          摄像头列表
        </h3>
        {this.renderCameraList()}
        <ScanCamera />
      </div>
    )
  }
}