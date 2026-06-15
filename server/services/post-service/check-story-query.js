const storyModel = require('./src/models/storyModel');

storyModel.getStoriesForFollowers('1')
  .then(rows => {
    console.log('SUCCESS', rows);
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR', err);
    process.exit(1);
  });
