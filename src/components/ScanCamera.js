import React, {Component} from "react";
import {Input, Button, message, Switch, Modal} from "antd";

import "../styles/ScanCamera.styl"
import config from "../config";
import postWrapper from "../utils/postWrapper";
import WebCam from "../icons/Webcam";


export default class ScanCamera extends Component {
  subnet = "";

  constructor(props) {
    super(props);
    this.state = {
      cameras: [],
      existedCameras: {},
      addCameras: {},
      action: 'idle',
      showManually: false
    };
  }

  componentDidMount() {
    this.getCurrentCameras();
  }

  // 显示摄像头列表
  renderCameraList() {
    const {cameras, action} = this.state;
    if (action === "idle") {
      return (
        <div className={"list-prompt"}>
          等待扫描...
        </div>
      );
    }
    if (action === "scan") {
      return (
        <div className={"list-prompt"}>
          正在扫描，请等待...
        </div>
      );
    }
    if (!cameras.length) {
      return (
        <div className={"list-prompt"}>
          找不到摄像头...
        </div>
      );
    }
    const cameraLists = [];
    this.state.cameras.forEach(cam => {
      if (this.state.existedCameras.hasOwnProperty(cam))
        return;
      cameraLists.push(
        <div key={cam} className={`camera-item-card ${this.state.addCameras[cam] ? "selected" : ""}`}>
          <div className={"camera-item-icons"}>
            <WebCam/>
          </div>
          <div className={"camera-info"}>
            <Switch onChange={() => {
              const nextState = this.state.addCameras;
              if (this.state.addCameras[cam])
                delete nextState[cam];
              else
                nextState[cam] = {
                  selected: true,
                  ip: cam
                };
              this.setState({
                addCameras: nextState
              });
            }} className={"camera-switch"}/>
            <p className={"camera-item-address"}>
              {cam}
            </p>
            <p className={"camera-item-type"}>
              ESP32
            </p>
            <input type={"text"} className={"camera-item-name"} placeholder={"为这个摄像头取一个名字.."}/>
          </div>
        </div>
      )
    });
    return cameraLists;
  }

  // 获取已存在的摄像头信息
  getCurrentCameras() {
    const uid = localStorage.getItem("uid"),
      authKey = localStorage.getItem("authKey"),
      payload = postWrapper({uid, authKey});

    fetch(`${config.server}/api/camera/get`, {
      method: 'POST',
      body: payload
    })
      .then(res => res.json())
      .then(data => {
        const existedCameras = {};
        data.payload.forEach(cam => existedCameras[cam.id] = true);
        this.setState({
          existedCameras
        });
      });
  }

  requestScan() {
    const subnet = this.subnet,
      uid = localStorage.getItem("uid"),
      authKey = localStorage.getItem("authKey"),
      payload = postWrapper({
        subnet, uid, authKey
      });
    if (!subnet.length) {
      message.error("扫描的网段不能为空！");
      return;
    }

    this.setState({
      action: "scan"
    }, () => {
      fetch(`${config.server}/api/camera/scan`, {
        method: "POST",
        body: payload
      })
        .then(res => res.json())
        .then(data => {
          console.log(data);
          this.setState({
            action: "done",
            cameras: data.payload
          });
        });
    });
  }

  saveResult() {
    const items = document.querySelectorAll(".camera-lists .camera-item-card");
    const postData = [];
    let verdict = true;
    items.forEach(item => {
      if (!verdict)
        return;
      const addr = item.querySelector(".camera-item-address").innerHTML,
        name = item.querySelector(".camera-item-name").value;
      if (!this.state.addCameras[addr])
        return;
      if (!name.length) {
        verdict = false;
        message.error("摄像头标识符名称不能为空！");
        return;
      }
      postData.push({
        addr,
        name
      });
    });

    if (!verdict)
      return;

    let flag = true;
    postData.forEach(item => {
      const uid = localStorage.getItem("uid"),
        authKey = localStorage.getItem("authKey"),
        name = item.name,
        ip = item.addr,
        payload = postWrapper({uid, authKey, name, ip});
      fetch(`${config.server}/api/camera/add`, {
        method: "post",
        body: payload
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === "failed") {
            flag = false;
            message.error(`添加 ${item.addr} 失败！`);
          }
        });
    });

    if (flag)
      message.info("正在保存...");
  }

  manuallyAdd() {
    const newIP = this.ipInput.value;
    this.setState({
      cameras: [...this.state.cameras, newIP],
      action: "done",
      showManually: false
    });
  }

  render() {
    return (
      <div className={"scan-web-camera"}>
        <h3 className={"part-title"}>添加摄像头</h3>
        <p>设置网段</p>
        <Input
          type={"text"}
          placeholder={"设置扫描摄像头的网段，如 192.168.1.0/24"}
          onChange={e => this.subnet = e.target.value}
        />

        <p style={{textAlign: 'right', margin: '10px 0px'}}>
          <Button onClick={() => this.requestScan()} type={"primary"}>扫描</Button>
        </p>

        <div className={"camera-lists"}>
          {this.renderCameraList()}
        </div>

        <div className={"buttons-action"} style={{textAlign: "center"}}>
          <Button
            onClick={() => this.saveResult()}
            style={{background: '#95de64', border: 0, margin: "0 20px"}}
            type={"primary"}>
            保存
          </Button>

          <Modal title="手动添加" visible={this.state.showManually} onOk={() => this.manuallyAdd()}
                 onCancel={() => this.setState({showManually: false})}>
            <input style={{ width: '100%' }} ref={ref => this.ipInput = ref} placeholder={"手动输入 IP..."} />
          </Modal>

          <Button
            onClick={() => this.setState({showManually: true})}>
            手动添加
          </Button>
        </div>
      </div>
    )
  }
}