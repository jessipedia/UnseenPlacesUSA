const express = require('express');
const router = express.Router();

router.get('/', sendKey);

module.exports = router;

function sendKey(req, res) {
    res.send(process.env.MBX_KEY);
}
