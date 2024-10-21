import React from "react";
import { useNavigate } from "react-router-dom";
import welcome from "../images/welcome-pic.jpg";
import "../pageCSS/Welcome.css";

export default function Welcome() {
   const navigate = useNavigate();
   const token = localStorage.getItem("token");
   console.log("token after signout",token);

   const goSignin = () => {
      navigate("/signin");
   };
   const goRegister = () => {
      navigate("/register");
   };

   function WelcomePage() {
      return (
         <div>
            <div className="wel-welcome-header">
               <button className="wel-signin-button" onClick={goSignin}>Sign in</button>
            </div>
            <div>
               <img className="wel-onlinePayment" src={welcome} alt="welcome-pic" />
               <div className="wel-welcome-text">
                  <p className="wel-first-line">Welcome to Bill payment Tracking System</p>
                  <p className="wel-second-line">Doesn't have an account?</p>
               </div>
            </div>
            <div className="wel-page-end">
               <button className="wel-register-button" onClick={goRegister}>Register Now</button>
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