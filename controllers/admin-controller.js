const Contestant = require("../models/contestant");
const VotingRoom = require("../models/votingroom");
const Vote = require("../models/vote");
const catchAsync=require("../utils/catch-async");
const Econsole=require("../utils/econsole-log")
const ErrorObject = require("../utils/error")

exports.showAllContestantsForAdmin=catchAsync(async (req, res, next) => {
  const myconsole = new Econsole("admin-controller.js", "showAllContestantsForAdmin", "")
  myconsole.log("entry")
  const contestants = await Contestant.find({admin:req.params.id}).populate("admin").populate("votingroom");
  if(contestants.length!=0){
    res.status(201).json({
      status: "success",
      data: {contestants},
    });
  }else{
    res.status(201).json({
      status: "There is no Contestant for the Admin",
      data: {contestants},
    });
  }
  myconsole.log("exits")
});

 
  exports.adminOwnsVotingRoom = catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("admin-controller.js", "adminOwnsVotingRoom", "")
    myconsole.log("entry")
    const votingroom = await VotingRoom.findById(req.params.id);
    if (votingroom) {
      if (votingroom.admin != req.user.id) {
        myconsole.log("exits")
        return next(
          new ErrorObject(`You do not own the Voting Room`, 403)
        );
      }else{
        myconsole.log("exits")
        next()
      }
    }else{
      myconsole.log("exits")
      return next(
        new ErrorObject(`The Voting Room does not exists`, 404)
      );
    }
  });
  exports.verifyAdminCreatedContestant = catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("admin-controller.js", "verifyAdminCreatedContestant", "")
    myconsole.log("entry")
    const contestant = await Contestant.findById(req.params.id).populate("admin");
    if (contestant!=null) {
      if (contestant.admin.id != req.user.id) {
        myconsole.log("exits")
        return next(
          new ErrorObject(`You did not register the Contestant`, 403)
        );
      }else{
        myconsole.log("exits")
        next()
      }
    }else{
      myconsole.log("exits")
      return next(
        new ErrorObject(`The Contestant does not exists`, 404)
      );
    }
  });
  exports.verifyAdminCreatedContestants = catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("admin-controller.js", "verifyAdminCreatedContestants", "")
    myconsole.log("entry")
    const contestantsIds = req.body.contestants
    let contestant
    myconsole.log(contestantsIds.length)
    if (contestantsIds.length!=0) {
      contestantsIds.map(async(contestantId,cid)=>{
        contestant = await Contestant.findById(contestantId).populate("admin")
        if(contestant===null){
          myconsole.log("exits")
          return next(new ErrorObject(`The Contestant with id = ${contestantId} does not exists`, 404));
        }
        if(contestant.admin.id!=req.user.id){
          myconsole.log("exits")
          return next(new ErrorObject(`You did not register the Contestant with id = ${contestant.id}`, 403));
        }
      })
    }
    myconsole.log("exits")
    next()
  });
  exports.createVotingRoom = catchAsync(async (req, res) => {
    const myconsole = new Econsole("generic-controller.js", "createVotingRoom", "")
    myconsole.log("entry")
    req.body.updatedAt=Date.now();
    let votingroom = await VotingRoom.create(req.body);
    votingroom = await VotingRoom.findById(votingroom.id)
    if(votingroom.contestants!=0){
      votingroom.contestants.map(async(contestant,c)=>{
        await Contestant.findByIdAndUpdate(contestant.id,{votingroom:votingroom.id})
      })
    }
    myconsole.log("exits")
    res.status(201).json({
      status: "success",
      data: {
        votingroom: votingroom,
      },
    });
  });
  exports.verifyAdminCreatedVotingRoom = catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("admin-controller.js", "verifyAdminCreatedVotingRoom", "")
    myconsole.log("entry")
    const votingroom = await VotingRoom.findById(req.params.id);
    if (votingroom!=null) {
      if (votingroom.adminId != req.user.id) {
        myconsole.log("exits")
        return next(
          new ErrorObject(`You did not create the Voting Room`, 403)
        );
      }else{
        myconsole.log("exits")
        next()
      }
    }else{
      myconsole.log("exits")
      return next(
        new ErrorObject(`The Voting Room does not exists`, 404)
      );
    }
  });
  exports.verifyVoteWasCastInAdminCreatedVotingRoom = catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("admin-controller.js", "verifyVoteWasCastInAdminCreatedVotingRoom", "")
    myconsole.log("entry")
    const vote = await Vote.findById(req.params.id);
    if (vote!=null) {
      if (vote.adminId != req.user.id) {
        myconsole.log("exits")
        return next(
          new ErrorObject(`The vote was not cast in a Voting Room created by the Admin`, 403)
        );
      }else{
        myconsole.log("exits")
        next()
      }
    }else{
      myconsole.log("exits")
      return next(
        new ErrorObject(`The vote was never cast`, 404)
      );
    }
  });
  exports.deleteContestant = catchAsync(async (req, res) => {
    const myconsole = new Econsole("admin-controller.js", "deleteContestant", "")
    myconsole.log("entry")
    const contestant = await Contestant.findById(req.params.id);
    let votes
    if (contestant!=null) {
      await Contestant.deleteOne({_id:contestant.id})
      votes = await Vote.find({contestantId:contestant.id})
      if(votes != null){
        await Promise.all(
          votes.map(async (vote,v)=>{
            await Vote.findByIdAndDelete(vote.id)
          })
        )
      }
      myconsole.log("exits")
      res.json({
        status: "success",
        data: {
          contestant,
          votes,
          message: "Contestant deleted successfully",
        },
      })
    }else{
      myconsole.log("exits")
      res.json({
        status: "success",
        data: {
          contestant,
          votes,
          message: "Contestant does not exists",
        },
      })
    }
  });
  exports.deleteVotingRoom = catchAsync(async (req, res) => {
    const myconsole = new Econsole("admin-controller.js", "deleteVotingRoom", "")
    myconsole.log("entry")
    const votingroom = await VotingRoom.findById(req.params.id);
    let votes
    if (votingroom!=null) {
      await VotingRoom.deleteOne({_id:votingroom.id})
      myconsole.log("exits")
      res.json({  
        status: "success",
        data: {
          votingroom,
          votes,
          message: "Voting Room deleted successfully",
        },
      })
    }else{
      myconsole.log("exits")
      res.json({
        status: "success",
        data: {
          votingroom,
          votes,
          message: "Voting Room does not exists",
        },
      })
    }
  });
  exports.deleteVote = catchAsync(async (req, res) => {
    const myconsole = new Econsole("admin-controller.js", "deleteVote", "")
    myconsole.log("entry")
    const vote = await Vote.findById(req.params.id);
    if (vote!=null) {
      await Vote.deleteOne({_id:vote.id})
      myconsole.log("exits")
      res.json({  
        status: "success",
        data: {
          vote,
          message: "Vote delete successfully",
        },
      })
    }else{
      myconsole.log("exits")
      res.json({  
        status: "success",
        data: {
          vote,
          message: "Vote does not exists",
        },
      })
    }
  });
   