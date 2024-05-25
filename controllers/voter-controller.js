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
    req.body.votingurl =`${req.protocol}://${req.get("host")}/api/v1/vote/${contestantId}?votingroomId=${votingroomId}&adminId=${adminId}`;

    //third party payment redirect url
    req.body.redirect_url=`${req.protocol}://localhost:${PORT}${FLW_CALLBACK_URL}/${contestantId}?votingroomId=${votingroomId}&adminId=${adminId}&amount=${req.body.amount}`
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
    myconsole.log("req=",req)
    const contestantId = req.params.id
    req.body.contestantId=contestantId
    const votingroomId = req.query.votingroomId;
    req.body.votingroomId=votingroomId
    const adminId = req.query.adminId;
    req.body.adminId=adminId
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
        const vote = await Vote.create(req.body)
        myconsole.log("vote",vote)
          res.status(200).json({
          status: "success",
          message: "successfully voted",
          contestant: contestant,
          vote: vote,
          votingurl:contestant.votingurl
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
    votingrooms = await VotingRoom.find({contestants: { $ne: null }, $expr: { $gt: [{ $size: "$contestants" }, 0] }})
    if(votingrooms.length!=0){
      votingrooms.map(async (votingroom, vr) => {
          votingroomData={
            votingroom_id:votingroom.id,
            votingroom_awardorposition:votingroom.awardorposition,
            votingroom_description:votingroom.description,
            votingroom_votingstarts:votingroom.votingstarts,
            votingroom_votingends:votingroom.votingends,
            votingroom_link:`${req.protocol}://${req.get("host")}/api/v1/votingrooms-with-contestants/${votingroom.id}`
          }
          /* votingroomData.votingroom_awardorposition=votingroom.awardorposition
          votingroomData.votingroom_description=votingroom.description
          votingroomData.votingroom_link=`${req.protocol}://${req.get("host")}/api/v1/votingrooms-with-contestants/${votingroom.id}` */
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
  const votingroomId = req.params.id;
  let contestants
  let contestantsInVotingroom=[]
  let contestantData={}

  const votingroom = await VotingRoom.findById(votingroomId).populate("contestants").populate("admin")
  contestants = votingroom.contestants
  if(contestants.length!=0){
    await Promise.all(
    contestants.map(async (contestant, c) => {
      if(contestant.votecount===null){
        contestant.votecount=0
        contestant.save()
      }
      contestant = await Contestant.findByIdAndUpdate(contestant.id,
        {votinglink:`${req.protocol}://${req.get("host")}/api/v1/vote/${contestant.id}?votingroomId=${votingroom.id}&adminId=${votingroom.admin.id}`},
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
/* exports.getAllVotingRoomsLinks=catchAsync(async (req, res) => {
const myconsole = new Econsole("voter-controller.js", "getAllVotingRoomsLinks", "")
myconsole.log("entry")
if(req.body.adminData.length!=0){
  res.status(200).json({
    status: "success",
    adminData: req.body.adminData,
  });
}else{
  res.status(401).json({
    status: "Not voting links",
    adminData: req.body.adminData,
  })
}
myconsole.log("exits")
}); */










