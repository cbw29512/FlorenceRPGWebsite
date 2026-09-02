module.exports = {
  ci: {
    collect: {
      staticDistDir: './',
      numberOfRuns: 1,
      url: [
        'http://localhost/index.html',
        'http://localhost/first-adventure.html',
        'http://localhost/thanks.html'
      ],
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        chromeFlags: '--headless=new --no-sandbox'
      }
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance': ['error', { minScore: 1 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 1 }]
      }
    },
    upload: { target: 'temporary-public-storage' }
  }
};
