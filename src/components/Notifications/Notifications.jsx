import React, {useState, useEffect, useContext} from "react";
import "./notifications.scss";
import {auth} from "../../firebase";
import {PostContext} from "../../providers/PostsProvider";
import {Link} from "react-router-dom";

const Notifications = (props) => {
  const postsContext = useContext(PostContext);
  const [posts, setPosts] = useState([]);
  const [display, setDiplay] = useState(false)
  const [newPostData, setNewPostData] = useState(null)

  useEffect(() => {
    if(postsContext.length > posts.length) {
      const lastPost = postsContext[postsContext.length - 1]

      setNewPostData({
        id: lastPost.id,
        title: lastPost.title,
        authorUid: lastPost.user.uid,
        author: lastPost.user.displayName.split(" ")[0]
      })

      if(auth.currentUser && newPostData && auth.currentUser.uid !== newPostData.authorUid) {
        setDiplay(true)
  
        setTimeout(() => {
          setDiplay(false)
        }, 5000);
      }
    }

    setPosts(postsContext)

    // eslint-disable-next-line
  }, [postsContext])
  
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
