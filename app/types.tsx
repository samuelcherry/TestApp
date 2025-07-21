export type Event = {
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
