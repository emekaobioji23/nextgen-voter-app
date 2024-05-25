const Joi = require('joi')
const catchAsync=require("../utils/catch-async")
const Econsole = require("../utils/econsole-log")

const uniqueArrayValidator = (value, helpers) => {
    const uniqueValues = new Set(value);
    if (uniqueValues.size !== value.length) {
        return helpers.error('any.unique');
    }
    return value;
};
exports.validateAdmin = catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("joi-validators.js", "validateAdmin", "")
    myconsole.log("entry")
    //myconsole.log(req)
    const { firstName, secondName, surname, phoneNumber, email, password, passwordConfirm} = req.body;
    console.log(firstName, secondName, surname, phoneNumber, email, password, passwordConfirm)
    const obj = {firstName, secondName, surname, phoneNumber, email, password, passwordConfirm }
    var expectedAdminProperties = Joi.object({
        firstName: Joi.string().required(),
        secondName: Joi.string().required(),
        surname: Joi.string().required(),
        phoneNumber:Joi.string().regex(/^(\+?(\d{1,3}))?(\s|-)?(\d{3})(\s|-)?(\d{3})(\s|-)?(\d{4})$/).required(),
        email: Joi.string().required(),
        password:Joi.string().regex(/[A-Za-z\d^\w\d\s]{8,}/).required(),
        passwordConfirm:Joi.string().valid(Joi.ref('password')).required().strict()
    })
    const { error } = expectedAdminProperties.validate(obj)
    if (error) { myconsole.log(error.message);res.json({ errorMessage: error.message });return error.message; } else { myconsole.log("exits"), next() }
});
exports.validateContestant = catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("joi-validators.js", "validateContestant", "")
    myconsole.log("entry")
    //myconsole.log(req)
    const { name, username, images} = req.body;
    const admin = req.params.id;
    req.body.admin = admin;
    console.log(name, username, images,admin)
    const obj = {name, username, images,admin}
    var expectedContestantProperties = Joi.object({
        name: Joi.string().required(),
        username: Joi.string().required(),
        images: Joi.array().items(Joi.string()).min(1).required(),
        admin: Joi.string().required(),
    })
    const { error } = expectedContestantProperties.validate(obj)
    if (error) { myconsole.log(error.message);res.json({ errorMessage: error.message });return error.message; } else { myconsole.log("exits"), next() }
});

exports.validateVotingRoom = catchAsync(async (req, res, next) => {
    const myconsole = new Econsole("joi-validators.js", "validateVotingRoom", "")
    myconsole.log("entry")
    //myconsole.log(req)
    const {awardorposition,description,contestants,votingstarts,votingends} = req.body;
    const admin = req.params.id;
    req.body.admin = admin;
    console.log(awardorposition,description,contestants,votingstarts,votingends,admin)
    const obj = {awardorposition,description,contestants,votingstarts,votingends,admin}
    var expectedPositionProperties = Joi.object({
        awardorposition: Joi.string().required(),
        description: Joi.string().required(),
        contestants: Joi.array().items(Joi.string()).min(2).required(),
        votingstarts: Joi.date().required(),
        votingends: Joi.date().required(),
        admin: Joi.string().required(),
    })
    const { error } = expectedPositionProperties.validate(obj)
    if (error) { myconsole.log(error.message);res.json({ errorMessage: error.message });return error.message; } else { myconsole.log("exits"), next() }
});

