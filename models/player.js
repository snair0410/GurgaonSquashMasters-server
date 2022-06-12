import mongoose from 'mongoose';

const playerSchema = mongoose.Schema({
    playername: String,
    rank: Number,
    totaltournamentmatchesplayed: {type: Number, default: 0},
    totalchallengematchesplayed: {type: Number, default: 0},
    totalmatchesplayed: {type: Number, default: 0},
    totalmatcheswon: {type: Number, default: 0},
    totalmatcheslost: {type: Number, default: 0},
    winpercentage: {type: Number, default: 0},
    playerfdr: {type: Number, default: 0},
    totalpoints: {type: Number, default: 0},
    totalweightedpoints: {type: Number, default: 0},
    membersince: String,
    memberimageurl: String,
    playerbanned: String,
})

var Ranking = mongoose.model('Ranking', playerSchema);

export default Ranking;