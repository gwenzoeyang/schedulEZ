// src/tests/cross_reg_travel_test.ts
import { assert, assertEquals, assertThrows } from "@std/assert";

import {
  CrossRegTravel,
  EXCHANGE_BUS_TIMES,
  type ExchangeStop,
} from "/Users/gwen-zoeyang/schedulEZ/src/CrossRegTravel.ts";

Deno.test("CrossRegTravel.getArrivalTime maps by index across stops", () => {
  const x = new CrossRegTravel();
  const origin: ExchangeStop = "Wellesley Chapel";
  const dest: ExchangeStop = "Alumnae Hall";
  const timeToLeave = EXCHANGE_BUS_TIMES[origin][0]; // "7:30 am" in your table
  const expected = EXCHANGE_BUS_TIMES[dest][0]; // aligned index
  const got = x.getArrivalTime(origin, dest, timeToLeave);
  assertEquals(got, expected);
});

Deno.test("CrossRegTravel.getDepartureTime maps by index across stops", () => {
  const x = new CrossRegTravel();
  const origin: ExchangeStop = "Wellesley Chapel";
  const dest: ExchangeStop = "Alumnae Hall";
  const timeToArrive = EXCHANGE_BUS_TIMES[dest][1]; // "9:05 am"
  const expected = EXCHANGE_BUS_TIMES[origin][1]; // "9:00 am"
  const got = x.getDepartureTime(origin, dest, timeToArrive);
  assertEquals(got, expected);
});

Deno.test("CrossRegTravel throws when time not found at origin/destination", () => {
  const x = new CrossRegTravel();
  assertThrows(
    () =>
      x.getArrivalTime("Wellesley Chapel", "Alumnae Hall", "99:99 am" as any),
    Error,
    "Time not found at Wellesley Chapel",
  );
  assertThrows(
    () =>
      x.getDepartureTime("Wellesley Chapel", "Alumnae Hall", "99:99 am" as any),
    Error,
    "Time not found at Alumnae Hall",
  );
});
