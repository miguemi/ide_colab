import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Home from "./components/Home/Home";
import Ide from "./components/Ide/Ide";
import './App.scss';

function App() {
  return (
    <>
      <div className="toast">
        <Toaster pposition="top-center"
          toastOptions={{
            success: {
              style: {
                background: '0',
                border: '1px solid #a6a6a6',
                borderRadius: '2px',
                color: '#a6a6a6',
                fontSize: '13px',
                padding: '4px',
                letterSpacing: '1px',
              },
            },
            error: {
              style: {
                background: '0',
                border: '1px solid #a6a6a6',
                borderRadius: '2px',
                color: '#a6a6a6',
                fontSize: '13px',
                padding: '4px',
                letterSpacing: '1px',
              },
            },
          }}>
        </Toaster>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ide/:meetingId" element={<Ide />} />
      </Routes>
    </>
  );
}

export default App;
