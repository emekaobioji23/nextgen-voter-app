
const { default: mongoose,Schema } = require("mongoose");

const contestantSchema = new Schema(
  { 
    name: { type: String, required: true},//required
    username:{ type: String, required: true, unique: [true , "A Contestant with this username already exist"]},
    images: {type: [String],required: true,},//required
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    votingroom: {
      type: Schema.Types.ObjectId,
      ref: "VotingRoom",
    },
    votinglink:String,
    votecount:Number
  },
  {toObject: {virtuals: true,},toJSON: {virtuals: true,},}
);
const Contestant = mongoose.model("Contestant", contestantSchema);

module.exports = Contestant;
