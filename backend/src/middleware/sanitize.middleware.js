const xss = require('xss');

/**
 * Đệ quy làm sạch mọi chuỗi string trong object (body/query/params)
 * để loại bỏ script/HTML độc hại -> chống XSS lưu trữ & phản chiếu.
 */
function sanitizeValue(value) {
  if (typeof value === 'string') {
    return xss(value.trim());
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const clean = {};
    for (const key of Object.keys(value)) {
      clean[key] = sanitizeValue(value[key]);
    }
    return clean;
  }
  return value;
}

const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  // req.query is a getter-only in newer Express; mutate in place instead of reassigning
  if (req.query) {
    const cleaned = sanitizeValue(req.query);
    Object.keys(req.query).forEach((k) => delete req.query[k]);
    Object.assign(req.query, cleaned);
  }
  next();
};

module.exports = sanitizeInput;
