import React, {PureComponent} from "react";
import {PageHeader} from "antd";

import "../styles/Monitor.styl";

export default class Monitor extends PureComponent {
  video = {}

  renderScenes() {
    const cameras = this.props.cameras,
      status = this.props.status;
    const result = [];
    cameras.forEach((cam, key) => {
      result.push(
        <div key={key} className={"monitor-item"}>
          <div className={"item-title"}>
            {cam.name}
          </div>
          {status[cam.ip] && (<div className={"item-container"}>
            <video width={360} height={270} autoPlay={"autoplay"} ref={ref => this.video[cam.name] = ref} style={{width: '100%'}}
                   id={cam.name}
                   className="player video-js vjs-default-skin" controls>
              <source src={`${localStorage.getItem("flv_server")}/${cam.name}.flv`} type='video/x-flv'/>
            </video>
          </div>)}
          {!status[cam.ip] && (
            <div className={"item-container"}>
              <p>摄像头离线。</p>
            </div>
          )}
        </div>
      );
    });

    return result;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const videojs = window.videojs;
    this.props.cameras.forEach((cam) => {
      if (!this.props.status[cam.ip])
        return;
      videojs(cam.name, {
        techOrder: ['html5', 'flvjs'],
        flvjs: {
          mediaDataSource: {
            isLive: true,
            cors: true,
            withCredentials: false,
          }
        }
      });
    });
  }

  render()
    {
      return (
        <div className={"monitor-mode"} style={{display: this.props.show ? "block" : "none"}}>
          <PageHeader
            className="site-page-header"
            onBack={() => this.props.parent.setState({showAll: false})}
            title="所有画面"
            style={{background: '#fff'}}
          />
          <div className={"monitor-items"}>
            {this.renderScenes()}
          </div>
        </div>
      )
    }
  }
