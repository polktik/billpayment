import logo from './logo.svg';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from './pageJS/Welcome';
import Signin from './pageJS/Signin';
import Register from './pageJS/Register';
import Home from './pageJS/Home';
import Addbill from './pageJS/Addbill';
import AddMobile from './pageJS/AddMobile';
import AddCredit from './pageJS/AddCredit';
import AddUtil from './pageJS/AddUtil';
import Removebill from './pageJS/Removebill';
import Updatebill from './pageJS/Updatebill';
import Forgot from './pageJS/Forgot';
import ResetPassword from './pageJS/ResetPassword';
import Settings from './pageJS/Settings';
import ChangePassword from './pageJS/ChangePassword';
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
        <Route path="/addbill" element={<Addbill/>}/>
        <Route path="/addmobile" element={<AddMobile/>}/>
        <Route path="/addcredit" element={<AddCredit/>}/>
        <Route path="/addutil" element={<AddUtil/>}/>
        <Route path="/removebill" element={<Removebill/>}/>
        <Route path="/updatebill" element={<Updatebill/>}/>
        <Route path='/settings' element={<Settings/>}/>
        <Route path='/changepassword' element={<ChangePassword/>}/>
      </Routes>
    </Router>
  );
}

export default App;
