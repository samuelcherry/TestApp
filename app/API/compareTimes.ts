import { TimesObject, TimeSlot } from "../types";

export const compareTimes = (times: TimesObject): TimeSlot[] => {
  const users = Object.keys(times);
  const dateTimeMaps: { [username: string]: Set<string> } = {};

  for (const [username, dateMap] of Object.entries(times)) {
    const dateTimeSet = new Set<string>();

    for (const [date, timeArray] of Object.entries(dateMap)) {
      for (const time of timeArray) {
        dateTimeSet.add(`${date}|${time}`);
      }
    }

    dateTimeMaps[username] = dateTimeSet;
  }
  const allDateTimeSets = Object.values(dateTimeMaps);
  if (allDateTimeSets.length === 0) return [];

  const commonDateTimes = [...allDateTimeSets[0]].filter((entry) =>
    allDateTimeSets.every((set) => set.has(entry))
  );

  const result: TimeSlot[] = commonDateTimes.map((entry) => {
    const [date, time] = entry.split("|");
    return { date, time };
  });

  console.log("Common date+time:", result);
  return result;
};
