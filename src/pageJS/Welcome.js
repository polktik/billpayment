import React from "react";
import { useNavigate } from "react-router-dom";
import welcome from "../images/welcome-pic.jpg";
import "../pageCSS/Welcome.css";

export default function Welcome() {
   const navigate = useNavigate();

   const goLogin = () => {
      navigate("/login");
   };
   const goRegister = () => {
      navigate("/register");
   };

   function WelcomePage() {
      return (
         <div>
            <div className="welcome-header">
               <button className="signin-button" onClick={goLogin}>Sign In</button>
            </div>
            <div>
               <img className="onlinePayment" src={welcome} alt="welcome-pic" />
               <div className="welcome-text">
                  <p className="first-line">Welcome to Bill payment Tracking System</p>
                  <p className="second-line">Doesn't have an account?</p>
               </div>
            </div>
            <div className="page-end">
               <button className="register-button" onClick={goRegister}>Register Now</button>
            </div>
         </div>
      );
   };

   return (
      <>
         {WelcomePage()}
      </>
   );
}