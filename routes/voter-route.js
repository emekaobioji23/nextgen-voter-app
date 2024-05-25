const express = require("express");
const {processPayment,vote,protectVote,protectPayment,compileLinksToVotingRoomsWithContestants,displayContestantsInVotingRoom} = require("../controllers/voter-controller");
const joi = require("../utils/joi-validators")

const router = express.Router();
router.get("/", compileLinksToVotingRoomsWithContestants);
router.get("/votingrooms-with-contestants/:id", displayContestantsInVotingRoom);//votingroomId
router.post("/vote/:id", protectPayment,processPayment);//contestantId
router.post("/vote/complete/:id",protectVote,vote);//contestantId


module.exports = router;
