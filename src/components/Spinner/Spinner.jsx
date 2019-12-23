import React from "react";
import "./spinner.scss";

const Spinner = (props) => {
  return (
    <div
      className="spinner-container"
      style={{
        backgroundColor: `${props.transparent && "transparent"}`,
      }}
    >
      <div
        className="loader"
        style={{
          width: `${props.small && "2rem"}`,
          height: `${props.small && "2rem"}`,
          borderLeft: `${props.white && "0.4rem solid #fff"}`,
          alignSelf: `${props.position}`
        }}
      >
        Loading...
      </div>      
    </div>
  );
}

export default Spinner;