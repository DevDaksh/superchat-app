import React, { useState, useRef } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

var firebaseConfig = {
  apiKey: process.env.REACT_APP_FIRESTORE_API,
  authDomain: "social-app-da391.firebaseapp.com",
  databaseURL: "https://social-app-da391.firebaseio.com",
  projectId: "social-app-da391",
  storageBucket: "social-app-da391.appspot.com",
  messagingSenderId: "216541943540",
  appId: process.env.REACT_APP_FIRESTORE_APP_ID
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <section>
        <Header />
      </section>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button onClick={auth.signOut}>Sign Out</button>
  )
}

function ChatRoom() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(20);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const dummy = useRef();


  const submitMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      photoURL,
      uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    dummy.current.scrollIntoView({ behavior: 'smooth' })
    setFormValue('')
  }
  return (
    <>
      <div>
        <section>
          {messages && messages.map(msg => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}

          <div ref={dummy}></div>
        </section>


        <form onSubmit={submitMessage}>
          <input type="text" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
          <button type='submit'>Submit</button>
        </form>

      </div>
    </>
  )

}

function ChatMessage({ msg, key }) {
  const { photoURL, uid, text } = msg;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  return (
    <div key={key} className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )
}

function Header() {
  return (
    <>
      <div className="header">
        <span>💯⚛🔥</span>
        <button onClick={SignOut}>SignOut</button>
      </div>
    </>
  )
}

export default App;
