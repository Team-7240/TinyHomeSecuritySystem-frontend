import React, {Component} from "react";
import checkInstallation from "../utils/checkInstallation";
import verifyIdentity from "../utils/verifyIdentity";
import "../styles/Video.styl";

export default class Video extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      name: "",
      timeStr: ""
    };
  }

  componentDidMount() {
    checkInstallation(this.props.history);
    verifyIdentity(this.props.history);

    const id = this.props.match.params.id;
    if (!id)
      return;
    this.setState({
      url: `${localStorage.getItem("flv_server")}/${id}.flv`,
      name: id
    }, () => {
      const videojs = window.videojs;
      videojs('videojs-flvjs-player', {
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

    this.interval = setInterval(() => this.updateTimeString(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateTimeString() {
    const timeStr = `[${this.state.name}] ${new Date().Format("yyyy-MM-dd HH:mm:ss")}`;
    this.setState({
      timeStr
    });
  }

  render() {
    return (
      <div className={"video"}>
        <div className={"video-container"}>
          <video autoPlay={"autoplay"} ref={ref => this.video = ref} style={{width: '100%'}} id="videojs-flvjs-player"
                 className="player video-js vjs-default-skin" controls>
            <source src={this.state.url} type='video/x-flv'/>
          </video>
          <div className={"video-tag"}>
            {this.state.timeStr}
          </div>
        </div>
      </div>
    );
  }
}
