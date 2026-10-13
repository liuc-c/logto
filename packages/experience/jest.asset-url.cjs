/** Branding SVGs are imported as URLs; other SVGs retain their React-component transformer. */
module.exports = {
  process(_source, filename) {
    return { code: `module.exports = ${JSON.stringify(filename)};` };
  },
};
