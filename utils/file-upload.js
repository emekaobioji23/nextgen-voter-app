
const multer = require("multer");
const sharp = require('sharp');
const { cloudUpload } = require("../utils/cloudinary");
const Econsole = require("../utils/Econsole-log")

const multerStorage = multer.diskStorage({});

const multerFilter = (req, file, cb) => {
    const myconsole = new Econsole("file-uploads.js", "multerFilter", "")
    myconsole.log("entry")
    myconsole.log("file.mimetype", file.mimetype)
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new Error("Please upload only an image file"), false);
    }
    myconsole.log("exits")
};

const image = multer({
    limits: { fileSize: 1024 * 1024 * 10 }, // 10 MB limit
    storage: multerStorage,
    fileFilter: multerFilter,
});
exports.uploadImagesToTempLocation = image.array("images")


exports.uploadImagesToCloudinary = async (req, res, next) => {
    const myconsole = new Econsole("file-uploads.js", "uploadImagesToCloudinary", "")
    let resizedFilePath
    let imageFile2
    req.body.images =[]
    await Promise.all(
        req.files.map(async (imageFile, index) => {
            resizedFilePath = `${__dirname}/resized_images/resized_${imageFile.originalname}`;
            await sharp(imageFile.path).resize({ width: 300 }).
                toFormat('jpeg').jpeg({ quality: 90 }).toFile(resizedFilePath);
            imageFile2 = { url: resizedFilePath, id: req.params.id + "-" + index, };
            myconsole.log("imageFile2=",imageFile2)
            req.body.images.push((await cloudUpload(imageFile2)).secure_url);
        })
    );
    myconsole.log("exits")
    next()
}
