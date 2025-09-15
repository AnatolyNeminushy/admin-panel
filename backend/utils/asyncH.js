function asyncH(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
module.exports = asyncH;        // default
module.exports.asyncH = asyncH; // named
