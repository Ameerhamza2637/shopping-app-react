import { getDocs, collection, serverTimestamp,addDoc, onSnapshot} from "firebase/firestore";
import { query, where, orderBy } from "firebase/firestore";
import { makeStyles } from "@material-ui/core/styles";
import { Link, useNavigate } from "react-router-dom";
import CancelIcon from '@mui/icons-material/Cancel';
import React, { useState, useEffect, useRef } from "react";
import { useUserAuth } from '../context/User_auth';
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { db } from "../firebase";
import './home.css'
import {
  Grid,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  List,
  ListItemAvatar,
  ListItem,
  Avatar,
  ListItemText
} from "@mui/material";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    height: "400px",
  },
  chatArea: {
    flexGrow: 1,
    overflowY: "auto",
    padding: theme.spacing(2),
  },
  chatInput: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));




const AllAds = () => {
  const {user, logout } = useUserAuth();
  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState('');
  const [chatMessages,setChatMessages]=useState([]);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [newMessage, setNewMessage]=useState("");
  const chatting=useRef(null);
  const classes=useStyles();
  const navigate = useNavigate();
  const [postOwner,setpostOwner]=useState({
    name: '',
    userId:'',
  });
  const handleLogout=async (e)=>{e.preventDefault();
    try{
      await logout();
      navigate("/login");
    }
    catch{
      console.log("erroe in logout");
    }
  }
  const fetchMessages = async (senderId, receiverId) => {
    try {
      const chatCollectionRef = collection(db, "msg_data");
      const currentTimestamp = new Date();
      const yesterdayTimestamp = new Date();
      yesterdayTimestamp.setDate(yesterdayTimestamp.getDate() - 1);
      const q = query(
        chatCollectionRef,
        where("sender_id", "in", [senderId, receiverId]),
        where("reciver_id", "in", [senderId, receiverId]),
        where("time", ">=", yesterdayTimestamp),
        where("time", "<=", currentTimestamp),
        orderBy("time", "asc")
      );
      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map((doc) => doc.data());
      console.log("message is fetched",);
      console.log(messages);
      setChatMessages(messages)
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedMessages = snapshot.docs.map((doc) => doc.data());
        setChatMessages(updatedMessages);
      })
      return unsubscribe;
    }
    catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  } ;
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const adsCollection = collection(db, "ads_data");
        const query_pic = await getDocs(adsCollection);
        const adsData = query_pic.docs.map((doc) => doc.data());
        setAds(adsData);
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
      if(ads.length>0)
      {
        chatting.current=fetchMessages(user.uid,selectedAd.userId)
      }
    };
    fetchAds();
  }, [user.uid,selectedAd.userId,ads]);
  
  useEffect(() => {
    if (chatting.current) {
      const unsubscribe = chatting.current; // Get the stored query reference
      return () => {
        unsubscribe();
      };
    }
  }, []);


  const handleAdClick = (ad) => {
    setSelectedAd(ad);
    setpostOwner(ad);
  };
  const handleCloseDialog = () => {
    setSelectedAd('');
  };
const handleSendMessage = async()=>{
  if(newMessage.trim()!=="")
  {
    const msg_details={
      sender_id:user.uid,
      reciver_id:selectedAd.userId,
      msg:newMessage,
      time:serverTimestamp()
    };
    await addDoc(collection(db, "msg_data"),msg_details);
  }
  setNewMessage("");
}
  return (
    <div>
      <div id='Ads_navbar'>
          <p id='webtitle'>Musketeers Bazar</p>
          <div id='adsnav_container'>
            <Link to="/home"><button style={{width: "16vh",height: "43px",borderRadius: "10px",backgroundColor: "rgb(63, 98, 255)", marginRight:"5px", cursor:"pointer"}}>Post Ad</button></Link>
            <input id="search"placeholder='    Search'/>
            <div id='other'>
            <img id='user_img' src={user.photoURL} alt="user"/>
              <button id='logout' onClick={handleLogout} >LogOut</button>
            </div>
          </div>
        </div>
      <Grid container spacing={3}>
        {ads.map((product, index) => (
          <Grid
            key={index}
            item
            xs={12}
            sm={6}
            md={4}
            style={{ display: "flex", cursor: "pointer" }}
            onClick={() => handleAdClick(product)}
          >
            <Paper
              elevation={3}
              style={{
                padding: "10px",
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  flex: 1,
                  marginBottom: "10px",
                  maxHeight: "200px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={product.img}
                  alt={product.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <Typography variant="h6">{product.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                {product.description}
              </Typography>
              <Typography variant="subtitle1" color="primary">
                ${product.price}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Dialog
        open={!!selectedAd}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedAd && selectedAd.title}
          <IconButton
            aria-label="close"
            style={{ position: "absolute", right: 8, top: 8 }}
            onClick={handleCloseDialog}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedAd && (
            <div>
              <img
                src={selectedAd.img}
                alt={selectedAd.title}
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "cover",
                }}
              />
              <Typography variant="body1" color="textSecondary">
                {selectedAd.description}
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
          <Button color="secondary" onClick={()=>{setChatDialogOpen(true);}}>
            Chat
          </Button>
        </DialogActions>
      </Dialog>




      <Dialog open={chatDialogOpen} onClose={handleCloseDialog} Width="50%">
        <DialogTitle>
          <p>Owner Name: {postOwner.name}</p>
          <p>Owner ID: {postOwner.userId}</p>
          <IconButton
            className={classes.closeButton}
            onClick={() => {
              setChatDialogOpen(false);
            }}
          >
            <CloseIcon style={{ color: "red" }} />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <div className={classes.chatArea}>
            <List>
              {chatMessages.map((message, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>{message.sender_id[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      message.sender_id === user.uid ? "You" : postOwner

                    } // Assuming senderId is the current user's ID
                    secondary={message.msg}
                  />
                </ListItem>
              ))}
            </List>
          </div>
          <div className={classes.chatInput}>
            <TextField
              label="Type a message"
              variant="outlined"
              fullWidth
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <IconButton>
              <SendIcon
                style={{ color: "green" }}
                onClick={handleSendMessage}
              />
            </IconButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AllAds;