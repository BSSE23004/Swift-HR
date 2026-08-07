// App Component
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { EmployeeForm } from './features/employeeForm/components/EmployeeForm';

function App() {
  return (
    <Provider store={store}>
      <div className="app">
        <EmployeeForm />
      </div>
    </Provider>
  );
}

export default App;