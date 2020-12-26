import postWrapper from "./postWrapper";
import config from "../config";

const verifyIdentity = (history) => {
  const uid = localStorage.getItem("uid"),
    authKey = localStorage.getItem("authKey"),
    payload = postWrapper({ uid, authKey });

  fetch(`${config.server}/api/users/verify`, {
    method: "POST",
    body: payload
  })
    .then(res => res.json())
    .then(data => {
      if (data.code !== 200)
        window.location.href = "/login";
    });
};

export default verifyIdentity;
