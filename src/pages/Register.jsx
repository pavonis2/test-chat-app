import React, { useState } from "react";
import Add from "../img/addAvatar.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { truncateString } from "../components/Functions";
import { BeatLoader } from "react-spinners";

export const Register = () => {
  const [err, setErr] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    // Reset highlighted fields
    setHighlightedFields([]);

    if (!displayName || !email || !password || !file) {
      // Highlight the empty fields
      const fields = [];
      if (!displayName) fields.push(0);
      if (!email) fields.push(1);
      if (!password) fields.push(2);
      if (!file) fields.push(3);
      setHighlightedFields(fields);
      return;
    }

    if (password.length < 8) {
      // Highlight the password field if its length is less than 8 characters
      setHighlightedFields((prevFields) => [...prevFields, 2]);
      return;
    }

    try {
      setIsLoading(true); // Set isLoading to true when sign-in is initiated
      // Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Create a unique image name
      const date = new Date().getTime();
      const storageRef = ref(storage, `${displayName + date}`);

      await uploadBytesResumable(storageRef, file).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            // Update profile
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });
            // Create user on Firestore
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
              isOnline: true,
            });

            // Create empty user chats on Firestore
            await setDoc(doc(db, "userChats", res.user.uid), {});
            navigate("/");
          } catch (err) {
            console.log(err);
            setErr(true);
          }
        });
      });
    } catch (err) {
      setErr(true);
      setTimeout(() => {
        setErr(false);
      }, 3000); // 3 seconds
    } finally {
      setIsLoading(false); // Set isLoading back to false after sign-in attempt (success or failure)
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewURL(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewURL(null);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Chat App</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input
            required
            type="text"
            placeholder="display name"
            className={highlightedFields.includes(0) ? 'highlight' : ''}
            autoFocus
          />
          <input
            required
            type="email"
            placeholder="email"
            className={highlightedFields.includes(1) ? 'highlight' : ''}
          />
          <input
            required
            type="password"
            placeholder="password length minimum 8 characters"
            className={highlightedFields.includes(2) ? 'highlight' : ''}
          />
          <input
            required
            style={{ display: "none" }}
            type="file"
            id="file"
            onChange={handleFileChange}
            className={highlightedFields.includes(3) ? 'highlight' : ''}
            accept="image/*"
          />
          <label htmlFor="file">
            {previewURL ? (
              <>
                <img src={previewURL} alt="" />
                <span style={{color: "grey"}}>{truncateString(selectedFile.name, 20)}</span>
              </>
            ) : (
              <img src={Add} alt="" />
            )}
            <span>{previewURL ? "Change avatar" : "Add an avatar"}</span>
          </label>
          {isLoading ? (
            <button disabled>
              <BeatLoader size={8} color={'#123abc'} loading={isLoading} />
            </button>
          ) : (
            <button>Sign up</button>
          )}
          {err && <span>Something went wrong</span>}
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};
