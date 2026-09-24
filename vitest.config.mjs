import infra from '@ojson/infra/vitest';

export default {
  ...infra,
  test: {
    ...(infra.test ?? {}),
    include: ['src/**/*.spec.ts'],
    globalSetup: ['./src/setup.ts'],
    reporters: ['default', './src/reporter.ts'],
  },
};
