import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { BeatLoader } from 'react-spinners';
import { doc, updateDoc } from 'firebase/firestore';
import testUserCredentials from "../testUserCredentials";

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateDoc(doc(db, 'users', user.uid), {
        isOnline: true,
      });

      navigate('/');
    } catch (err) {
      setErr(true);
      setTimeout(() => {
        setErr(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUserLogin = async () => {
    setEmail(testUserCredentials.email);
    setPassword(testUserCredentials.password);

    // Wait for the state to update before attempting to submit
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, 'ron@gmail.com', 'trial1234');
      const user = userCredential.user;

      await updateDoc(doc(db, 'users', user.uid), {
        isOnline: true,
      });

      navigate('/');
    } catch (err) {
      setErr(true);
      setTimeout(() => {
        setErr(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="Logo">Chat App</span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {isLoading ? (
            <button disabled>
              <BeatLoader size={8} color={'#123abc'} loading={isLoading} />
            </button>
          ) : (
            <button type="submit">Sign in</button>
          )}
          <div>------------------------ Or ------------------------</div>
          {isLoading ? (
            <button disabled>
              <BeatLoader size={8} color={'#123abc'} loading={isLoading} />
            </button>
          ) : (
            <button type="button" onClick={handleTestUserLogin}>Demo User</button>
          )}
          {err && <span className="errorMessage">Incorrect Email or password!!!</span>}
        </form>
        <p>
          You don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};