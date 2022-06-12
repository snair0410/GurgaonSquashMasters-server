import express from 'express'
import mongoose from 'mongoose'
import Ranking from '../models/player.js'
import Match from '../models/matches.js';
import findaplayer from '../utils/findaplayer.js'
import HttpError from '../utils/http-error.js';

const router = express.Router();

export const createPlayer = async (req, res, next) => {
    const { urlPath, pname, points, created } = req.body;

 const playerWeightedPoints = +((points * 75) / 100).toFixed(2)

    const newRankingEntry = new Ranking(
        { memberimageurl : urlPath,
          playername: pname,
          totalpoints: points,
          totalweightedpoints: playerWeightedPoints,
          membersince: created,
        })
    try {
        await newRankingEntry.save();

        res.status(201).json(newRankingEntry );
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const addMatch = async (req, res, next) => {
    const {playerOneName, playerTwoName, winningPlayer, losingPlayer, scoreline, tournamentName} = req.body
    const wPlayer = await findaplayer(winningPlayer)
    const lPlayer = await findaplayer(losingPlayer)
    
    let differenceInRanking = 0
    let wPlayerRankingPoints = 0
    let differenceInFdr = 0
    let wPlayerMatchPoints = 0
    let lPlayerMatchPoints = 0
    let wPlayerTotalMatchPoints = 0
    let lPlayerTotalMatchPoints = 0
    let wPlayerTournamentMatchesPlayed
    let lPlayerTournamentMatchesPlayed
    let wPlayerTotalMatchesPlayed
    let lPlayerTotalMatchesPlayed
    let wPlayerTotalMatchesWon
    let lPlayerTotalMatchesWon
    let lPlayerTotalMatchesLost
    let wPlayerWinPercentage
    let lPlayerWinPercentage
    let wPlayerFdr
    let lPlayerFdr
    let wPlayerTotalWeightedPoints
    let lPlayerTotalWeightedPoints
    let updateWinningPlayerRecord
    let updateLosingPlayerRecord



    if(tournamentName === 'GSM Edition 1' || tournamentName === 'GSM Edition 2' ||
    tournamentName === 'GSM Edition 3' || tournamentName === 'GSM Edition 4' ||
     tournamentName === 'GSM Edition 5' || tournamentName === 'Challenge Match'){
    if(wPlayer.totalmatchesplayed >=3 && lPlayer.totalmatchesplayed >=3){
        console.log("FOR THE FIRST TIME")
        if(wPlayer.rank === lPlayer.rank){
            differenceInRanking = 0
        }
        if(wPlayer.rank > lPlayer.rank){
            differenceInRanking = wPlayer.rank - lPlayer.rank
            if(differenceInRanking > 0 && differenceInRanking <= 5){
                wPlayerRankingPoints = 0.1
            }
            if(differenceInRanking > 5 && differenceInRanking <= 10){
                wPlayerRankingPoints = 0.2
            }
            if(differenceInRanking > 10 && differenceInRanking <= 15 ){
                wPlayerRankingPoints = 0.3
            }
            if(differenceInRanking > 15 && differenceInRanking <= 20){
                wPlayerRankingPoints = 0.4
            }
        } 
        if(wPlayer.rank < lPlayer.rank){
            differenceInRanking = lPlayer.rank - wPlayer.rank
            if(differenceInRanking > 0 && differenceInRanking <= 5){
                wPlayerRankingPoints = 0.4
            }
            if(differenceInRanking > 5 && differenceInRanking <= 10){
                wPlayerRankingPoints = 0.3
            }
            if(differenceInRanking > 10 && differenceInRanking <= 15 ){
                wPlayerRankingPoints = 0.2
            }
            if(differenceInRanking > 15 && differenceInRanking <= 20){
                wPlayerRankingPoints = 0.1
            }
        }


        if(wPlayer.playerfdr === lPlayer.playerfdr) {
            differenceInFdr = 0
        }
        if(wPlayer.playerfdr > lPlayer.playerfdr) {
            differenceInFdr = 0
        }
        if(wPlayer.playerfdr < lPlayer.playerfdr) {
            differenceInFdr = (lPlayer.playerfdr - wPlayer.playerfdr) * 0.2
        }
        if(scoreline === '3-0' || scoreline === '2-0'){
            wPlayerMatchPoints = 2
            lPlayerMatchPoints = 0
        }
        if(scoreline === '3-1' || scoreline === '2-1'){
            wPlayerMatchPoints = 1.75
            lPlayerMatchPoints = 0.25
        }
        if(scoreline === '3-2'){
            wPlayerMatchPoints = 1.50
            lPlayerMatchPoints = 0.50
        }

        wPlayerTotalMatchPoints = +(wPlayer.totalpoints + wPlayerMatchPoints + wPlayerRankingPoints + differenceInFdr).toFixed(2)
        lPlayerTotalMatchPoints = +(lPlayer.totalpoints + lPlayerMatchPoints).toFixed(2)
        wPlayerTournamentMatchesPlayed = wPlayer.totaltournamentmatchesplayed + 1
        lPlayerTournamentMatchesPlayed = lPlayer.totaltournamentmatchesplayed + 1
        wPlayerTotalMatchesPlayed = wPlayer.totalmatchesplayed + 1
        lPlayerTotalMatchesPlayed = lPlayer.totalmatchesplayed + 1
        wPlayerTotalMatchesWon = wPlayer.totalmatcheswon + 1
        lPlayerTotalMatchesWon = lPlayer.totalmatcheswon
        lPlayerTotalMatchesLost = lPlayer.totalmatcheslost + 1
        wPlayerWinPercentage = +((wPlayerTotalMatchesWon  / wPlayerTotalMatchesPlayed) * 100).toFixed(2)
        lPlayerWinPercentage = +((lPlayerTotalMatchesWon  / lPlayerTotalMatchesPlayed) * 100).toFixed(2)
        wPlayerFdr = +(wPlayerWinPercentage / 10). toFixed(2)
        lPlayerFdr = +(lPlayerWinPercentage / 10). toFixed(2)
        wPlayerTotalWeightedPoints = +((wPlayerTotalMatchPoints * 75 + wPlayerFdr * 20 + wPlayerTotalMatchesPlayed * 5) / 100).toFixed(2)
        lPlayerTotalWeightedPoints = +((lPlayerTotalMatchPoints * 75 + lPlayerFdr  * 20 + lPlayerTotalMatchesPlayed * 5) / 100).toFixed(2)

        try{
            updateWinningPlayerRecord = await Ranking.findOneAndUpdate({ playername: winningPlayer},
                {
                    totaltournamentmatchesplayed: wPlayerTournamentMatchesPlayed,
                    totalmatchesplayed: wPlayerTotalMatchesPlayed,
                    totalmatcheswon: wPlayerTotalMatchesWon,
                    winpercentage: wPlayerWinPercentage,
                    playerfdr: wPlayerFdr,
                    totalpoints: wPlayerTotalMatchPoints,
                    totalweightedpoints: wPlayerTotalWeightedPoints,
                }).exec()
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Cannot update the winning player. Please try again',
                500
              );
              return next(error);
        }

        try{
            updateLosingPlayerRecord = await Ranking.findOneAndUpdate({ playername: losingPlayer},
                {
                    totaltournamentmatchesplayed: lPlayerTournamentMatchesPlayed,
                    totalmatchesplayed: lPlayerTotalMatchesPlayed,
                    totalmatcheslost: lPlayerTotalMatchesLost,
                    winpercentage: lPlayerWinPercentage,
                    playerfdr: lPlayerFdr,
                    totalpoints: lPlayerTotalMatchPoints,
                    totalweightedpoints: lPlayerTotalWeightedPoints,
                }).exec()
        } catch (err) {
            const error = new HttpError(
                'Cannot update the winning player. Please try again',
                500
              );
              return next(error);
        }
     //-below end of total matches greater than 3 check   
    } else {
        if(scoreline === '3-0' || scoreline === '2-0'){
            wPlayerMatchPoints = 2
            lPlayerMatchPoints = 0
        }
        if(scoreline === '3-1' || scoreline === '2-1'){
            wPlayerMatchPoints = 1.75
            lPlayerMatchPoints = 0.25
        }
        if(scoreline === '3-2'){
            wPlayerMatchPoints = 1.50
            lPlayerMatchPoints = 0.50
        }

        wPlayerTotalMatchPoints = wPlayer.totalpoints + wPlayerMatchPoints 
        lPlayerTotalMatchPoints = lPlayer.totalpoints + lPlayerMatchPoints
        wPlayerTournamentMatchesPlayed = wPlayer.totaltournamentmatchesplayed + 1
        lPlayerTournamentMatchesPlayed = lPlayer.totaltournamentmatchesplayed + 1
        wPlayerTotalMatchesPlayed = wPlayer.totalmatchesplayed + 1
        lPlayerTotalMatchesPlayed = lPlayer.totalmatchesplayed + 1
        wPlayerTotalMatchesWon = wPlayer.totalmatcheswon + 1
        lPlayerTotalMatchesWon = lPlayer.totalmatcheswon
        lPlayerTotalMatchesLost = lPlayer.totalmatcheslost + 1
        wPlayerWinPercentage = +((wPlayerTotalMatchesWon  / wPlayerTotalMatchesPlayed) * 100).toFixed(2)
        lPlayerWinPercentage = +((lPlayerTotalMatchesWon  / lPlayerTotalMatchesPlayed) * 100).toFixed(2)
        wPlayerFdr = +(wPlayerWinPercentage / 10). toFixed(2)
        lPlayerFdr = +(lPlayerWinPercentage / 10). toFixed(2)
        wPlayerTotalWeightedPoints = +((wPlayerTotalMatchPoints * 75 + wPlayerFdr * 20 + wPlayerTotalMatchesPlayed * 5) / 100).toFixed(2)
        lPlayerTotalWeightedPoints = +((lPlayerTotalMatchPoints * 75 + lPlayerFdr  * 20 + lPlayerTotalMatchesPlayed * 5) / 100).toFixed(2)

        try{
            updateWinningPlayerRecord = await Ranking.findOneAndUpdate({ playername: winningPlayer},
                {
                    totaltournamentmatchesplayed: wPlayerTournamentMatchesPlayed,
                    totalmatchesplayed: wPlayerTotalMatchesPlayed,
                    totalmatcheswon: wPlayerTotalMatchesWon,
                    winpercentage: wPlayerWinPercentage,
                    playerfdr: wPlayerFdr,
                    totalpoints: wPlayerTotalMatchPoints,
                    totalweightedpoints: wPlayerTotalWeightedPoints,
                }).exec()
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'Cannot update the winning player. Please try again',
                500
              );
              return next(error);
        }

        try{
            updateLosingPlayerRecord = await Ranking.findOneAndUpdate({ playername: losingPlayer},
                {
                    totaltournamentmatchesplayed: lPlayerTournamentMatchesPlayed,
                    totalmatchesplayed: lPlayerTotalMatchesPlayed,
                    totalmatcheslost: lPlayerTotalMatchesLost,
                    winpercentage: lPlayerWinPercentage,
                    playerfdr: lPlayerFdr,
                    totalpoints: lPlayerTotalMatchPoints,
                    totalweightedpoints: lPlayerTotalWeightedPoints,
                }).exec()
        } catch (err) {
            const error = new HttpError(
                'Cannot update the winning player. Please try again',
                500
              );
              return next(error);
        }
    }
    const newMatchEntry = new Match(
        { playerOneName : playerOneName,
            playerTwoName: playerTwoName,
            winningPlayer: winningPlayer,
            losingPlayer: losingPlayer,
            scoreLine: scoreline,
            tournamentName: tournamentName,
        })
    try {
        await newMatchEntry.save();

        res.status(201).json(newMatchEntry);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
        //-below end of edition name check
    }
}

export const updateRanking = async (req, res, next) => {

    let downloadPlayerData
    try{
        downloadPlayerData = await Ranking.aggregate([
          {$match: {playerbanned: null}},
          {$sort: {totalweightedpoints: -1, totalmatchesplayed: -1}},
          {$group: {
            _id: " ",
            members: {$push: {playername: "$playername", totalweightedpoints:"$totalweightedpoints"}}
          }}
        ]).exec()
        let ranking = 1
        for(let i=0; i<downloadPlayerData[0].members.length; i++){
                Ranking.findOneAndUpdate({playername: downloadPlayerData[0].members[i].playername},
                                      {
                                        rank: ranking}, function(err,data){
                                      if(err){
                                        console.log(err)
                                      }
                                      })
                    // }
                    ranking++                                      
            }
       
    } catch (err){
        console.log(err)
    const error = new HttpError(
      'Cannot aggregate data. Please try again',
      500
    );
    return next(error);
    }
}

export const getRanks = async (req, res, next) => {

    console.log("inside the get")
    let rankingData = []
    try{
        rankingData = await Ranking.find({playerbanned: { $eq: null}}).sort({"rank": 1}).exec()
    } catch (err){
        const error = new HttpError(
          'Cannot find ranking data. Please try again',
          500
        );
        return next(error);
      }
      res.status(201).json({rankingData});
 }

 export const getPlayer = async (req, res, next) => {

    const { pid } = req.body
    let playerData = []
    let playerName 
    let matchData = []
    try{
        playerData = await Ranking.find({_id: { $eq: pid}}).exec()
        playerName = playerData[0].playername
    } catch (err){
        const error = new HttpError(
          'Cannot find ranking data. Please try again',
          500
        );
        return next(error);
      }
    try{
        matchData = await Match.find({$or: [{'playerOneName': playerName}, {'playerTwoName': playerName}]}).exec()
    } catch (err){
        const error = new HttpError(
          'Cannot find match data. Please try again',
          500
        );
        return next(error);
    }  
   
      res.status(201).json({playerData});
 }

 export const getEdition1 = async (req, res, next) => {

    let editionData1 = []
  
    try{
        editionData1 = await Match.find({tournamentName: { $eq: 'GSM Edition 1'}}).exec()
    } catch (err){
        const error = new HttpError(
          'Cannot find ranking data. Please try again',
          500
        );
        return next(error);
      }
      res.status(201).json({editionData1});
 }

 export const getEdition2 = async (req, res, next) => {

    let editionData2 = []
  
    try{
        editionData2 = await Match.find({tournamentName: { $eq: 'GSM Edition 2'}}).exec()
    } catch (err){
        const error = new HttpError(
          'Cannot find ranking data. Please try again',
          500
        );
        return next(error);
      }
      res.status(201).json({editionData2});
 }

 export const getEdition3 = async (req, res, next) => {

    let editionData3 = []
  
    try{
        editionData3 = await Match.find({tournamentName: { $eq: 'GSM Edition 3'}}).exec()
    } catch (err){
        const error = new HttpError(
          'Cannot find ranking data. Please try again',
          500
        );
        return next(error);
      }
      res.status(201).json({editionData3});
 }

 export const getEdition4 = async (req, res, next) => {

    let editionData4 = []
  
    try{
        editionData4 = await Match.find({tournamentName: { $eq: 'GSM Edition 4'}}).exec()
    } catch (err){
        const error = new HttpError(
          'Cannot find ranking data. Please try again',
          500
        );
        return next(error);
      }
      res.status(201).json({editionData4});
 }

 export const getEdition5 = async (req, res, next) => {

    let editionData5 = []
  
    try{
        editionData5 = await Match.find({tournamentName: { $eq: 'GSM Edition 5'}}).exec()
    } catch (err){
        const error = new HttpError(
          'Cannot find ranking data. Please try again',
          500
        );
        return next(error);
      }
      res.status(201).json({editionData5});
 }

 export const challengeMatch = async (req, res, next) => {

    let challengeData = []
  
    try{
        challengeData = await Match.find({tournamentName: { $eq: 'Challenge Match'}}).exec()
    } catch (err){
        const error = new HttpError(
          'Cannot find ranking data. Please try again',
          500
        );
        return next(error);
      }
      res.status(201).json({challengeData});
 }

export default router;