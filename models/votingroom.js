
const { default: mongoose,Schema } = require("mongoose");

const votingRoomSchema = new Schema(
  { 
    awardorposition:{ type: String, required: true, unique: [true , "A voting room with this award or position already exist"]},//required
    description: String,//required
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    contestants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Contestant",
        required: true,
      },
    ],
    votingstarts:{type:Date},//required
    votingends:{type:Date},//required
    createdAt: {type:Date, default: Date.now()},
    updatedAt:{type:Date}
  },
  {
    toObject: {virtuals: true,},toJSON: {virtuals: true,},
  }
);

const VotingRoom = mongoose.model("VotingRoom", votingRoomSchema);

module.exports = VotingRoom;
