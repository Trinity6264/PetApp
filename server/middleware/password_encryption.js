const bcrypt = require("bcrypt");

const passwordDecryption = async (plainText, hashPasword) => {
    return await bcrypt.compare(plainText,hashPasword)
};


module.exports = passwordDecryption