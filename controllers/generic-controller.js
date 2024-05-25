const QueryMethod = require("../utils/query");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const catchAsync = require("../utils/catch-async");
const ErrorObject = require("../utils/error");
const sendEmail = require("../utils/email");
const Econsole = require("../utils/econsole-log");
const {v4:uuidGenerator} = require("uuid")
const paymentIntialization=require("../utils/payment");
const Contestant = require("../models/contestant");
const Vote = require("../models/vote");





const {
  JWT_COOKIE_EXPIRES_IN,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  NODE_ENV, 
} =  process.env;

  const otp=async (noOfDigits,Model)=>{
    let number = Math.floor(Math.random() * Math.pow(10,noOfDigits))
    console.log("otp=",number)
    while(await Model.findOne({passwordResetToken:number})){
      number = Math.floor(Math.random() * Math.pow(10,noOfDigits))
      console.log("otp=",number)
    }
    return number
  }
const signToken = (id) => {
  const myconsole = new Econsole("generic-controller.js", "signToken", "")
  myconsole.log("entry")
  console.log(JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, })
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, });
};

const createAndSendToken = catchAsync(async (user, statusCode, res) => {
  const myconsole = new Econsole("generic-controller.js", "createAndSendToken", "")
  myconsole.log("entry")
  const token = await signToken(user.id);
  const cookieOptions = {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);//to distinguish sources of token

  const hashToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  user.passwordResetToken=hashToken,
  user.passwordTokenExpires=cookieOptions.expires;
  console.log("cookieOptions.expires=",cookieOptions.expires)
  user.save()
  const data={id:user.id,email:user.email,firstName:user.firstName, 
    secondName:user.secondName, surname:user.surname,phoneNumber:user.phoneNumber};
  myconsole.log("exits")
  res.status(statusCode).json({ status: "success", token, userInfo: {data},});
});
exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    //let filter = req.params.tourId ? { tourRef: req.params.tourId } : {};
    const myconsole = new Econsole("generic-controller.js", "getAll", "")
    myconsole.log("entry")
    let filter = {};
    const features = new QueryMethod(Model.find(filter), req.query)
      .sort()
      .limit()
      .paginate()
      .filter();

    const docs = await features.query;
    myconsole.log("exits")
    res.status(200).json({ status: "success", results: docs.length, [Model.modelName]: docs, });
  });

  exports.getAllManyToOne =(ModelForTheManyInRel,schemaIdNameForTheOneInRel)=> catchAsync(async (req, res,next) => {
    const myconsole = new Econsole("generic-controller.js", "getAllManyToOne", "")
    myconsole.log("entry")
    myconsole.log("ModelForTheManyInRel=",ModelForTheManyInRel,"schemaIdNameForTheOneInRel=",schemaIdNameForTheOneInRel)
    let filter = {[schemaIdNameForTheOneInRel]: req.params.id};
    myconsole.log("filter=",filter)
    const features = new QueryMethod(ModelForTheManyInRel.find(filter), req.query)
      .sort('-updatedAt')
      .limit()
      .paginate()
      .filter();
  
    const docs = await features.query;
    myconsole.log("exits")
    res.status(200).json({ status: "success", results: docs.length, [ModelForTheManyInRel.modelName]: docs });
  });
  
exports.signUp = (Model) =>
  catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("generic-controller.js", "signUp", "")
    myconsole.log("entry")
    const { firstName, secondName, surname, phoneNumber, email, password, passwordConfirm} = req.body;
    console.log(firstName, secondName, surname, phoneNumber, email, password, passwordConfirm)
    const user = await Model.create({ firstName, secondName, surname, phoneNumber, email, password, passwordConfirm});
    createAndSendToken(user, 201, res);
    myconsole.log("exits")
  });
exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("generic-controller.js", "getOne", "")
    myconsole.log("entry")
    const modelName = Model.modelName
    const doc = await Model.findById(req.params.id);

    if (!doc)
      return next(
        new ErrorObject(`Document with the id ${req.params.id} not found`, 404)
      );
    myconsole.log("exits")
    res.status(200).json({
      status: "success",
      [modelName]: doc,
    });
  });
  exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("generic-controller.js", "deleteOne", "")
    myconsole.log("entry")
    const modelName = Model.modelName
    const doc = await Model.findByIdAndDelete(req.params.id, {
      strict: true,
    });
    if (!doc)
      return next(new ErrorObject(`Document with the id ${req.params.id} not found`, 404));
    myconsole.log("exits")
    res.status(204).json({
      status: "deleted",
      [modelName]: "null",
    });
  });
