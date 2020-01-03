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
        }, 6000)
      }
    }

    // eslint-disable-next-line
  }, [LastPostContext])
  
  return (
    <div className={`${display ? "notifications notifications--show" : "notifications"}`}>
      {newPostData && 
        <Link to={`/post/${newPostData.id}`}>
          <div className="notifications__content">
            <h3>{newPostData.user.displayName.split(" ")[0]} added a new post:</h3>
            <p>{newPostData.title.split("").splice(0, 36).join("")}...</p>
          </div>
        </Link>
      }
    </div>
  );
}

export default Notifications;
