module.exports = {
  ci: {
    collect: {
      // Test the live production site instead of building locally
      url: [
        'https://techdufus.com/',
        'https://techdufus.com/blog/',
        'https://techdufus.com/setup/',
        'https://techdufus.com/contact/'
      ],
      numberOfRuns: 3, // Run multiple times for more reliable results
      settings: {
        // Test mobile performance (more realistic for blog)
        preset: 'mobile',
        // Use default mobile throttling for realistic results
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
        // Skip some audits that aren't relevant for a blog
        skipAudits: [
          'uses-http2',
          'apple-touch-icon',
          'installable-manifest',
          'splash-screen',
          'themed-omnibox',
          'content-width'
        ]
      }
    },
    assert: {
      // Set reasonable thresholds for a blog site
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Specific performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'interactive': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        
        // Accessibility checks
        'color-contrast': 'error',
        'heading-order': 'error',
        'image-alt': 'error',
        'link-name': 'error',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        
        // SEO checks
        'meta-description': 'error',
        'document-title': 'error',
        'robots-txt': 'warn',
        'canonical': 'warn'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};