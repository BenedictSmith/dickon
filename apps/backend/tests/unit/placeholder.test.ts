import { placeholder } from '../../src/index';

describe('Backend', () => {
  describe('placeholder', () => {
    it('should return placeholder message', () => {
      expect(placeholder()).toBe('SiloBreaker backend - Phase 1 coming soon');
    });
  });
});
