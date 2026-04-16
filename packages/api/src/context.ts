export type HomeServicePort = {
  getSummary: () => Promise<string>;
};

export type AppContext = {
  services: {
    home: HomeServicePort;
  };
};
