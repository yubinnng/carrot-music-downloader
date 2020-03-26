/**
 * @author xue chen
 * @since 2020/3/25
 */


const {addDecoratorsLegacy, override} = require("customize-cra");

module.exports = override(
  addDecoratorsLegacy()
);