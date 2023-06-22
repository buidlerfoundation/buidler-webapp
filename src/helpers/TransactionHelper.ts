import { TransactionApiData } from "models/User";
import { dateFormatted } from "utils/DateUtils";

export const normalizeTransactionData = (tx: Array<TransactionApiData>) => {
  return tx.reduce<Array<{ date: string; items: Array<TransactionApiData> }>>(
    (result, val) => {
      const date = dateFormatted(
        parseInt(val.time_stamp) * 1000,
        "MMM DD, YYYY"
      );
      if (!result.find((el) => el.date === date)) {
        return [...result, { date, items: [val] }];
      }
      return result.map((el) => {
        if (el.date === date) {
          el.items = [...el.items, val];
        }
        return el;
      });
    },
    []
  );
};
