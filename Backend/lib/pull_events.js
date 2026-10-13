const subscribers = new Set();

export const publish = (type, data) => {
  const event = { type, data };
  for (const subscriber of subscribers) subscriber(event);
};

export const subscribe = (subscriber) => {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
};
