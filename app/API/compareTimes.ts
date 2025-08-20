import { TimesObject, TimeSlot } from "../types";
//if all the participants have submitted times, check if there are any times in common and set status accordingly
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
  if (allDateTimeSets.length === 0) {
    console.log("No matching times");
    return [];
  }
  const commonDateTimes = [...allDateTimeSets[0]].filter((entry) =>
    allDateTimeSets.every((set) => set.has(entry))
  );

  const result: TimeSlot[] = commonDateTimes.map((entry) => {
    const [date, time] = entry.split("|");
    return { date, time };
  });

  if (result.length === 0) {
    return result;
  }

  console.log("Common date+time:", result);
  return result;
};
