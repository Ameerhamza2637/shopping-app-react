import { uploadBytesResumable, getDownloadURL } from "firebase/storage";
import CircularProgress from "@mui/material/CircularProgress";
import { addDoc, collection } from 'firebase/firestore';
import { useUserAuth } from '../context/User_auth';
import myImage from '../images/download.jpg';
import { db, storage } from "../firebase";
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { ref } from "firebase/storage";
// import { useFormik } from "formik";
// import * as Yup from "yup";
import './home.css'

const Home = () => {
    const {user, logout } = useUserAuth();
    const [isLoading, setIsLoading] = useState(false); // Add a state for loading
    const [ad_details,setAd_details]=useState({
      title:'',
      description:'',
      img:'',
      price:'',
      userId: '',
      name:''
    })
    
    const [fieldErrors, setFieldErrors] = useState({
      title: '',
      description: '',
      img: '',
      price: ''
    });
    // const formik = useFormik({
    //   validationSchema: Yup.object({
    //       title: Yup.string().required("Required"),
    //       description: Yup.string().required("Required"),
    //       profilePhoto: Yup.mixed().nullable(),
    //     })
    // });    
   
    

  let name, value;
  const getUserData = (e) => {
    if (e.target.name === "img"){
      name = e.target.name;
      value = e.target.files[0];
      console.log(e.target.files[0])
    } else{
      name = e.target.name;
      value = e.target.value;
    }
    setAd_details({ ...ad_details, [name]: value });
  };

var ads_url='';
    const handleSubmit=(async()=>{
      try{
        setIsLoading(true); // Start loading
        const newFieldErrors = {};
        if (!ad_details.title.trim()) newFieldErrors.title = 'Title is required';
        if (!ad_details.description.trim()) newFieldErrors.description = 'Description is required';
        if (!ad_details.price.trim()) newFieldErrors.price = 'Price is required';
        if (!ad_details.img) newFieldErrors.img = 'Image is required';

        // If there are errors, stop submission and display them
        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
          setIsLoading(false);
          return;
        }
        if(ad_details.img)
        {
            /** @type {any} */
            const metadata = {
              contentType: "image/jpeg",
            };
            const storageRef = ref(storage, "ads_images/" + ad_details.img.name);
            console.log(ad_details.img.name);
            const uploadTask = uploadBytesResumable(storageRef, ad_details.img, metadata);
    
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
              (error) =>
              {
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code)
                {
                  case "storage/unauthorized":
                    // User doesn't have permission to access the object
                    break;
                  case "storage/canceled":
                    // User canceled the upload
                    break;
                  case "storage/unknown":
                    // Unknown error occurred, inspect error.serverResponse
                    break;
                    default:
                      break;
                }
              },
              () =>
              {
                // Upload completed successfully, now we can get the download URL
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log("File available at ", downloadURL);
                    ads_url=downloadURL;
                  console.log("Image URL ", ads_url);
                }).then(()=>{
                  addDoc(collection(db, "ads_data"), {...ad_details,userId: user.uid, img:ads_url,name: user.displayName});
                  console.log("Ads data added")
                }).finally(() => {
                  setIsLoading(false); // Stop loading
                // Clear input fields after successful upload
          setAd_details({
            title: "",
            description: "",
            img: "",
            price: "",
            userId: "",
            name: "",
          });
        });
              }
            );
        }
      }catch(err)
      {
        setIsLoading(false); // Stop loading in case of error
        console.log("ads data not added "+err.message);
      }
    });
    return (
    <div>
      <div id='main'>
        <div id='navbar'>
          <p id='webtitle'>Musketeers Bazar</p>
          <div id='nav_container'>
            <input id="search"placeholder='    Search'/>
            <div id='other'>
              <button id='logout' onClick={(e)=>{e.preventDefault(); logout();}} >LogOut</button>
              <img id='user_img' src={user.photoURL} alt="user"/>
            </div>
          </div>
        </div>
        <div id='data'>
          <div id='form'>
              <p id='statement'>Enter details of the Add</p>
              <input type="text" value={ad_details.title} onChange={getUserData} name="title" id="title" placeholder='  Enter Title' required/>
              {fieldErrors.title && <p className="error">{fieldErrors.title}</p>}
              <input type="text" value={ad_details.price} onChange={getUserData} name="price" id="price" placeholder='  Enter Price' required/>
              {fieldErrors.price && <p className="error">{fieldErrors.price}</p>}
              <input type="text" value={ad_details.description} onChange={getUserData} name="description" id="description" placeholder='  Enter Description' required/>
              {fieldErrors.description && <p className="error">{fieldErrors.description}</p>}
              <input type="file" onChange={getUserData} name="img" id="img_path" accept="image/*"/>
              {fieldErrors.img && <p className="error">{fieldErrors.img}</p>}
              <div id="btn_area">
                <button id='button1' onClick={handleSubmit} disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : "Upload"}</button>
                <Link to="/all_ads"><button style={{width: "25vh",height: "100%",borderRadius: "10px",backgroundColor: "rgb(61, 145, 255)" ,cursor:"pointer"}} >All Ads</button></Link>
              </div>
          </div>
          <div id='user'>
            <p id='user_p'>Welcome {user.displayName}</p>
            <img id="home_img" src={myImage} alt="home" />
          </div>
        </div>
      </div>
    </div>
  )
}
export default Home