import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({

     user: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"users",
    required:[true, "User is required"]
     },

     refreshTokenHash:{
        type:String,
        required:[true,"Refresh Token is required"]
     },
     ip:{
        type:String,
        required:[true,"IP address is required"]
     },
      userAgent:{        //client is using which browser , what version
        type:String,
        required:[true,"User agent is required"]
     },
     revoked:{
        type:Boolean,
        default:false
     },
},
 {
    timestamps:true
})

const sessionModel = mongoose.model("Session", sessionSchema);

export default sessionModel;