import { configureStore } from "@reduxjs/toolkit";
import api from "api";
import reducers from "reducers";

const logs: any[] = [];
if (process.env.NODE_ENV === "development") {
  const createLogger = require("redux-logger").createLogger;
  logs.push(
    createLogger({
      diff: true,
      timestamp: true,
      collapsed: true,
      duration: true,
    })
  );
}

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {
          api,
        },
      },
    }).concat(...logs),
});

export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
