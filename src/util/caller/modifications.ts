import { ok, err } from "true-myth/result";
type Result<T, E> = import("true-myth").Result<T, E>;
import { Value } from "./caller";

function dateUTCMillisec(s: string, add = 0): Result<Value, string> {
  if (s.length === 0) return ok("");
  let d = new Date(s);
  if (d.toString() === "Invalid Date") return err("Invalid date");
  let offset = d.getTimezoneOffset();
  d.setMinutes(d.getMinutes() + offset + add);
  return ok(d.valueOf().toString());
}

export const modifyString = {
  dateUTCMillisec: (s: string): Result<Value, string> => {
    return dateUTCMillisec(s);
  },
  dateRangeStart: (s: string) => {
    return dateUTCMillisec(s);
  },
  dateRangeEnd: (s: string) => {
    return dateUTCMillisec(s, 1439);
  },
};
