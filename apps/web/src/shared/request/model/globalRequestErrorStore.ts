import {create} from 'zustand';

type GlobalRequestErrorStore = {
  error: Error | null;
  reset: () => void;
  updateError: (error: Error | null) => void;
};

const useGlobalRequestErrorStore = create<GlobalRequestErrorStore>(set => ({
  error: null,
  reset: () => set({error: null}),
  updateError: error => set({error}),
}));

function useGlobalRequestError() {
  return useGlobalRequestErrorStore(state => state.error);
}

function useUpdateGlobalRequestError() {
  return useGlobalRequestErrorStore(state => state.updateError);
}

function useResetGlobalRequestError() {
  return useGlobalRequestErrorStore(state => state.reset);
}

export {useGlobalRequestError, useGlobalRequestErrorStore, useResetGlobalRequestError, useUpdateGlobalRequestError};
export type {GlobalRequestErrorStore};
