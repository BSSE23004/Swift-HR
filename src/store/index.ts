// Redux Store Configuration
import { configureStore } from '@reduxjs/toolkit';
import employeeFormReducer from '../features/employeeForm/store/employeeFormSlice';

export const store = configureStore({
  reducer: {
    employeeForm: employeeFormReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['employeeForm/saveDraft'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;