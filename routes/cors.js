// ---------------- cross origin resource sharing ----------------------//
const cors = require('cors')

const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://localhost:3001', 'http://localhost:3002']
let corsOptionsDelegate = (req, callback) => {

    let corsOptions;

    console.log(req.header('Origin'))

    if (whitelist.indexOf(req.header('Origin')) !== -1)
        corsOptions = {origin: true}
    else
        corsOptions = {origin: false}

    callback(null, corsOptions)
};

exports.cors = cors() // allow all origins
exports.corsWithOptions = cors(corsOptionsDelegate) // allow only whitelisted origins