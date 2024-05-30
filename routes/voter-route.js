const express = require("express");
const {processPayment,vote,protectVote,protectPayment,compileLinksToVotingRoomsWithContestants,
    displayContestantsInVotingRoom} = require("../controllers/voter-controller");
const {verifyPayment} = require("../utils/payment");
const joi = require("../utils/joi-validators")

const router = express.Router();
router.get("/", compileLinksToVotingRoomsWithContestants);
router.get("/votingrooms-with-contestants/:id", displayContestantsInVotingRoom);//votingroomId
router.post("/vote/:id", protectPayment,processPayment);//contestantId
router.get("/vote/complete/:id",protectVote,verifyPayment,vote);//contestantId


module.exports = router;
