export type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
};

export type RootStackParamList = {
  Home: undefined;
  eventDetails: { event: Event };
};
