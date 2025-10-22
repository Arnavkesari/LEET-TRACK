import { google } from 'googleapis';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Google OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `http://localhost:8000/api/v1/auth/google/callback` // Backend callback URL
);

// Generate Google OAuth URL
const getGoogleAuthURL = asyncHandler(async (req, res) => {
  const scopes = ['profile', 'email'];
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
  });

  return res.status(200).json(
    new ApiResponse(200, { authUrl }, "Google auth URL generated successfully")
  );
});

// Handle Google OAuth callback
const googleAuthCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    throw new ApiError(400, "Authorization code is required");
  }

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { googleId: googleUser.id },
        { email: googleUser.email }
      ]
    });

    if (user) {
      // Update existing user with Google ID if not set
      if (!user.googleId) {
        user.googleId = googleUser.id;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        googleId: googleUser.id,
        email: googleUser.email,
        fullName: googleUser.name,
        username: googleUser.email.split('@')[0] + '_' + Date.now(), // Generate unique username
        authProvider: 'google',
        isEmailVerified: true
      });
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set cookies
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    };

    // Check if user needs to complete profile
    const redirectPath = !user.leetcodeId 
      ? '/complete-profile?auth=success' 
      : '/dashboard?auth=success';

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .redirect(`${process.env.CORS_ORIGIN}${redirectPath}`);

  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.redirect(`${process.env.CORS_ORIGIN}/?auth=error&message=${encodeURIComponent(error.message)}`);
  }
});

// Handle Google OAuth with token (for popup flow)
const googleAuthWithToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Google token is required");
  }

  try {
    // Verify the token with Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const googleUser = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { googleId: googleUser.sub },
        { email: googleUser.email }
      ]
    });

    if (user) {
      // Update existing user with Google ID if not set
      if (!user.googleId) {
        user.googleId = googleUser.sub;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        googleId: googleUser.sub,
        email: googleUser.email,
        fullName: googleUser.name,
        username: googleUser.email.split('@')[0] + '_' + Date.now(), // Generate unique username
        authProvider: 'google',
        isEmailVerified: true
      });
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set cookies
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    };

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Check if user needs to complete profile (leetcodeId missing)
    const needsProfileCompletion = !loggedInUser.leetcodeId;

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
            needsProfileCompletion
          },
          "User logged in successfully with Google"
        )
      );

  } catch (error) {
    console.error('Google token verification error:', error);
    throw new ApiError(401, "Invalid Google token");
  }
});

export {
  getGoogleAuthURL,
  googleAuthCallback,
  googleAuthWithToken
};
