import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// const generateAccessAndRefereshTokens = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     const accessToken = user.generateAccessToken();
//     const refreshToken = user.generateRefreshToken();

//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     return { accessToken, refreshToken };
//   } catch (error) {
//     throw new ApiError(
//       500,
//       "Something went wrong while generating referesh and access token"
//     );
//   }
// };

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  //console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    // throw new ApiError(400, "All fields are required");
    return res.status(400).send({
      success: false,
      message: "All fields are required",
    });
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    // throw new ApiError(409, "User with email or username already exists");
    return res.status(409).send({
      success: false,
      message: "User already registered",
    });
  }
  //console.log(req.files);
  const emailToValidate = "@";
  if (!email.includes(emailToValidate)) {
    return res.status(409).send({
      success: false,
      message: "Email is not valid!",
    });
    console.log("email is not valid!");
  }
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    // throw new ApiError(500, "Something went wrong while registering the user");
    return res.status(500).send({
      success: false,
      message: "Something went wrong while registering the user",
    });
  }
  res.status(200).send({
    success: true,
    message: "User registered Successfully",
    createdUser,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  console.log(email);

  if (!username && !email) {
    return res.status(404).send({
      success: false,
      message: "All field are required.",
    });
  }

  const oldUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!oldUser) {
    return res.status(404).send({
      success: false,
      message: "User does not exist.",
    });
  }

  const isPasswordValid = await oldUser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res.status(401).send({
      success: false,
      message: "Invalid user credentials.",
    });
  }

  const token = jwt.sign(
    { _id: oldUser._id, email: oldUser.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
  // console.log("token: ",token);

  if (res.status(201)) {
    res.status(200).send({
      success: true,
      message: "login successfully",
      token,
      oldUserId: oldUser._id,
    });
  } else {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "error in login api",
      error,
    });
  }

  //
  // const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
  //   user._id
  // );

  // const loggedInUser = await User.findById(user._id).select(
  //   "-password -refreshToken"
  // );

  // const options = {
  //   httpOnly: true,
  //   secure: true,
  // };

  // return res.status(200);
  // .cookie("accessToken", accessToken, options)
  // .cookie("refreshToken", refreshToken, options)
  // .json(
  //   new ApiResponse(
  //     200,
  //     {
  //       user: loggedInUser,
  //       accessToken,
  //       refreshToken,
  //     },
  //     "User logged In Successfully"
  //   )
  // );
  // .send({ accessToken: accessToken })
});

const logoutUser = asyncHandler(async (req, res) => {
  // await User.findByIdAndUpdate(
  //   req.user._id,
  //   {
  //     $unset: {
  //       refreshToken: 1, // this removes the field from document
  //     },
  //   },
  //   {
  //     new: true,
  //   }
  // );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // return res
  //   .status(200)
  //   .clearCookie("accessToken", options)
  //   .clearCookie("refreshToken", options)
  //   .json(new ApiResponse(200, {}, "User logged Out"));

  // let token = req.headers["authorization"];
  // token = "";

  return res
    .status(200)
    .json({ message: "Logged Out Succesfully", user: null });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
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

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

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

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json({ message: "User Fetched Succesfully", user: req.user });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
};
