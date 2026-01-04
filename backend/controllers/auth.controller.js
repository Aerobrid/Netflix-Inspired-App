// user mongoose model is imported to interact with the database
import { User } from "../models/user.model.js";
// library for hashing passwords
import bcryptjs from "bcryptjs"; 
// utility function to generate a token and set it in a cookie
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export async function signup(req, res) {
  try {
    const { email, password, username } = req.body; // destructure the request body to get email, password, and username

    if(!email || !password || !username) {
      // sets HTTP status code and returns a JSON-formatted response (if it succeeded or not and a message ) 
      return res.status(400).json({ success:false, message: "All fields are required"});
    }

    // define a regex pattern to check if an email has the right format
    // (^ = start of string, [^\s@]+ = one or more characters that are not whitespace or @, @ = at sign, [^\s@]+ = one or more characters that are not whitespace or @, \. = dot, [^\s@]+$ = one or more characters that are not whitespace or @ until the end of the string)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(email)) {
      return res.status(400).json({ success:false, message: "Invalid email format"});
    }

    if(password.length < 6) {
      return res.status(400).json({ success:false, message: "Password must be at least 6 characters long"});
    }

    // check if email is already registered
    // findOne is a Mongoose method that finds a single document in the database that matches the query
    const existingUserByEmail = await User.findOne({ email:email });

    if(existingUserByEmail) {
      return res.status(400).json({ success:false, message: "Email already exists"});
    }

    // check if username is already taken
    // findOne is a Mongoose method that finds a single document in the database that matches the query
    const existingUserByUsername = await User.findOne({ username:username });

    if(existingUserByUsername) {
      return res.status(400).json({ success:false, message: "Username already exists"});
    }

    const salt = await bcryptjs.genSalt(10);                    // generate a salt with 10 rounds (the higher the number, the more secure but slower it is)
    const hashedPassword = await bcryptjs.hash(password, salt); // hash the password with the salt we just created

    const PROFILE_PICS = ["/avatar1.png", "/avatar2.png", "/avatar3.png"];

    // randomly select a profile picture from the array of profile pictures
    const image = PROFILE_PICS[Math.floor(Math.random() * PROFILE_PICS.length)];

    const newUser = new User({
      email,
      password: hashedPassword, // store the hashed password instead of the plain text password
      username,
      image
    });

      generateTokenAndSetCookie(newUser._id, res);  // generate a token and set it in a cookie
      await newUser.save();                         // save the user to the database
      // remove password from the response
      // _doc is a property that contains the document data without Mongoose's metadata
      // Mongoose adds some metadata to the document, like _id, __v, etc. _doc is a plain object that contains just the data we want to return
      res.status(201).json({ 
        success: true,
        user: {
          ...newUser._doc, 
          password: ""
        },
      });
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if(!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email: email });
    if(!user) {
      return res.status(404).json({ success: false, message: "Invalid credentials" });  // invalid credentials so that user doesn't know if email or password is wrong which is a good security practice
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);          // compare the plain text password with the hashed password in the database

    if(!isPasswordCorrect) {
      return res.status(404).json({ success: false, message: "Invalid credentials" });  // invalid credentials so that user doesn't know if email or password is wrong which is a good security practice
    }

    generateTokenAndSetCookie(user._id, res);                                           // generate a token and set it in a cookie

    res.status(200).json({ 
      success: true, 
      user: {
        ...user._doc,             // spread the user document to return all fields except password
        password: ""              // remove password from the response
      } 
    });
  } catch (error) {
    console.log("Error in login controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });  
  }
}

export async function logout(req, res) {
  try {
    // Clear the cookie by name
    res.clearCookie("jwt-netflix"); 
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" }); 
  }
}

export async function authCheck(req, res) {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('req.user:', req.user); // for debugging purposes
    }
    res.status(200).json({ success: true, user: req.user }); // req.user is set by the protectRoute middleware
  } catch (error) {
    console.log("Error in authCheck controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}