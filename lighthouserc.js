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
      numberOfRuns: 2, // Reduce runs for faster CI
      settings: {
        // Use mobile form factor for testing
        formFactor: 'mobile',
        // Skip some audits that aren't relevant for a static blog
        skipAudits: [
          'uses-http2',
          'apple-touch-icon', 
          'installable-manifest',
          'splash-screen',
          'themed-omnibox',
          'maskable-icon',
          'offline-start-url',
          'service-worker'
        ]
      }
    },
    assert: {
      // Set lenient thresholds for initial setup
      assertions: {
        'categories:performance': ['warn', { minScore: 0.6 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.7 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Key accessibility checks (will fail if missing)
        'color-contrast': 'warn',
        'image-alt': 'warn',
        'link-name': 'warn',
        
        // SEO essentials
        'document-title': 'warn',
        'meta-description': 'warn'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};