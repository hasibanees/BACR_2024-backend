import User from "../models/User.js";
import {mixpanel} from "../server.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const signUp = async (req, res) => {
    const { name, email, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET;

  
    // Input Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      // Check if the email is already registered
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new user
      const user = new User({ name, email, password: hashedPassword });
      await user.save();
  
  
      // Send response
      res.status(201).json({
        message: "User created successfully"
      });
    } catch (error) {      
      res.status(500).json({
        message: "Server error",
        error: error.message || "Something went wrong",
      });
    }
  };
  export const Login = async (req, res) => {
    const { email, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET;
      try {
        const user = await User.findOne({ email }).populate({
          path: 'role',
          populate: {
            path: 'modules', // Populate the modules associated with the role
            model: 'Module', // Reference the Module model
          }
        });
        
        if (!user) {
          return res.status(400).json({ message: "Invalid email or password" });
        }
        console.log(user);

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: "Invalid email orcdd password" });
        }
        mixpanel.people.set(user._id, {
          $name: user.name,
          $email: user.email
      });
      const roles = user.role ? user.role.name : 'No role';        
      const userModules = user.role.modules;
      const modules = userModules.map(module => module.name);


        const token = jwt.sign({ id: user._id,name:user.name,email:user.email,roles,modules  }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token,user });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message || error });
      }
  };
  export const getAllusers = async (req, res) => {
    try {
      const users = await User.aggregate([
        {
          $lookup: {
            from: 'roles', // Ensure this matches your roles collection name
            localField: 'role', // Field in the User document referencing the Role
            foreignField: '_id', // Field in the Role document that is referenced
            as: 'roleDetails', // Alias for the populated role data
          },
        },
        {
          $unwind: {
            path: '$roleDetails', // Unwind roleDetails to work with individual roles
            preserveNullAndEmptyArrays: true, // Include users with no matching role
          },
        },
        {
          $match: {
            $or: [
              { 'roleDetails.name': { $nin: ['superadmin', 'admin'] } }, // Exclude specific roles
              { roleDetails: { $eq: null } }, // Include users with no matching role
            ],
          },
        },
      ]);

      res.status(200).json({ users });
    } catch (error) {
      console.error(error); // Log error for detailed debugging
      res.status(500).json({ message: "Error retrieving users", error });
    }
  };