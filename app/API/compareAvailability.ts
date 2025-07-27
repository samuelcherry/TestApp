type Availability = Record<string, string[]>;

export function findSharedTimes(
  userA: Availability,
  userB: Availability
): Availability {
  const shared: Availability = {};

  for (const date in userA) {
    if (userB[date]) {
      const timesA = new Set(userA[date]);
      const timesB = new Set(userB[date]);

      const intersection = [...timesA].filter((time) => timesB.has(time));
      if (intersection.length > 0) {
        shared[date] = intersection;
      }
    }
  }

  return shared;
}
