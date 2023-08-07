const validateInputs = require('../middleware/validateInputs')
const user = require('../models/user')
const bcrypt = require('bcrypt')

/**
 * Controller function for user signup.
 *
 * @param {Object} req - The request object containing user registration data.
 * @param {Object} res - The response object for sending status or rendering a page.
 * @returns {Promise<void>} - A promise that resolves after processing the signup request.
 */
const signup = async (req, res) => {
  try {
    // Extract user registration data from request body
    const { username, email, password, repassword } = req.body;

    // Check if passwords match
    if (password !== repassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if email already exists in the database
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Validate user inputs
    const isValid = validateInputs(email, username, password);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance and save it to the database
    const newUser = new user({ username, email, password: hashedPassword });
    await newUser.save();

    // Render user profile page after successful signup
    return res.render('userprofile', { user: newUser });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Controller function for user login.
 *
 * @param {Object} req - The request object containing user login data.
 * @param {Object} res - The response object for sending status or rendering a page.
 * @returns {Promise<void>} - A promise that resolves after processing the login request.
 */
const login = async (req, res) => {
  try {
    // Extract user login data from request body
    const { email, password } = req.body;

    // Find the user with the given email
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store the user's session ID and check login status
    req.session.userId = existingUser._id;

    // Rendirect to home page after successful login
    return res.redirect('/');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Controller function for user logout.
 *
 * @param {Object} req - The request object for ending the user session.
 * @param {Object} res - The response object for redirecting to the home page.
 * @returns {void} - This function does not return a value.
 */
const logout = async (req, res) => {
  // Destroy the user's session and redirect to the home page
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
};


module.exports= {signup,login, logout};