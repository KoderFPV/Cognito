import { describe, it, expect } from 'vitest';
import {
  createProductReferenceExtractionPrompt,
  createProductDetailsPrompt,
} from './productPrompts';

describe('productPrompts', () => {
  describe('createProductReferenceExtractionPrompt', () => {
    it('should return English prompt for en locale', () => {
      const prompt = createProductReferenceExtractionPrompt('en');

      expect(prompt).toContain('product reference extractor');
      expect(prompt).toContain('position');
      expect(prompt).toContain('name');
      expect(prompt).toContain('Output ONLY valid JSON');
    });

    it('should return Polish prompt for pl locale', () => {
      const prompt = createProductReferenceExtractionPrompt('pl');

      expect(prompt).toContain('ekstraktorem referencji');
      expect(prompt).toContain('pozycji');
      expect(prompt).toContain('nazw');
      expect(prompt).toContain('TYLKO poprawny JSON');
    });

    it('should fallback to English for unknown locale', () => {
      const prompt = createProductReferenceExtractionPrompt('fr');

      expect(prompt).toContain('product reference extractor');
      expect(prompt).toContain('Output ONLY valid JSON');
    });

    it('should include example output formats', () => {
      const prompt = createProductReferenceExtractionPrompt('en');

      expect(prompt).toContain('{"type": "position", "position": 1}');
      expect(prompt).toContain('{"type": "name", "name":');
      expect(prompt).toContain('{"type": "unknown"}');
    });
  });

  describe('createProductDetailsPrompt', () => {
    it('should return English prompt for en locale', () => {
      const prompt = createProductDetailsPrompt('en');

      expect(prompt).toContain('product details extractor');
      expect(prompt).toContain('RAM');
      expect(prompt).toContain('processor');
      expect(prompt).toContain('Output ONLY valid JSON array');
    });

    it('should return Polish prompt for pl locale', () => {
      const prompt = createProductDetailsPrompt('pl');

      expect(prompt).toContain('ekstraktorem szczegółów produktu');
      expect(prompt).toContain('RAM');
      expect(prompt).toContain('procesor');
      expect(prompt).toContain('TYLKO poprawną tablicę JSON');
    });

    it('should fallback to English for unknown locale', () => {
      const prompt = createProductDetailsPrompt('de');

      expect(prompt).toContain('product details extractor');
      expect(prompt).toContain('Output ONLY valid JSON array');
    });

    it('should include example output format', () => {
      const prompt = createProductDetailsPrompt('en');

      expect(prompt).toContain('[{"name": "RAM", "value":');
      expect(prompt).toContain('"unit":');
    });
  });
});
