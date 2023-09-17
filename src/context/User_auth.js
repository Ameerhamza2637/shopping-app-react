import { createContext, useContext, useEffect, useState } from "react";
import { uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { ref } from "firebase/storage";
export const userAuth = createContext();


export function UserAuthprovider({ children }) {
  const [user, setUser] = useState("");
var imageURL="";
  const register = async (user_data) => {
    const userRes = await createUserWithEmailAndPassword(auth, user_data.email, user_data.password)
        try {
          const { name: displayName } = user_data;
          await updateProfile(auth.currentUser, { displayName });
          console.log("display name is set")
        } catch (err) {
          console.log(err.message);
        }
        // Create the file metadata
        /** @type {any} */
        const metadata = {
          contentType: "image/jpeg",
        };

        // Upload file and metadata to the object 'images/mountains.jpg'
        const storageRef = ref(storage, "images/" + user_data.profilePhoto.name);
        const uploadTask = uploadBytesResumable(storageRef, user_data.profilePhoto, metadata);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
                default:
                    break;
            }
          },
          (error) => {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
              case "storage/unauthorized":
                // User doesn't have permission to access the object
                break;
              case "storage/canceled":
                // User canceled the upload
                break;

              // ...

              case "storage/unknown":
                // Unknown error occurred, inspect error.serverResponse
                break;
                default:
                    break;
            }
          },
          () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                console.log("File available at ", downloadURL);
                imageURL=downloadURL;
              console.log("Image URL ", imageURL);
            }).then(async()=>{
              await updateProfile(auth.currentUser, {photoURL: imageURL})
              console.log("imageUrl "+auth.currentUser.photoURL)
              console.log(userRes);
              try {
                const payload ={
                  name: user_data.name,
                  email: user_data.email,
                  password: user_data.password,
                  gender: user_data.gender,
                  dob: user_data.dob,
                  country: user_data.country,
                  profile_pic:imageURL
                };
                await setDoc(doc(db, "user_data",userRes.user.uid),payload );   
                console.log("details written with ID: ", payload.id);
              } catch(err){
                console.log(err);
                console.log("error in adding details");
              }
            })
          }
        );
  };
  const logIn = async (user_data) => {
    await signInWithEmailAndPassword(auth, user_data.email, user_data.password);
  };
  const logout = async () => {
    await signOut(auth);
  };
  useEffect(() => {
    const unsubcribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => {
      unsubcribe();
    };
  }, []);
  return (
    <userAuth.Provider value={{ user, logIn, register, logout }}>
      {children}
    </userAuth.Provider>
  );
}
export function useUserAuth() {
  return useContext(userAuth);
}
