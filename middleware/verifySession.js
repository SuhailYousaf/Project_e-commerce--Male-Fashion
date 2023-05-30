const db = require("../config/connection");
const bcrypt = require("bcrypt");
const collection = require("../config/collection");
const objectId = require("mongodb-legacy").ObjectId;
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { json } = require("body-parser");
require("dotenv").config();

module.exports = {
    verifyAdminLoggedIn: (req, res, next) => {
        if (req.session.adminLoggedIn) {
            next();
        } else {
            res.redirect("/admin");
        }
    },

    ifAdminLoggedIn: (req, res, next) => {
        if (req.session.adminLoggedIn) {
            res.redirect("/admin/adminpanel");
        } else {
            next();
        }
    },

    verifyUserLoggedIn: (req, res, next) => {
        if (req.session.userLoggedIn) {
            next();
        } else {
            res.redirect("/login");
        }
    },

    ifUserLoggedIn: (req, res, next) => {
        if (req.session.userLoggedIn) {
            res.redirect("/");
        } else {
            next();
        }
    },
};
