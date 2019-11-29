const dotenv = require("./index");

const env = dotenv.config();
Object.assign(process, { env });