exports.signIn = (Model) =>
  catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("generic-controller.js", "signIn", "")
    myconsole.log("entry")
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorObject("Please enter your email and password", 400));
    }
    const confirmUser = await Model.findOne({ email });
    if (!confirmUser) {
      return next(
        new ErrorObject("There is no user with the inputted email address")
      );
    }
    const user = await Model.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorObject("Invalid email", 401));
    }else{
      const confirmPassword = await bcrypt.compare(password, user.password);
      myconsole.log(confirmPassword)
      if (!confirmPassword) {
        return next(new ErrorObject("Invalid password", 401));
      }
    }
    
    createAndSendToken(user, 200, res);
    myconsole.log("exits")
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("generic-controller.js", "updateOne", "")
    myconsole.log("entry")
    const modelName = Model.modelName
    if (req.body.password) {
      return next(new ErrorObject("You can't update password here", 400));
    }
    req.body.updatedAt = Date.now();
    const updatedData = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedData)
      return next(
        new ErrorObject(`Document with the id ${req.params.id} not found`, 404)
      );
    res.status(200).json({
      status: "success",
      data: {
        [modelName]: updatedData,
      },
    });
    myconsole.log("exits")
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("generic-controller.js", "createOne", "")
    myconsole.log("entry")
    req.body.updatedAt=Date.now();
    const doc = await Model.create(req.body);
    const modelName = Model.modelName

    res.status(201).json({
      status: "success",
      data: {
        [modelName]: doc,
      },
    });
    myconsole.log("exits")
  });

// Authentication
exports.protect = (Model) =>
  catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("generic-controller.js", "protect", "")
    myconsole.log("entry")
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new ErrorObject("You are not logged in. Kindly log in.", 401)
      );
    }
    const decodedToken = await jwt.verify(token, JWT_SECRET);
    const currentUser = await Model.findById(decodedToken.id);

    if (!currentUser) {
      return next(new ErrorObject("You are not authorized", 403));
    }

    req.user = currentUser;
    myconsole.log("exits")
    next();
  });
  exports.sameUser = (Model) =>
  catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("generic-controller.js", "sameUser", "")
    myconsole.log("entry")
    if (req.user.id !== req.params.id) {
      return next(
        new ErrorObject(`You're not authorised to perform this action`, 403)
      );
    }
    myconsole.log("exits")
    next();
  });

// Authorization
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    const myconsole = new Econsole("generic-controller.js", "restrictTo", "")
    myconsole.log("entry")
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorObject("You are not authorised to perform this action.", 403)
      );
    }
    myconsole.log("exits")
    next();
  };
};

exports.forgotPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("generic-controller.js", "forgotPassword", "")
    myconsole.log("entry")
    // 1. Get User based on email provided
    const user = await Model.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new ErrorObject("There is no user with the provided email address", 404)
      );
    }
    // 2. Generate random reset token
    const otpValue = await otp(6,Model);
    const resetToken = user.createPasswordResetToken(otpValue);
    await user.save({ validateBeforeSave: false });

    // 3. Send token to the email addess
    const resetUrl = /*`${req.protocol}://${req.get("host")}/api/v1/${user.role}s/reset-password/${resetToken}`*/"https://www.jumia.com.ng/oraimo-20000mah-power-charging-bank-fast-charging-opb-p208dn-127139672.html";
    console.log(resetUrl)

    const message = `To reset your password click on the link below to submit your new password: ${resetUrl}`;

    try {
      await sendEmail({
        message,
        email: user.email,
        subject: "Your password reset url. It's valid for 10mins",
      });
      console.log("email sent")
      res.status(200).json({
        status: "success",
        message: "Token has been sent to your mail",
      });
    } catch (err) {
      //user.passwordResetToken = undefined;
      //user.passwordTokenExpires = undefined;
      //await user.save();
      console.log(err.message)
      next(new ErrorObject("Error while sending the token to your mail", 500));
    }
    myconsole.log("exits")
  });

exports.resetPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("generic-controller.js", "resetPassword", "")
    myconsole.log("entry")
    const hashToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

      console.log("req.params.token")
      console.log(req.params.token)
      console.log("hashToken")
      console.log(hashToken)

    const user = await Model.findOne({
      passwordResetToken: hashToken /*req.params.token*/,
      passwordTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorObject("Token is invalid or it has expired", 400));
    }
    //why password in param? visible?
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    /* user.passwordResetToken = undefined;
    user.passwordTokenExpires = undefined; */
    user.passwordChangedAt = Date.now() - 1000;
    await user.save();

    createAndSendToken(user, 200, res);
    myconsole.log("exits")
  });

exports.updatePassword = (Model) =>
  catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("generic-controller.js", "updatePassword", "")
    myconsole.log("entry")
    const user = await Model.findById(req.user.id).select("+password");
    const { newPassword, newPasswordConfirm } = req.body;
    if (!(await bcrypt.compare(req.body.password, user.password))) {
      return next(new ErrorObject("Your password is incorrect", 401));
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    createAndSendToken(user, 200, res);
    myconsole.log("exits")
  });




