import {create} from 'zustand';

type QueuedRequestError = {
  error: Error;
  id: number;
};

type RequestErrorQueueState = {
  nextId: number;
  queue: QueuedRequestError[];
  consume: (id: number) => void;
  enqueue: (error: Error) => void;
  reset: () => void;
};

const useRequestErrorQueueStore = create<RequestErrorQueueState>(set => ({
  nextId: 1,
  queue: [],
  consume: id =>
    set(state => ({
      queue: state.queue.filter(item => item.id !== id),
    })),
  enqueue: error =>
    set(state => ({
      nextId: state.nextId + 1,
      queue: [...state.queue, {error, id: state.nextId}],
    })),
  reset: () =>
    set({
      nextId: 1,
      queue: [],
    }),
}));

function enqueueRequestError(error: Error) {
  useRequestErrorQueueStore.getState().enqueue(error);
}

function consumeRequestError(id: number) {
  useRequestErrorQueueStore.getState().consume(id);
}

function resetRequestErrorQueue() {
  useRequestErrorQueueStore.getState().reset();
}

function useNextRequestError() {
  return useRequestErrorQueueStore(state => state.queue[0] ?? null);
}

export {consumeRequestError, enqueueRequestError, resetRequestErrorQueue, useNextRequestError};
export type {QueuedRequestError};
