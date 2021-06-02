import React, { useContext, useState } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import './Login.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle} from '@fortawesome/free-brands-svg-icons'
import { UserContext } from '../../App';
import { useHistory, useLocation } from 'react-router';


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
 }else {
    firebase.app();
 }
const Login = () => {
    const history = useHistory();
    const location = useLocation();
    const { from } = location.state || { from: { pathname: "/" } };

    const [loggedInUser,setLoggedInUser]= useContext(UserContext);
    const handleGoogleSignIn = ()=> {
        var provider = new firebase.auth.GoogleAuthProvider();
                firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            const {displayName, email} = user;
            const signedInUser = {name:displayName , email};
            setLoggedInUser(signedInUser);
            history.replace(from);
            console.log('signedIn user is', loggedInUser);
        }).catch((error) => {
            var errorMessage = error.message;
            console.log(errorMessage);
        });
    }


    // Handle SignIn with email and password
    const [newUser,setNewUser] = useState(false);
    const [user,setUser]= useState({
        isSignedIn:false,
        userName:'',
        email:'',
        password:'',
        photo:''
      })


      // Handle error
      const handleError = ()=> {
        const passwordValue = document.getElementById("password").value;
        const confirmPasswordValue = document.getElementById("confirmPassword").value;
        const unMatchPassword = document.getElementById("unMatchPassword");
        if (passwordValue !== confirmPasswordValue) {
          unMatchPassword.style.display ="block";
        }
      }
       //Handle blur
       const handleBlur=(event)=>{
        let isFormValid=true;
        if (event.target.name ==='email') {
          const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          isFormValid =  re.test(String(event.target.value).toLowerCase());
          const isFormValid2 =  re.test(String(event.target.value).toLowerCase());
          if(!isFormValid2){
            document.getElementById("inValidMail").style.display="block";
            document.getElementById("inValidPassword").style.display = "none";
            document.getElementById("unMatchPassword").style.display="none";
          }
        }
        if (event.target.name === 'password') {
          const isPasswordValid = event.target.value.length >6;
          const passHasNumber = /\d{1}/.test(event.target.value);
          const passwordValue = document.getElementById("password").value;
          const confirmPasswordValue = document.getElementById("confirmPassword").value
          const isPasswordSame = passwordValue === confirmPasswordValue;
          if(!isPasswordValid || !passHasNumber){
            document.getElementById("inValidPassword").style.display = "block";
            document.getElementById("unMatchPassword").style.display="none";
            document.getElementById("inValidMail").style.display="none";    
          }
          isFormValid = isPasswordValid && passHasNumber && isPasswordSame;
        }
        if(isFormValid) {
          const newUserInfo = {...user, [event.target.name] : event.target.value};
          setUser(newUserInfo);
        }
      }


      //Handle submit
      const handleSubmit = (e)=>{
        e.preventDefault(); 
        // for a new user
        if(newUser && user.email && user.password){
          firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
            .then((userCredential) => {
              var User = userCredential.user;
              updateUserName(user.userName);
              setLoggedInUser(user);
              history.replace(from);
              const newUserInfo = {...User , error :'' , success : true};
              setUser(newUserInfo);
            })
            .catch((error) => {
              var errorCode = error.code;
              var errorMessage = error.message;
              console.log(errorCode , errorMessage);
              const newUserInfo = {...user, error: errorMessage , success: false};
              setUser(newUserInfo);
            });
          console.log("Form submitted");
        }
        // for a old user
        if(!newUser && user.email && user.password){
          firebase.auth().signInWithEmailAndPassword(user.email, user.password)
            .then((userCredential) => {
              const oldUser = userCredential.user;
              setLoggedInUser(oldUser);
              history.replace(from);
              const newUserInfo = {...oldUser, error:'', success:true}
              setUser(newUserInfo);
            })
            .catch((error) => {
              var errorCode = error.code;
              var errorMessage = error.message;
              const newUserInfo = {...user, error:errorMessage, success:false}
              setUser(newUserInfo);
            });
        }
      }

    //   User Name update
      const updateUserName = userName =>{
        var user = firebase.auth().currentUser;
          user.updateProfile({
            displayName: userName,
          }).then(function() {
            console.log("User successfully updated");
          }).catch(function(error) {
            console.log(error);
          });
      }
      
      //Login and Registration page handling
      const handleRegistrationPageView =()=>{
          document.getElementById("registrationPage").style.display='block';
          document.getElementById("loginPage").style.display='none';
      }
      const handleLoginPageView =()=>{
        document.getElementById("loginPage").style.display='block';
        document.getElementById("registrationPage").style.display='none';
    }

    return (
        <div className="container">
            {/* Login Form */}
            <div className="loginPage" id="loginPage">
                <h2>Login</h2>
                <form action="" onSubmit={handleSubmit}>
                <input type="email" onBlur={handleBlur} name="email" id="" placeholder="Email" required/>
                <br/>
                <input type="password" onBlur={handleBlur} name="password" id="" placeholder="Password" required/>          
                <button onClick={handleError} className="loginBtn btn btn-warning"><input type="submit" value="Login"/></button>
                </form>
                <p>Don't have an account? <a onClick={handleRegistrationPageView} ><span onClick={()=>{setNewUser(!newUser)}} >Create an account</span></a></p>
                <h5 id="inValidMail" style={{color:'red', textAlign:'center'}}>Please give a correct email address</h5>
                <h5 id="inValidPassword" style={{color:'red', textAlign:'center'}}>Please give the correct password</h5>
                <h3 style={{color:'red'}}>{user.error}</h3>
                {
                    user.success && <h3 style={{color:'green'}}>User Logged in successfully</h3>
                }
             </div>   
             {/* Registration form     */}
            <div className="registration" id="registrationPage">
                <h2>Create an account</h2>
                <form action="" onSubmit={handleSubmit}>
                <input type="text" name="userName" onBlur={handleBlur} placeholder="Name" />
                <input type="email" onBlur={handleBlur} name="email" id="" placeholder="Email" required/>
                <br/>
                <input type="password" onBlur={handleBlur} name="password" id="password" placeholder="Password" required/>
                <input type="password" onBlur={handleBlur} name="confirmPassword" id="confirmPassword" placeholder="Confirm Password" required/>          
                <button  onClick={handleError}  className="loginBtn btn btn-warning"><input type="submit" value="Create an account"/></button>
                </form>
                <p>Already have an account? <a onClick={handleLoginPageView}><span onClick={()=>{setNewUser(newUser)}}>Login</span></a></p>
                <h5 id="unMatchPassword" style={{color:'red', textAlign:'center'}}>Please make sure your password matched</h5>
                <h5 id="inValidMail" style={{color:'red', textAlign:'center'}}>Please set a valid email address</h5>
                <h5 id="inValidPassword" style={{color:'red', textAlign:'center'}}>Please set a password greater than 6 character and containing at least a number</h5>
                <h3 style={{color:'red'}}>{user.error}</h3>
                {
                    user.success && <h3 style={{color:'green'}}>User Created successfully</h3>
                }
            </div>   
            <p className="line"><span>Or</span></p>
            <button onClick={handleGoogleSignIn} className="btn btn-primary googleBtn"><FontAwesomeIcon className="icon" icon={faGoogle} />  Continue with Google</button>
            <br/>
        </div>
    );
};

export default Login;