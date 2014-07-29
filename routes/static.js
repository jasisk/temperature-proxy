module.exports = function () {
  return {
    handler: {
      directory: {
        path: './static',
        listing: false,
        index: false
      }      
    }
  };
};
