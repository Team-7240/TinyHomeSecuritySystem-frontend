import config from "../config";

export const checkInstallation = (history, preventReinstall = false) => {
  fetch(`${config.server}/install/status`)
    .then(res => res.json())
    .then(res => {
      if (!res.installed)
        window.location.href = "/installer";
      else if (preventReinstall)
        history.push("/");
    })
    .catch(err => {
      history.push("/error/internal");
    });
}

export default checkInstallation;
