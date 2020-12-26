import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Redirect} from 'react-router-dom';

import Index from "./components/Index";
import Install from "./components/Install";
import Cameras from "./components/Cameras";

import "antd/dist/antd.min.css";
import "./styles/App.styl";
import Video from "./components/Video";
import AppMenu from "./components/AppMenu";
import Users from "./components/Users";
import Login from "./components/Login";


// eslint-disable-next-line
Date.prototype.Format = function (fmt) {
  const o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "H+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

ReactDOM.render(
  <React.StrictMode>
    <div className="homesec-app">
      <BrowserRouter>
        <Route path="/" exact>
          <Redirect to={"/app/index"} />
        </Route>
        <Route path={"/app"}>
          <div className={"container"}>
            <Route path={"/app"} component={AppMenu} />
            <Route path={"/app/index"} exact component={Index}/>
            <Route path={"/app/video/:id"} exact component={Video}/>
            <Route path={"/app/cameras"} exact component={Cameras} />
            <Route path={"/app/users"} exact component={Users} />
          </div>
        </Route>
        <Route path={"/login"} exact component={Login} />
        <Route path={"/installer"} exact component={Install}/>
      </BrowserRouter>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);
