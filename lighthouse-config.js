/**
 * Lighthouse configuration for performance testing
 * Defines audit settings for CI/CD performance monitoring
 */

module.exports = {
  extends: 'lighthouse:default',
  settings: {
    // Set to performance baseline (4G throttling)
    throttlingMethod: 'simulate',
    throttling: {
      rttMs: 150,
      downstreamThroughputKbps: 1.6 * 1024, // 1.6mbps
      upstreamThroughputKbps: 750,
      cpuSlowdownMultiplier: 4,
    },
    // Skip these audits
    skipAudits: ['uses-http2'],
  },
  audits: [
    // Performance audits
    'first-contentful-paint',
    'largest-contentful-paint',
    'cumulative-layout-shift',
    'total-blocking-time',
    'speed-index',
    'time-to-first-byte',
    'performance-budget',
    // Accessibility audits
    'aria-allowed-attr',
    'aria-command-name',
    'aria-hidden-focus',
    'aria-hidden-body',
    'aria-required-attr',
    'aria-required-children',
    'aria-required-parent',
    'aria-roles',
    'aria-toggle-field-name',
    'aria-unsupported-attr',
    'aria-valid-attr-role',
    'aria-valid-attr',
    'button-name',
    'bypass',
    'color-contrast',
    'definition-list',
    'dlitem',
    'document-title',
    'empty-heading',
    'form-field-multiple-labels',
    'frame-focusable-content',
    'frame-title',
    'heading-order',
    'html-has-lang',
    'html-lang-valid',
    'image-alt',
    'input-image-alt',
    'input-button-name',
    'label',
    'link-name',
    'link-page-heading',
    'list',
    'listitem',
    'meta-refresh',
    'meta-viewport',
    'object-alt',
    'radio-group',
    'scope-attr-valid',
    'select-name',
    'server-response-time',
    'tabindex',
    'td-headers-attr',
    'th-has-data-cells',
    'valid-aria-role',
    'video-caption',
    'video-description',
  ],
  categories: {
    performance: {
      title: 'Performance',
      description:
        'These metrics validate the performance of your web app.',
      auditRefs: [
        { id: 'first-contentful-paint', weight: 10 },
        { id: 'largest-contentful-paint', weight: 25 },
        { id: 'cumulative-layout-shift', weight: 15 },
        { id: 'total-blocking-time', weight: 25 },
        { id: 'speed-index', weight: 10 },
      ],
    },
    accessibility: {
      title: 'Accessibility',
      description:
        'These checks ensure your app is usable by everyone.',
      auditRefs: [
        { id: 'color-contrast', weight: 3 },
        { id: 'image-alt', weight: 3 },
        { id: 'aria-required-attr', weight: 2 },
        { id: 'button-name', weight: 3 },
        { id: 'html-has-lang', weight: 3 },
      ],
    },
  },
};
