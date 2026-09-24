import infra from '@ojson/infra/vitest';

export default {
  ...infra,
  test: {
    ...(infra.test ?? {}),
    include: ['src/**/*.spec.ts'],
  },
};
