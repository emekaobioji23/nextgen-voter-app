
const { default: mongoose } = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const PropsCommonToAllUsers = require("../utils/props-common-to-all-users");
const Econsole = require("../utils/econsole-log")

const adminSchema = new mongoose.Schema(
  { ...PropsCommonToAllUsers},
  {toObject: {virtuals: true,},toJSON: {virtuals: true,},}
);
adminSchema.pre('save', async function (next) {
  const myconsole = new Econsole("admin-model", "adminSchema.pre", "")
  try {
    
    myconsole.log("entry")
    if (!this.isModified("password")) {
      myconsole.log("exit")
      return next();
    }
    let salt = await bcrypt.genSalt(parseInt(process.env.DEFAULT_SALT_VALUE));
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordConfirm = this.password;
    myconsole.log("exit")
    next();
  } catch (error) { myconsole.log(error.message)}
});
adminSchema.methods.createPasswordResetToken=function (otp) {
  const myconsole = new Econsole("methods-common-to-all-users.js","exports.createPasswordResetToken","")
  myconsole.log("entry")
  //const resetToken = crypto.randomBytes(32).toString("hex");
  const resetToken = otp;
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken.toString())
    .digest("hex");
  this.passwordTokenExpires = Date.now() + 10 * 60 * 1000;
  console.log("resetToken=",resetToken)
  console.log("passwordResetToken=",this.passwordResetToken)
  myconsole.log("exit")
  return resetToken;
};
adminSchema.methods.changePasswordAfter=function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    console.log(JWTTimestamp < this.passwordChangedAt);
    return JWTTimestamp < this.passwordChangedAt;
  }
  return false;
};
const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
