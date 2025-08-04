export type Event = {
  ownerId: string;
  id: number;
  title: string;
  description: string;
  date: string;
  status: {
    [username: string]: Status;
  };
};

export type RootStackParamList = {
  Home: undefined;
  eventDetails: { event: Event };
};

export type Status =
  | "selectATime"
  | "waitingOnOthers"
  | "noTimeFound"
  | "timeFound"
  | "ready"
  | "not ready";

export type StatusData = {
  [key in Status]: {
    color: string;
    icon: string;
  };
};

export type TimesObject = {
  [username: string]: {
    [date: string]: string[];
  };
};

export type TimeSlot = {
  date: string;
  time: string;
};
