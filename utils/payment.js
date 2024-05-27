const got = require("got");
const Flutterwave = require("flutterwave-node-v3");
const {
  FLW_SECRET_KEY,
  FLW_PUBLIC_KEY,
  FLW_URL,
  FLW_CUSTOMER_CURRENCY,
  FLW_CUSTOMER_CONSUMER_ID,
  FLW_CUSTOMER_CONSUMER_MAC,
  FLW_CUSTOMER_PHONENUMBER,
  FLW_CUSTOMER_EMAIL,
  FLW_CUSTOMER_TITLE,
  VOTING_REL_URL,
} = process.env;
exports.paymentIntialization = async (req,res) => {
  console.log(req);
  try {
    req.currency = FLW_CUSTOMER_CURRENCY
    const response = await got
      .post(FLW_URL, {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
        },
        json: {
          tx_ref: req.uuid,
          amount: req.amount,
          currency: req.currency,
          redirect_url: req.redirect_url,
          meta: {
            consumer_id: FLW_CUSTOMER_CONSUMER_ID,
            consumer_mac: FLW_CUSTOMER_CONSUMER_MAC,
          },
          customer: {
            email: FLW_CUSTOMER_EMAIL,
            phonenumber: FLW_CUSTOMER_PHONENUMBER,
            name: FLW_CUSTOMER_EMAIL,
          },
          customizations: {
            title: FLW_CUSTOMER_TITLE,
            // logo: FLW_CUSTOMER_LOGO,
          },
        },
      })
      .json();
    console.log("response=",response);
    return response;
  } catch (err) {
    console.log("err.code=",err.code);
    console.log("err.response.body",err.response.body);
    return err
  }
};

exports.verifyPayment = async (req,res,next) => {
  const flw = new Flutterwave(FLW_PUBLIC_KEY,FLW_SECRET_KEY);
  flw.Transaction.verify({ id: req.query.transaction_id })
    .then((response) => {
      console.log(response);
      if (
        response.data?.status === "successful" &&
        response.data?.amount === req.body.amount &&
        response.data?.currency === req.body.currency
      ) {
        // Success! Confirm the customer's payment
        next()
      } else {
        // Inform the customer their payment was unsuccessful
        res.status(404).json({
          message: "payment unsuccessful",
          votinglink:`${req.protocol}://${req.get("host")}${VOTING_REL_URL}${req.params.id}?votingroomId=${req.query.votingroomId}&adminId=${req.query.adminId}`
        });
      }
    })
    .catch((err)=>console.log(err));
};