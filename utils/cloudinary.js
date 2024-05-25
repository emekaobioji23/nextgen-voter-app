
const Econsole = require("./Econsole-log")
const cloudinary = require("cloudinary");
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET } =
  process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_SECRET,
});

exports.cloudUpload = async (image) => {
  const myconsole = new Econsole("cloudinary.js", "cloudUpload", "")
  myconsole.log("entry")
  let result
  try {
    result = await cloudinary.v2.uploader.upload(image.url, {
      public_id: image.id,
    });
  } catch (error) {
    myconsole.error(error)
  }
  myconsole.log("exits")
  return result;
};

exports.cloudDelete = async (imageURL) => {
  const myconsole = new Econsole("cloudinary.js", "cloudDelete", "")
  myconsole.log("entry")
  // Extract the public ID from the secure URL
  const publicId = imageURL.split('/').pop().split('.')[0];
  // Delete the image
  const result = await cloudinary.uploader.destroy(publicId, (error, result) => {
    if (error) {
      myconsole.error(error);
    } else {
      myconsole.log(result);
    }
  });
  myconsole.log("exits")
  return result;
};