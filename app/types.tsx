export type Event = {
  ownerId: string;
  id: number;
  title: string;
  description: string;
  date: string;
  status: "active" | "inactive" | "pending" | "error";
};

export type RootStackParamList = {
  Home: undefined;
  eventDetails: { event: Event };
};

export type Status =
  | "selectATime"
  | "waitingOnOthers"
  | "noTimeFound"
  | "timeFound";

export type StatusData = {
  [key in Status]: {
    color: string;
    icon: string;
  };
};
