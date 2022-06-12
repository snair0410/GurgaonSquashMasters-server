import express from 'express'

import { createPlayer, addMatch, updateRanking, getRanks, getPlayer, getEdition1, getEdition2, getEdition3, getEdition4, getEdition5, challengeMatch } from '../controllers/admin.js'

const router = express.Router();

router.get('/getRanks', getRanks);
router.post('/addPlayer', createPlayer);
router.post('/addMatch', addMatch);
router.post('/updateRanking', updateRanking);
router.post('/getPlayer', getPlayer)
router.get('/getEdition1', getEdition1)
router.get('/getEdition2', getEdition2)
router.get('/getEdition3', getEdition3)
router.get('/getEdition4', getEdition4)
router.get('/getEdition5', getEdition5)
router.get('/challengeMatch', challengeMatch)




export default router;