import React from "react";
import moment from "moment";

const UserPage = (props) => {
  return (
    <React.Fragment>
      {props.user &&
        <section className="CurrentUser">
          <div className="CurrentUser--profile">
            {props.user.photoURL &&
              <div className="CurrentUser__img-container">
                <img src={props.user.photoURL} alt={props.user.displayName} />
              </div>
            }
            <div className="CurrentUser--information">
              <h2>{props.user.displayName}</h2>
              <p className="email">{props.user.email}</p>
              <p className="created-at">{moment(props.user.createdAt).calendar()}</p>
            </div>
          </div>
        </section>    
      }
    </React.Fragment>
  );
}

export default UserPage;
