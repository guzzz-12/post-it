import React, {useState, useEffect, useContext} from "react";
import "./notifications.scss";
import {auth} from "../../firebase";
import lastPostContext from "../../context/lastPost/lastPostContext";
import {Link} from "react-router-dom";

const Notifications = (props) => {
  const LastPostContext = useContext(lastPostContext);

  const [newPostData, setNewPostData] = useState(null);
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    if(LastPostContext.lastPost) {
      if(auth.currentUser && auth.currentUser.uid !== LastPostContext.lastPost.user.uid) {
        setNewPostData(LastPostContext.lastPost)
        setDisplay(true)
  
        setTimeout(() => {
          setDisplay(false)
          LastPostContext.clearLastPost()
        }, 5000)
      }
      
    } else {
      setDisplay(false)
      setNewPostData(null)
    }

    // eslint-disable-next-line
  }, [LastPostContext])
  
  return (
    <div className={`${display ? "notifications notifications--show" : "notifications"}`}>
      <Link to={`/post/${newPostData && newPostData.id}`}>
        <div className="notifications__content">
          <h3>{newPostData && newPostData.author} added a new post!</h3>
          <p>{newPostData && newPostData.title}</p>
        </div>
      </Link>
    </div>
  );
}

export default Notifications;
