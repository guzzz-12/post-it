import React from "react";
import "./footer.scss";

const Footer = () => {
  return (
    <div className="main-footer">
      <div className="main-footer__container">
        <p>Developed by: Jesús Guzmán - &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

export default Footer;
