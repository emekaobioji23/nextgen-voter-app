const express = require("express");
const {
  createOne,
  signUp,
  signIn,
  protect,
  sameUser, 
  updateOne,
  getOne,
  forgotPassword,
  resetPassword,
  updatePassword,
  deleteOne,
} = require("../controllers/generic-controller");
const {
  showAllContestantsForAdmin,
  adminOwnsVotingRoom,
  verifyAdminCreatedContestant,
  verifyAdminCreatedContestants,
  createVotingRoom,
  verifyAdminCreatedVotingRoom,
  verifyVoteWasCastInAdminCreatedVotingRoom,
  deleteContestant,
  deleteVotingRoom,
  deleteVote
} = require("../controllers/admin-controller");
const Admin = require("../models/admin")
const Contestant = require("../models/contestant")
const VotingRoom = require("../models/votingroom")

const {
  validateAdmin,
  validateContestant,
  validateVotingRoom,
} = require("../utils/joi-validators")
const {uploadImagesToTempLocation,
  uploadImagesToCloudinary}=require("../utils/file-upload")

const router = express.Router();
router.post("/signup", validateAdmin,signUp(Admin));
router.post("/signin", signIn(Admin));
router.post("/create-contestant/:id",protect(Admin),sameUser(Admin),uploadImagesToTempLocation,
uploadImagesToCloudinary,validateContestant,createOne(Contestant));//id=adminId
router.get("/show-all-contestants-for-admin/:id", protect(Admin),sameUser(Admin),showAllContestantsForAdmin);//id=adminId
router.post("/create-votingroom/:id", protect(Admin),sameUser(Admin),validateVotingRoom,verifyAdminCreatedContestants,createVotingRoom);//id=adminId
router.patch("/update-voting-room/:id",protect(Admin),adminOwnsVotingRoom,updateOne(VotingRoom));//id=votingroomId
router.route("/:id").get(protect(Admin), getOne(Admin)).patch(protect(Admin), sameUser(Admin), updateOne(Admin));//id=adminId
router.post("/forgot-password", forgotPassword(Admin));
router.patch("/reset-password/:token", resetPassword(Admin));
router.patch("/update-password/:id", protect(Admin), updatePassword(Admin));//id=adminId
router.delete("/contestant/:id",protect(Admin), verifyAdminCreatedContestant, deleteContestant);//:id = contestant
router.delete("/votingroom/:id",protect(Admin), verifyAdminCreatedVotingRoom, deleteVotingRoom);//:id = votingroom
router.delete("/votes/:id",protect(Admin), verifyVoteWasCastInAdminCreatedVotingRoom, deleteVote);//:id = vote
module.exports = router;
