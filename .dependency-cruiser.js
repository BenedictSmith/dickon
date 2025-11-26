module.exports = {
  forbidden: [
    // No circular dependencies
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies make code hard to maintain and test',
      from: {},
      to: {
        circular: true,
      },
    },

    // Domain layer isolation
    {
      name: 'no-domain-to-infrastructure',
      severity: 'error',
      comment: 'Domain layer must not depend on infrastructure concerns',
      from: {
        path: '^apps/backend/src/domain',
      },
      to: {
        path: '^apps/backend/src/(infrastructure|repositories)',
      },
    },
    {
      name: 'no-domain-to-services',
      severity: 'error',
      comment: 'Domain entities should not depend on application services',
      from: {
        path: '^apps/backend/src/domain',
      },
      to: {
        path: '^apps/backend/src/services',
      },
    },

    // Presentation layer isolation
    {
      name: 'no-resolvers-to-repositories',
      severity: 'error',
      comment: 'Resolvers must use service layer, not repositories directly',
      from: {
        path: '^apps/backend/src/resolvers',
      },
      to: {
        path: '^apps/backend/src/repositories',
      },
    },

    // Service layer boundaries
    {
      name: 'no-services-to-resolvers',
      severity: 'error',
      comment: 'Services cannot depend on presentation layer',
      from: {
        path: '^apps/backend/src/services',
      },
      to: {
        path: '^apps/backend/src/resolvers',
      },
    },

    // Frontend/Backend separation
    {
      name: 'no-frontend-to-backend',
      severity: 'error',
      comment: 'Frontend must communicate via GraphQL API only',
      from: {
        path: '^apps/frontend',
      },
      to: {
        path: '^apps/backend/src',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
      archi: {
        collapsePattern: '^(packages|apps)/[^/]+/src/[^/]+',
      },
    },
  },
};
