import config from "../config";
import postWrapper from "./postWrapper";

const getServerOption = (name) => {
  fetch(`${config.server}/api/option/get`, {
    method: "post",
    body: postWrapper({
      uid: localStorage.getItem("uid"),
      authKey: localStorage.getItem("authKey"),
      name
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success")
        localStorage.setItem(name, data.value);
    });
};

export default getServerOption;
