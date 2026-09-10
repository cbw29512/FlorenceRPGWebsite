module.exports = {
  ci: {
    collect: {
      staticDistDir: './',
      numberOfRuns: 3,
      url: [
        'http://localhost/index.html',
        'http://localhost/first-adventure.html',
        'http://localhost/character-sheet-guide.html',
        'http://localhost/guild-hall.html',
        'http://localhost/one-shots.html',
        'http://localhost/tools.html',
        'http://localhost/join.html',
        'http://localhost/youth-groups.html'
      ],
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        chromeFlags: '--headless=new --no-sandbox'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 1, aggregationMethod: 'median' }],
        'categories:accessibility': ['error', { minScore: 1, aggregationMethod: 'median' }],
        'categories:best-practices': ['error', { minScore: 1, aggregationMethod: 'median' }],
        'categories:seo': ['error', { minScore: 1, aggregationMethod: 'median' }]
      }
    },
    upload: { target: 'temporary-public-storage' }
  }
};
