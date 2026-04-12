import {create} from 'zustand';

type GlobalRequestErrorState = {
  error: Error | null;
  updateError: (error: Error | null) => void;
};

const globalRequestErrorStore = create<GlobalRequestErrorState>(set => ({
  error: null,
  updateError: error => set({error}),
}));

function updateGlobalRequestError(error: Error | null) {
  globalRequestErrorStore.getState().updateError(error);
}

function clearGlobalRequestError() {
  updateGlobalRequestError(null);
}

function resetGlobalRequestError() {
  globalRequestErrorStore.setState({error: null});
}

function useGlobalRequestError() {
  return globalRequestErrorStore(state => state.error);
}

function useUpdateGlobalRequestError() {
  return globalRequestErrorStore(state => state.updateError);
}

export {
  clearGlobalRequestError,
  resetGlobalRequestError,
  updateGlobalRequestError,
  useGlobalRequestError,
  useUpdateGlobalRequestError,
};
