import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { leetCodeScraper } from "./leetcodeScraper.controllers.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullName, leetcodeId } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Prepare user data
  const userData = {
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    leetcodeId: leetcodeId ? leetcodeId.trim().toLowerCase() : undefined,
  };

  // If leetcodeId is provided, scrape the data before creating user
  if (leetcodeId && leetcodeId.trim()) {
    try {
      const leetcodeData = await leetCodeScraper.scrapeLeetCodeProfile(leetcodeId.trim().toLowerCase());
      
      if (leetcodeData) {
        userData.leetcodeData = {
          totalSolved: leetcodeData.totalSolved || 0,
          easySolved: leetcodeData.easySolved || 0,
          mediumSolved: leetcodeData.mediumSolved || 0,
          hardSolved: leetcodeData.hardSolved || 0,
          ranking: leetcodeData.ranking || 0,
          contestRating: leetcodeData.contestRating || 0,
          streak: leetcodeData.streak || 0,
          acceptanceRate: leetcodeData.acceptanceRate || 0,
          recentSubmissions: leetcodeData.recentSubmissions || [],
          lastUpdated: new Date()
        };
      }
    } catch (error) {
      console.error('Error scraping LeetCode profile during registration:', error);
      // Continue with registration even if scraping fails
    }
  }

  const user = await User.create(userData);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

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
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateLeetCodeProfile = asyncHandler(async (req, res) => {
  const { leetcodeUsername } = req.body;

  if (!leetcodeUsername) {
    throw new ApiError(400, "LeetCode username is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        "leetcodeData.username": leetcodeUsername,
        "leetcodeData.lastUpdated": new Date(),
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "LeetCode profile updated successfully"));
});

const getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id)
    .select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const stats = {
    totalFriends: user.friends ? user.friends.length : 0,
    leetcodeData: user.leetcodeData,
    joinedDate: user.createdAt,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "User stats fetched successfully"));
});

const setLeetCodeId = asyncHandler(async (req, res) => {
  const { leetcodeId } = req.body;

  if (!leetcodeId || leetcodeId.trim() === "") {
    throw new ApiError(400, "LeetCode username is required");
  }

  const trimmedLeetcodeId = leetcodeId.trim().toLowerCase();

  try {
    // Scrape LeetCode profile data
    const leetcodeData = await leetCodeScraper.scrapeLeetCodeProfile(trimmedLeetcodeId);

    if (!leetcodeData) {
      throw new ApiError(404, "LeetCode profile not found. Please check the username.");
    }

    // Update user with leetcodeId and scraped data
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          leetcodeId: trimmedLeetcodeId,
          leetcodeData: {
            totalSolved: leetcodeData.totalSolved || 0,
            easySolved: leetcodeData.easySolved || 0,
            mediumSolved: leetcodeData.mediumSolved || 0,
            hardSolved: leetcodeData.hardSolved || 0,
            ranking: leetcodeData.ranking || 0,
            contestRating: leetcodeData.contestRating || 0,
            streak: leetcodeData.streak || 0,
            acceptanceRate: leetcodeData.acceptanceRate || 0,
            recentSubmissions: leetcodeData.recentSubmissions || [],
            lastUpdated: new Date()
          }
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "LeetCode profile set and data scraped successfully"));

  } catch (error) {
    console.error('Error scraping LeetCode profile:', error);
    throw new ApiError(500, error.message || "Failed to scrape LeetCode profile");
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.leetcodeId) {
    throw new ApiError(400, "User has not set LeetCode username yet");
  }

  // Transform user data to match friend profile structure
  const profileData = {
    _id: user._id,
    leetcodeId: user.leetcodeId,
    name: user.fullName,
    avatar: user.avatar,
    email: user.email,
    username: user.username,
    totalSolved: user.leetcodeData?.totalSolved || 0,
    easySolved: user.leetcodeData?.easySolved || 0,
    mediumSolved: user.leetcodeData?.mediumSolved || 0,
    hardSolved: user.leetcodeData?.hardSolved || 0,
    ranking: user.leetcodeData?.ranking || 0,
    contestRating: user.leetcodeData?.contestRating || 0,
    streak: user.leetcodeData?.streak || 0,
    acceptanceRate: user.leetcodeData?.acceptanceRate || 0,
    recentSubmissions: user.leetcodeData?.recentSubmissions || [],
    lastUpdated: user.leetcodeData?.lastUpdated || user.updatedAt,
    isCurrentUser: true
  };

  return res
    .status(200)
    .json(new ApiResponse(200, profileData, "User profile fetched successfully"));
});

const refreshUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user || !user.leetcodeId) {
    throw new ApiError(400, "User has not set LeetCode username");
  }

  try {
    // Scrape latest data
    const leetcodeData = await leetCodeScraper.scrapeLeetCodeProfile(user.leetcodeId);

    if (!leetcodeData) {
      throw new ApiError(404, "Failed to fetch LeetCode data");
    }

    // Update user's leetcode data
    user.leetcodeData = {
      totalSolved: leetcodeData.totalSolved || 0,
      easySolved: leetcodeData.easySolved || 0,
      mediumSolved: leetcodeData.mediumSolved || 0,
      hardSolved: leetcodeData.hardSolved || 0,
      ranking: leetcodeData.ranking || 0,
      contestRating: leetcodeData.contestRating || 0,
      streak: leetcodeData.streak || 0,
      acceptanceRate: leetcodeData.acceptanceRate || 0,
      recentSubmissions: leetcodeData.recentSubmissions || [],
      lastUpdated: new Date()
    };

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password -refreshToken");

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Profile refreshed successfully"));

  } catch (error) {
    console.error('Error refreshing user profile:', error);
    throw new ApiError(500, "Failed to refresh profile");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateLeetCodeProfile,
  getUserStats,
  setLeetCodeId,
  getUserProfile,
  refreshUserProfile,
};