const { default: mongoose } = require("mongoose");
const catchAsync = require("../utils/catch-async");
const ErrorObject = require("../utils/error");
const Econsole = require("../utils/econsole-log");
const {v4:uuidGenerator} = require("uuid")
const {paymentIntialization}=require("../utils/payment");
const Contestant = require("../models/contestant");
const VotingRoom = require("../models/votingroom");
const Vote = require("../models/vote");


const {
  AMOUNT_PER_VOTE,
  FLW_CALLBACK_URL,
  VOTING_REL_URL,
  SERVER_PORT,
  FLW_CUSTOMER_CURRENCY,
  PORT 
} =  process.env;
  
  exports.processPayment =catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("voter-controller.js", "processPayment", "")
    const id = uuidGenerator()
    req.body.uuid = id;
    const contestantId = req.params.id;
    const votingroomId = req.query.votingroomId;
    const adminId = req.query.adminId;
    //votingurl passed for revote incase payment verification fails later
    //req.body.votingurl =`${req.protocol}://${req.get("host")}${VOTING_REL_URL}${contestantId}?votingroomId=${votingroomId}&adminId=${adminId}`;

    //third party payment redirect url. we used ${req.get("host")} instead of ${SERVER_PORT} because paystack was throwing errors
    req.body.redirect_url=`${req.protocol}://${SERVER_PORT}${FLW_CALLBACK_URL}/${contestantId}?votingroomId=${votingroomId}&adminId=${adminId}&amount=${req.body.amount}&currency=${FLW_CUSTOMER_CURRENCY}`
    const response = await paymentIntialization(req.body,res);
      if(response.status==="success"){
        res.status(200).json({
          status: "payment link generated successfully",
          paymentlink: response.data.link
        });
      }else{
        res.status(500).json({
          status: "payment link not generated"
        });
      }
      myconsole.log("exits")
  });
  
  exports.vote=catchAsync(async (req, res) => {
    const myconsole = new Econsole("voter-controller.js", "vote", "")
    const contestantId = req.params.id
    req.body.contestant=contestantId
    const votingroomId = req.query.votingroomId;
    req.body.votingroom=votingroomId
    const adminId = req.query.adminId;
    req.body.admin=adminId
    req.body.tx_ref=req.query.tx_ref
    req.body.transaction_id=req.query.transaction_id

    let contestant = await Contestant.findById(contestantId)
    if(contestant===null){
      return next(new ErrorObject("Contestant removed from Voting Room", 500));
    }else{
      req.body.votecount=parseInt(req.query.amount)/parseInt(AMOUNT_PER_VOTE)
      const cummulativeVoteCount=contestant.votecount+req.body.votecount
      myconsole.log("cummulativeVoteCount=",cummulativeVoteCount)
      contestant = await Contestant.findByIdAndUpdate({_id:contestant.id}, {votecount:cummulativeVoteCount}, {
        new: true,
        runValidators: false,
      });
        req.body.amount = req.query.amount
        let vote = await Vote.create(req.body)
        vote = await Vote.findById(vote.id).populate("contestant","username name images -_id")
        .populate("votingroom","-admin -contestants -_id").populate("admin","email -_id")
        //myconsole.log("vote",vote)
          res.status(200).json({
          status: "success",
          message: "successfully voted",
          vote: vote,
        });
      }
    myconsole.log("exits")
  });
  exports.protectVote=catchAsync(async (req, res,next) => {
    const myconsole = new Econsole("voter-controller.js", "protectVote", "")
    const modelNames = mongoose.modelNames();
    myconsole.log("modelNames",modelNames)
    myconsole.log("transaction_id",req.query.transaction_id)
    myconsole.log("tx_ref",req.query.tx_ref)
    if(modelNames.includes("Vote")){
      const vote = await Vote.find({tx_ref:req.query.tx_ref,transaction_id:req.query.transaction_id})
      myconsole.log("vote",vote)
      if(vote===null){
        next()
      }else{
        myconsole.log("vote",vote)
        if(vote.length===0){
          next()
        }else{
          res.status(403).json({
            status: "forbidden",
            message: "You cannot reuse a payment",
          });
        }
      }
    }else{
      next()
    }
    myconsole.log("exits")
  });
  exports.protectPayment=catchAsync(async (req, res,next) => {
    const myconsole = new Econsole("voter-controller.js", "protectPayment", "")
    const votingroom = await VotingRoom.findById(req.query.votingroomId)
    const currentDate = Date.now()
    if((currentDate<votingroom.votingstarts.getTime())||(currentDate>votingroom.votingends.getTime())){
      res.status(403).json({
        status: "forbidden",
        message: "It is not voting time, consult the Electoral officer",
      });
    }else{
      myconsole.log("exits")
      next()
    }
    myconsole.log("exits")
  });

  exports.compileLinksToVotingRoomsWithContestants=catchAsync(async (req, res) => {
    const myconsole = new Econsole("voter-controller.js", "compileLinksToVotingRoomsWithContestants", "")
    myconsole.log("entry")
    let votingrooms
    let votingroomsWithContestants=[]
    let votingroomData
    votingrooms = await VotingRoom.find({contestants: { $ne: null }, $expr: { $gt: [{ $size: "$contestants" }, 0] }}).populate("admin")
    if(votingrooms.length!=0){
      votingrooms.map(async (votingroom, vr) => {
          votingroomData={
            votingroom_id:votingroom.id,
            votingroom_name:votingroom.name,
            votingroom_admin:votingroom.admin.email,
            votingroom_awardorposition:votingroom.awardorposition,
            votingroom_description:votingroom.description,
            votingroom_votingstarts:votingroom.votingstarts,
            votingroom_votingends:votingroom.votingends,
            votingroom_link:`${req.protocol}://${req.get("host")}/api/v1/votingrooms-with-contestants/${votingroom.id}`
          }
          votingroomsWithContestants.push(votingroomData)
        })
      myconsole.log("exits")
      res.status(201).json({
        status: "success",
        message: "Voting Rooms with Contestants found",
        votingrooms: votingroomsWithContestants,
      })
    }else{
      myconsole.log("exits")
      res.status(201).json({
        status: "success",
        message: "No Voting Rooms with Contestants found",
        votingrooms: votingrooms,votingroomsWithContestants
      })
    }
});

exports.displayContestantsInVotingRoom=catchAsync(async (req, res) => {
  const myconsole = new Econsole("voter-controller.js", "displayContestantsInVotingRoom", "")
  myconsole.log("entry")
  let contestantsInVotingroom=[]
  let contestantData={}

  const contestants = await Contestant.find({votingroom:req.params.id})
  if(contestants.length!=0){
    await Promise.all(
    contestants.map(async (contestant, c) => {
      if(contestant.votecount===null){
        contestant.votecount=0
        contestant.save()
      }
      contestant = await Contestant.findByIdAndUpdate(contestant.id,
        {votinglink:`${req.protocol}://${req.get("host")}${VOTING_REL_URL}${contestant.id}?votingroomId=${contestant.votingroom}&adminId=${contestant.admin}`},
        {new: true,runValidators: false,})
      contestantData={
        username:contestant.username,
        images:contestant.images,
        votinglink:contestant.votinglink,
        totalvotes:contestant.votecount
      }
      contestantsInVotingroom.push(contestantData)
    }))
    myconsole.log("exits")
    res.status(201).json({
      status: "success",
      message: "Contestants present in Voting Room",
      contestants: contestantsInVotingroom,
    })
  }else{
    myconsole.log("exits")
    res.status(201).json({
      status: "success",
      message: "Contestants not present in Voting Room",
      contestants: contestantsInVotingroom,
    })
  }
});