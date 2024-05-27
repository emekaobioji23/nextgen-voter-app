
const { default: mongoose } = require("mongoose");

const voteSchema = new mongoose.Schema({
  votingroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VotingRoom",
    required: true,
  },
  contestant:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contestant",
    required: true,
  },
  amount:{type:Number,required:true},
  votecount:{ type: Number, required: true},//required
  tx_ref: { type: String, required: true},
  transaction_id: { type: String, required: true},
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  createdAt: {type:Date, default: Date.now()},
  updatedAt: Date,},
  {toObject: {virtuals: true},toJSON: {virtuals: true,},}
);

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;
