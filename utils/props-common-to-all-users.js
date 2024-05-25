const PropsCommonToAllUsers = {
  firstName: String,//required
  secondName: String,//optional
  surname:String,//required
  email: { type: String, required: true, unique: [true , "A user with this email already exist"], match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/},//required, unique, trim and set to lowercase
  phoneNumber:String,/*required /^(\+?(\d{1,3}))?(\s|-)?(\d{3})(\s|-)?(\d{3})(\s|-)?(\d{4})$/
  "phone number format is as follows:\n+1234567890 (with country code and no spaces or hyphens)\n
  123-456-7890 (with hyphens)\n123456789012345 (longer number with no spaces or hyphens)\n
  0903 599 4559 (spaces between groups of digits)\n
  234 903 599 4559 (country code 234 with spaces)\n09035994559 (no spaces or special characters)"*/
  password: {type:String,select: false},/*required minLength "Password must ba at least 8 characters" 
  /[A-Za-z\d^\w\d\s]{8,}/ "Password must contain at least a number, a lowercase, an uppercase alphabeth, and a symbol"
  not set on update*/
  passwordConfirm: {type:String,select: false},//required == to password, not set on update
  passwordResetToken: {type:String,select: false},//not set on update
  passwordChangedAt: {type:String,select: false},//not set on update
  passwordTokenExpires:{type:String,select: false},//not set on update
  createdAt: {type:Date, default: Date.now(),select:false},//not set on update
  updatedAt: {type:Date,select:false}//not set on update
};

module.exports = PropsCommonToAllUsers;
