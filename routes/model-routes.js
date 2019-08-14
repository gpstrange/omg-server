const restify = require('express-restify-mongoose');
const Group = require('../models/group');
const Gossip = require('../models/gossip');
const Router = require('express').Router;
const ObjectId = require('mongodb').ObjectId;

const router = Router();

const disableRoute = (route) => {
    return (req, res, next) => {
        const msg = `<!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="utf-8">
        <title>Error</title>
        </head>
        <body>
        <pre>Cannot ${route.toUpperCase()} ${req.url}</pre>
        </body>
        </html>
        `;
        res.status(404).send(msg);
    };
};

const options = {
    preDelete: disableRoute('delete'),
}

restify.serve(router, Group, options);
restify.serve(router, Gossip, options);
restify.serve(router, require('../models/comment'), options);
restify.serve(router, require('../models/user'), options);
// restify.serve(router, require('../models/likes'), {
//     preDelete: async (req, res, next) => {
//         await Gossip.findOneAndUpdate(
//             {_id: ObjectId(req.body.gossipId)},
//             {likesNumber: { $inc: -1}}
//         ).exec();
//     }
// });

module.exports = router;
