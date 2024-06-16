import React, { /* useContext, */ useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../firebase';
import { BeatLoader } from 'react-spinners';
import { doc, updateDoc } from 'firebase/firestore';
// import { AuthContext } from '../context/AuthContext';

/* export const Login = () => {
  const [err, setErr] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {currentUser} = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      setIsLoading(true); // Set isLoading to true when sign-in is initiated
      await signInWithEmailAndPassword(auth, email, password);
      await updateDoc(doc(db, "users", currentUser.uid), {
        isOnline: true,
      })
      navigate('/');
    } catch (err) {
      setErr(true);
      setTimeout(() => {
        setErr(false);
      }, 3000); // 3 seconds
    } finally {
      setIsLoading(false); // Set isLoading back to false after sign-in attempt (success or failure)
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="Logo">Lama chat</span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="email" required/>
          <input type="password" placeholder="password" required/>
          {isLoading ? (
            <button disabled>
              <BeatLoader size={8} color={'#123abc'} loading={isLoading} />
            </button>
          ) : (
            <button>Sign in</button>
          )}
          {err && <span className="errorMessage">Invalid Email or password!!!</span>}
        </form>
        <p>
          You don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}; */

export const Login = () => {
  const [err, setErr] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // const {currentUser} = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    setIsLoading(true); // Set isLoading to true when sign-in is initiated
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateDoc(doc(db, "users", user.uid), {
        isOnline: true,
      })
      navigate('/');
    } catch (err) {
      setErr(true);
      setTimeout(() => {
        setErr(false);
      }, 3000); // 3 seconds
    } finally {
      setIsLoading(false); // Set isLoading back to false after sign-in attempt (success or failure)
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="Logo">Chat App</span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="email" required/>
          <input type="password" placeholder="password" required/>
          {isLoading ? (
            <button disabled>
              <BeatLoader size={8} color={'#123abc'} loading={isLoading} />
            </button>
          ) : (
            <button>Sign in</button>
          )}
          {err && <span className="errorMessage">Invalid Email or password!!!</span>}
        </form>
        <p>
          You don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};