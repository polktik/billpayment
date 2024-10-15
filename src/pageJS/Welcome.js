import React from "react";
import { useNavigate } from "react-router-dom";
import welcome from "../images/welcome-pic.jpg";
import "../pageCSS/Welcome.css";

export default function Welcome() {
   const navigate = useNavigate();

   const goLogin = () => {
      navigate("/login");
   };

   function test() {
      return (
         <div>
            <div className="welcome-header">
               <button className="signin-button" onClick={goLogin}>Sign In</button>
            </div>
            <img src={welcome} alt="welcome-pic" />
         </div>
      );
   };

   return (
      <>
         {test()}
      </>
   );
}