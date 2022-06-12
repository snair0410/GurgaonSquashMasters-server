import mongoose from "mongoose";
import Ranking from '../models/player.js'
import HttpError from "./http-error.js";

async function findaplayer(name){
    let member
    try {
      member = await Ranking.findOne({playername: name}).exec()
    }
    catch (err){
      const error = new HttpError(
        'Cannot find the member. Please try again',
        500
      );
      return next(error);
    }
    return member
  }
  
  export default findaplayer