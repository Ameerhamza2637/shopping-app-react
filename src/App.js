import './App.css';
import { Routes,Route } from "react-router-dom"; 
import {UserAuthprovider} from "./context/User_auth"
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import AllAds from './components/AllAds';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    
    <div className="App">
      <UserAuthprovider>
        <Routes>
          <Route path='/home' element={<ProtectedRoute><Home/></ProtectedRoute>} />
          <Route path='/Login' element={<Login/>}/>
          <Route path='/' element={<Signup/>}/>
          <Route path='/all_ads' element={<AllAds/>}/>
        </Routes>
      </UserAuthprovider>
    </div>
  );
}

export default App;