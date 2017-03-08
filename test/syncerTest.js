const config = require("./config")
const Syncer = require("../src/Syncer")


const syncer = new Syncer(config)


syncer.incrementSync()