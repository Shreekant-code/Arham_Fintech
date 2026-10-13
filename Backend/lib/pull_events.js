const subscribers = new Set();
const recentEvents = [];
const maxRecentEvents = 100;
let nextEventId = 1;

export const publish = (type, data) => {
  const event = { id: nextEventId++, type, data };
  recentEvents.push(event);
  if (recentEvents.length > maxRecentEvents) recentEvents.shift();

  for (const subscriber of subscribers) subscriber(event);
};

export const subscribe = (subscriber, lastEventId = 0) => {
  subscribers.add(subscriber);
  for (const event of recentEvents) {
    if (event.id > lastEventId) subscriber(event);
  }

  return () => subscribers.delete(subscriber);
};

export const getLatestEventId = () => nextEventId - 1;
