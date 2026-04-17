const superjson = {
  serialize: (value: unknown) => ({ json: value }),
  deserialize: <T>(value: T) => value,
};

export default superjson;
