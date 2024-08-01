import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  const { token } = await req.body;
  // const token = req.headers["authorization"];
  console.log("server token get", token);
  try {
    if (!token) {
      return res
        .status(403)
        .json({ message: "Unauthorized, JWT token is required" });
    }

    // const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    // const useremail = decoded.email;

    // User.findOne({ email: useremail }).then((data) => {
    //   console.log(data);
    //   return res.send({ status: "Ok", data: data });
    // });

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Unauthorized, JWT token wrong or expired" });
  }
};
