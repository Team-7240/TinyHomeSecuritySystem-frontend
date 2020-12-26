import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "antd";

import "../styles/AppMenu.styl";
import config from "../config";
import postWrapper from "../utils/postWrapper";
import verifyIdentity from "../utils/verifyIdentity";
import checkInstallation from "../utils/checkInstallation";
import getServerOption from "../utils/getServerOptions";

export default class AppMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      permission: 0
    };
  }

  componentDidMount() {
    checkInstallation(this.props.history);
    verifyIdentity(this.props.history);
    getServerOption("flv_server");

    fetch(`${config.server}/api/users/info`, {
      method: "post",
      body: postWrapper({
        uid: localStorage.getItem("uid"),
        authKey: localStorage.getItem("authKey")
      })
    })
      .then(res => res.json())
      .then(data => {
        localStorage.setItem("username", data.payload.name);
        localStorage.setItem("permission", data.payload.permission);
        this.setState({
          username: data.payload.name,
          permission: data.payload.permission
        })
      })
        .catch(e => console.error(e));
  }

  logOut() {
    // eslint-disable-next-line
    if (confirm("要退出当前用户吗？")) {
      localStorage.removeItem("uid");
      localStorage.removeItem("authKey");
      localStorage.removeItem("username");
      localStorage.removeItem("permission");
      this.props.history.push("/login");
    }
  }

  render() {
    return (
      <div className={"app-menu"}>
        <h1 className={"app-name"}>{config.appName}</h1>
        <Button onClick={() => this.logOut()} type={"link"} className={"current-user"}>{this.state.username}</Button>
        <div className={"navlinks"}>
          <NavLink to={"/app/index"}>概览</NavLink>
          <NavLink
            disabled
            style={{ color: '#000' }}
            to={"/app/video"}>
            监控视频
          </NavLink>
          {this.state.permission >= 1 && (<NavLink to={"/app/users"}>用户</NavLink>)}
          {this.state.permission >= 1 && (<NavLink to={"/app/cameras"}>摄像头</NavLink>)}
        </div>
      </div>
    );
  }
}