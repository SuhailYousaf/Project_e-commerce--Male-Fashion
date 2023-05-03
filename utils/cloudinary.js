const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dklwpvial',
    api_key: 239179456795758,
    api_secret: 'n2xIVJ53ukMruOkHmjOKNlln4i8'
});

module.exports = cloudinary;