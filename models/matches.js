import mongoose from 'mongoose';

const matchSchema = mongoose.Schema({
    playerOneName: String,
    playerTwoName: String,
    winningPlayer: String,
    losingPlayer: String,
    scoreLine: String,
    tournamentName: String,
})

var Match = mongoose.model('Match', matchSchema );

export default Match;