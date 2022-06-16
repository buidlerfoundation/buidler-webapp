import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { logger } from "redux-logger";
import reducers from "../reducers";

const logs: Array<any> = [];
if (process.env.NODE_ENV === "development") {
  logs.push(logger);
}
const store = createStore(reducers, applyMiddleware(...logs, thunk));

export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
