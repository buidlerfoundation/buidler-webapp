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

export const store = configureStore({
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

export const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            api,
          },
        },
      }).concat(...logs),
    preloadedState,
  });
};


export type RootState = ReturnType<typeof reducers>
export type AppRootState = ReturnType<typeof store.getState>;
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = typeof store.dispatch;
