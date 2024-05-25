
const { default: mongoose } = require("mongoose");

const voteSchema = new mongoose.Schema({
  votingroomId:{ type: String, required: true},//required
  contestantId:{ type: String, required: true},//required
  amount:{type:Number,required:true},
  votecount:{ type: Number, required: true},//required
  tx_ref: { type: String, required: true},
  transaction_id: { type: String, required: true},
  adminId: { type: String, required: true},//required
  createdAt: {type:Date, default: Date.now()},
  updatedAt: Date,},
  {toObject: {virtuals: true},toJSON: {virtuals: true,},}
);

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;
