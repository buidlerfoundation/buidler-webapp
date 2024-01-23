export const CustomEventName = {
  CHANGE_ROUTE: "change_route",
};

export const dispatchChangeRoute = (path: string, push?: boolean) => {
  if (typeof window !== "undefined") {
    const { CustomEvent } = window;
    const event = new CustomEvent(CustomEventName.CHANGE_ROUTE, {
      detail: {
        path,
        push,
      },
    });
    window.dispatchEvent(event);
  }
};
