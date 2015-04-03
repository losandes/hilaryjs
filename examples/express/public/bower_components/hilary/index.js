/*jslint node: true*/
var HilaryBase = require('./src/hilary.js'),
    Hilary = HilaryBase.Hilary;

require('./src/hilary.amd.js').useAMD(Hilary);

module.exports = Hilary;
