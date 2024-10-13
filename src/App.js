import './style.scss'
import React, { Suspense, lazy, useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ClipLoader } from 'react-spinners';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login').then(module => ({default: module.Login})));
const Register = lazy(() => import('./pages/Register').then(module => ({default: module.Register})));

function App() {
  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="loading"><ClipLoader /></div>}>
        <Routes>
          <Route path="/">
            <Route index element={<ProtectedRoute> 
              <Home />
            </ProtectedRoute>
            }/>
            <Route path="login" element={<Login />}/>
            <Route path="register" element={<Register />}/>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;