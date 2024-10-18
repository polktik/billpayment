import logo from './logo.svg';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from './pageJS/Welcome';
import Signin from './pageJS/Signin';
import Register from './pageJS/Register';
import Home from './pageJS/Home';
import Forgot from './pageJS/Forgot';
import ResetPassword from './pageJS/ResetPassword';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forgot" element={<Forgot/>}/>
        <Route path="/resetpassword" element={<ResetPassword/>}/>
      </Routes>
    </Router>
  );
}

export default App;
