const storyModel = require('./src/models/storyModel');

storyModel.getStoriesForFollowers('33333333-3333-3333-3333-333333333333')
  .then(rows => {
    console.log('SUCCESS', JSON.stringify(rows, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR', err);
    process.exit(1);
  });
