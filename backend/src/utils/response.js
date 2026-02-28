const serializeBigInt = require("./serializer");

function success(res, data) {
  return res.json({
    success: true,
    data: serializeBigInt(data)
  });
}

module.exports = { success };
