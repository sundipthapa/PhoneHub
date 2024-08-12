import React, { Fragment, useReducer } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Routes from "./components";
import { LayoutContext, layoutState, layoutReducer } from "./components/shop";


function App() {
  const [data, dispatch] = useReducer(layoutReducer, layoutState);
  return (
    <Fragment>
      <LayoutContext.Provider value={{ data, dispatch }}>
        <Routes />
        <ToastContainer />

      </LayoutContext.Provider>
    </Fragment>
  );
}

export default App;
