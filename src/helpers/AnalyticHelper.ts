export const getEventNameByApi = (
  api: string,
  method: string,
  reqBody?: any
) => {
  if (method === "post") {
    if (/team\/invitation\/?.*\/accept/.test(api)) {
      return "Join Community Failed";
    }
    if (/channel\/?.*/.test(api)) {
      return "Create Channel Failed";
    }
    if (/space\/?.*/.test(api)) {
      return "Create Space Failed";
    }
    if (/user\/balance\/?.*/.test(api)) {
      return "Import Token Failed";
    }
    if (/channel\/?.*\/members/.test(api)) {
      return "Join Channel Failed";
    }
  }
  if (method === "delete") {
    if (/space\/?.*/.test(api)) {
      return "Delete Space Failed";
    }
    if (/team\/?.*/.test(api)) {
      return "Delete Community Failed";
    }
  }
  if (method === "put") {
    if (/team\/?.*/.test(api)) {
      return "Edit Community Failed";
    }
    if (/team\/?.*\/admin/.test(api) && !!reqBody.user_ids_to_add) {
      return "Add Admin Failed";
    }
    if (/team\/?.*\/owner/.test(api) && !!reqBody.user_ids_to_add) {
      return "Add Owner Failed";
    }
  }
  switch (`${method}-${api}`) {
    case "post-user/address":
    case "post-user":
      return "Login Failed";
    case "post-team":
      return "Create Community Failed";
    case "put-user":
      return "Edit Profile Failed";
    default:
      return "Api Failed";
  }
};

export const getCategoryByApi = (
  api: string,
  method: string,
  reqBody?: any
) => {
  if (method === "post") {
    if (/team\/invitation\/?.*\/accept/.test(api)) {
      return "Add Community";
    }
    if (/channel\/?.*/.test(api)) {
      return "Add Channel";
    }
    if (/space\/?.*/.test(api)) {
      return "Add Space";
    }
    if (/user\/balance\/?.*/.test(api)) {
      return "Import Token";
    }
  }
  if (method === "delete") {
    if (/space\/?.*/.test(api)) {
      return "Space";
    }
    if (/team\/?.*/.test(api)) {
      return "Community";
    }
  }
  if (method === "put") {
    if (
      /team\/?.*/.test(api) ||
      (/team\/?.*\/(admin|owner)/.test(api) && !!reqBody.user_ids_to_add)
    ) {
      return "Community";
    }
  }
  switch (`${method}-${api}`) {
    case "post-user/address":
    case "post-user":
      return "Login";
    case "post-team":
      return "Add Community";
    case "put-user":
      return "User Profile";
    default:
      return "Api";
  }
};
