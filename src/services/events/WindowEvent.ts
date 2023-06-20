export const CustomEventName = {
  CHANGE_ROUTE: "change_route",
};

export const dispatchChangeRoute = (path: string) => {
  const { CustomEvent } = window;
  const event = new CustomEvent(CustomEventName.CHANGE_ROUTE, {
    detail: path,
  });
  window.dispatchEvent(event);
};
