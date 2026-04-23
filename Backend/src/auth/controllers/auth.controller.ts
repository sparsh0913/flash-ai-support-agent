import { Request, Response } from "express";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import crypto from "crypto";
import jwt from "jsonWebtoken";
import { config } from "../../config/env.js";
import cookieParser from "cookie-parser";

export async function register(req:Request, res:Response) {

try{
    const {username , email , password} = req.body;


    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    //Check if user already registered
  const isAlreadyRegistered = await userModel.findOne({
    $or:[
        {username},
        {email}
    ]
  });

  if(isAlreadyRegistered){
    return res.status(409).json({
        message:"User already registered"
    })
  }
  
//convert password into hash and save
const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

const user = await userModel.create({
    username,
    email,
    password:hashedPassword
})

const refreshToken = jwt.sign({
    id:user._id
},
  config.JWT_SECRET,
  {
    expiresIn:"7d"
  }
);

const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

const session = await sessionModel.create({
   user: user._id,
   refreshTokenHash,
   ip:req.ip,
   userAgent: req.headers["user-agent"]
})

const accessToken = jwt.sign({
    id:user._id,
    sessionId: session._id
},
  config.JWT_SECRET,
  {
    expiresIn:"15m"
  }
)

res.cookie("refreshToken" , refreshToken, {
    httpOnly:true, //on client side , js will not be able to read data inside cookies
    secure:false,
    sameSite:"lax",
    maxAge:7*24*60*60*1000 //7 days
})

res.status(201).json({
    message:"user registered successfully",
    user:{
        username:user.username,
        email:user.email
    },
    accessToken 
});
}catch(err){
    console.log(err);
    return res.status(500).json({ message: "Server error" });
}
}

export async function login(req:Request, res:Response){

  try{
  const {email , password} = req.body;

  if(!email || !password){
 return res.status(400).json({
   message:"Email and password required"
 });
}

const user = await userModel.findOne({email});

if (!user) {
  return res.status(401).json({
    message: "Invalid email or password"
  });
}

const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

const isPasswordValid = hashedPassword === user.password;

if(!isPasswordValid){
  return res.status(401).json({
    message: "Invalid email or password"
  });
}

const refreshToken = jwt.sign(
  {
    id: user._id
  },
  config.JWT_SECRET,
  {
    expiresIn: "7d"
  }
);

const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

const session = await sessionModel.create({
  user: user._id,
  refreshTokenHash,
  ip: req.ip,
  userAgent: req.headers["user-agent"]
});

const accessToken = jwt.sign(
  {
    id: user._id,
    sessionId: session._id
  },
  config.JWT_SECRET,
  {
    expiresIn: "15m"
  }
);

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

return res.status(200).json({
  message: "Login successful",
  user: {
    id: user._id,
    username: user.username,
    email: user.email
  },
  accessToken
});
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Server error"
    });
  }
}

export async function getMe(req: Request, res: Response) {
  return res.status(200).json({
    user: (req as any).user
  });
}

export async function logout(req: Request, res: Response){

  try{
  const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
       return res.status(400).json({
            message:"refresh token not found"
        })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked:false
    })

    if(!session){
       return res.status(400).json({
            message:"session not found"
        })
    }
    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken");

    res.status(200).json({
        message:"Logged out successfully!"
    })
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Server error"
    });
}
}

export async function refreshToken(req:Request,res:Response){

try{  
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        res.status(401).json({
            message: "Refresh Token not found!"
        })
    };

 const decoded = jwt.verify(refreshToken, config.JWT_SECRET) as jwt.JwtPayload;

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked:false
    })

    if(!session){
       return res.status(200).json({
            message:"invalid refresh token"
        })
    }

    const accessToken = jwt.sign({
        id: decoded.id
    },
    config.JWT_SECRET,
    {
        expiresIn: "15m"
    }
)

const newRefreshToken = jwt.sign({
        id: decoded.id
    },
    config.JWT_SECRET,
    {
        expiresIn: "7d"
    }
)

const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
session.refreshTokenHash = newRefreshTokenHash;
await session.save();

res.cookie("refreshToken",newRefreshToken,{
    httpOnly:true,
    secure:false,
    sameSite:"lax",
    maxAge: 7*24*60*60*1000
})

res.status(200).json({
    message: "Access token refreshed successfully!",
    accessToken
})
} catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Server error"
    });
  }
}
