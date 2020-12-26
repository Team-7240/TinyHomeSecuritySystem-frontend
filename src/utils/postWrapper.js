const postWrapper = (payload) => {
  const form = new FormData();
  for (const key in payload)
    if (payload.hasOwnProperty(key))
      form.append(key, payload[key]);
  return form;
};

export default postWrapper;