import React, { Component } from "react";

import config from "../config";
import checkInstallation from "../utils/checkInstallation";
import verifyIdentity from "../utils/verifyIdentity";

import "../styles/Index.styl";
import postWrapper from "../utils/postWrapper";
import WebCam from "../icons/Webcam";
import Monitor from "./Monitor";
import {Button} from "antd";

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameras: [],
      cameraStatus: {},
      showAll: false
    };
  }

  componentDidMount() {
    checkInstallation(this.props.history);
    verifyIdentity(this.props.history);

    this.getCameras();
  }

  componentWillUnmount() {
    if (this.interval)
      clearInterval(this.interval);
  }

  getCameras() {
    const uid = localStorage.getItem("uid"), authKey = localStorage.getItem("authKey");
    fetch(`${config.server}/api/camera/get`, {
      method: "POST",
      body: postWrapper({ uid, authKey })
    })
      .then(res => res.json())
      .then(data => {
        this.setState({ cameras: data.payload });
        this.payload = data.payload;
        this.getCamerasStatus(data.payload);
        setInterval(() => this.getCamerasStatus(this.payload), 10000);
      });
  }

  async getCamerasStatus(payload) {
    const result = {};
    for (const item of payload) {
      const uid = localStorage.getItem("uid"),
        authKey = localStorage.getItem("authKey"),
        address = item.ip;

      await fetch(`${config.server}/api/camera/status`, {
        method: "post",
        body: postWrapper({ uid, authKey, address })
      })
        .then(res => res.json())
        .then(data => {
          result[address] = data.online;
        });
    }
    this.setState({
      cameraStatus: result
    })
  }

  watchVideo(id) {
    window.location.href = '/app/video/' + id;
  }

  renderCameras() {
    const result = [];
    this.state.cameras.forEach(cam => {
      result.push(
        <div
          key={cam.name}
          onClick={() => this.state.cameraStatus[cam.ip] ? this.watchVideo(cam.name) : null}
          className={`index-camera-item ${this.state.cameraStatus[cam.ip] ? "online" :
            this.state.cameraStatus[cam.ip] === undefined ? "unkonwn" : "offline"}`}>
          <div className={"index-camera-icon"}>
            <WebCam/>
          </div>
          <div className={"index-camera-info"}>
            <p className={"index-camera-name"}>{cam.name}</p>
            <p className={"index-camera-address"}>{cam.ip}</p>
            <div
              className={`index-camera-status ${this.state.cameraStatus[cam.ip] ? "online" :
                this.state.cameraStatus[cam.ip] === undefined ? "unkonwn" : "offline"}`}
              title={`${this.state.cameraStatus[cam.ip] ? "摄像头在线" : "摄像头离线"}`}
            >
            </div>
          </div>
        </div>
      );
    });
    return result;
  }

  render() {
    return (
      <div className={"app-index"}>
        {this.state.showAll && <Monitor
          show={this.state.showAll}
          cameras={this.state.cameras}
          status={this.state.cameraStatus}
          parent={this}
        />}
        <h3 className={"part-title"}>摄像头列表</h3>
        <div className={"index-cameras-list"}>
          {this.renderCameras()}
        </div>

        <h3 className={"part-title"}>监视模式</h3>
        <Button type={"primary"} onClick={() => this.setState({ showAll: true })}>
          打开监视页面，显示所有摄像头画面
        </Button>
      </div>
    );
  }
}