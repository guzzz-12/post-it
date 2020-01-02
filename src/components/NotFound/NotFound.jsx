import React from "react";
import "./notFound.scss";

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found__wrapper">
        <h1>Error 404</h1>
        <i className="fas fa-exclamation-triangle"></i>
        <p>Oops! This page doesn't exist</p>
      </div>
    </div>
  );
}

export default NotFound;
