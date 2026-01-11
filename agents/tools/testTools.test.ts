import { describe, it, expect } from 'vitest';
import { weatherTool, calculatorTool, chatTools } from './testTools';

describe('testTools', () => {
  describe('WeatherTool', () => {
    it('should have correct name', () => {
      expect(weatherTool.name).toBe('get_weather');
    });

    it('should have description', () => {
      expect(weatherTool.description).toContain('pogod');
    });

    it('should return weather for Warszawa', async () => {
      const result = await weatherTool.invoke('{"city":"Warszawa"}');

      expect(result).toBe('Słonecznie, 22°C');
    });

    it('should return weather for Kraków', async () => {
      const result = await weatherTool.invoke('{"city":"Kraków"}');

      expect(result).toBe('Pochmurno, 18°C');
    });

    it('should return weather for Gdańsk', async () => {
      const result = await weatherTool.invoke('{"city":"Gdańsk"}');

      expect(result).toBe('Deszczowo, 15°C');
    });

    it('should return weather for Wroclaw (without diacritics)', async () => {
      const result = await weatherTool.invoke('{"city":"Wroclaw"}');

      expect(result).toBe('Częściowe zachmurzenie, 20°C');
    });

    it('should handle city name without diacritics', async () => {
      const result = await weatherTool.invoke('{"city":"Krakow"}');

      expect(result).toBe('Pochmurno, 18°C');
    });

    it('should handle city name with mixed case', async () => {
      const result = await weatherTool.invoke('{"city":"WARSZAWA"}');

      expect(result).toBe('Słonecznie, 22°C');
    });

    it('should handle lowercase city name', async () => {
      const result = await weatherTool.invoke('{"city":"gdansk"}');

      expect(result).toBe('Deszczowo, 15°C');
    });

    it('should return fallback for unknown city', async () => {
      const result = await weatherTool.invoke('{"city":"Poznań"}');

      expect(result).toBe('Brak danych dla miasta: Poznań');
    });

    it('should handle plain string input (not JSON)', async () => {
      const result = await weatherTool.invoke('Warszawa');

      expect(result).toBe('Słonecznie, 22°C');
    });

    it('should handle plain string for unknown city', async () => {
      const result = await weatherTool.invoke('Łódź');

      expect(result).toBe('Brak danych dla miasta: Łódź');
    });
  });

  describe('CalculatorTool', () => {
    it('should have correct name', () => {
      expect(calculatorTool.name).toBe('calculator');
    });

    it('should have description', () => {
      expect(calculatorTool.description).toContain('obliczenia');
    });

    it('should calculate addition', async () => {
      const result = await calculatorTool.invoke('{"expression":"2+2"}');

      expect(result).toBe('Wynik: 4');
    });

    it('should calculate subtraction', async () => {
      const result = await calculatorTool.invoke('{"expression":"10-3"}');

      expect(result).toBe('Wynik: 7');
    });

    it('should calculate multiplication', async () => {
      const result = await calculatorTool.invoke('{"expression":"5*6"}');

      expect(result).toBe('Wynik: 30');
    });

    it('should calculate division', async () => {
      const result = await calculatorTool.invoke('{"expression":"20/4"}');

      expect(result).toBe('Wynik: 5');
    });

    it('should handle complex expression', async () => {
      const result = await calculatorTool.invoke('{"expression":"(2+3)*4"}');

      expect(result).toBe('Wynik: 20');
    });

    it('should handle nested parentheses', async () => {
      const result = await calculatorTool.invoke('{"expression":"((2+3)*2)+5"}');

      expect(result).toBe('Wynik: 15');
    });

    it('should handle decimal numbers', async () => {
      const result = await calculatorTool.invoke('{"expression":"3.5+2.5"}');

      expect(result).toBe('Wynik: 6');
    });

    it('should handle plain string input', async () => {
      const result = await calculatorTool.invoke('7*8');

      expect(result).toBe('Wynik: 56');
    });

    it('should sanitize dangerous characters and reject malformed expression', async () => {
      const result = await calculatorTool.invoke('{"expression":"2+2; console.log(1)"}');

      expect(result).toBe('Błąd: Nieprawidłowe wyrażenie matematyczne');
    });

    it('should handle division by zero', async () => {
      const result = await calculatorTool.invoke('{"expression":"5/0"}');

      expect(result).toBe('Wynik: Infinity');
    });

    it('should return error for invalid expression', async () => {
      const result = await calculatorTool.invoke('{"expression":""}');

      expect(result).toBe('Błąd: Nieprawidłowe wyrażenie matematyczne');
    });

    it('should handle expression with spaces (sanitized)', async () => {
      const result = await calculatorTool.invoke('{"expression":"2 + 2"}');

      expect(result).toBe('Wynik: 4');
    });
  });

  describe('chatTools array', () => {
    it('should contain two tools', () => {
      expect(chatTools).toHaveLength(2);
    });

    it('should contain weatherTool', () => {
      const weather = chatTools.find((t) => t.name === 'get_weather');
      expect(weather).toBeDefined();
    });

    it('should contain calculatorTool', () => {
      const calc = chatTools.find((t) => t.name === 'calculator');
      expect(calc).toBeDefined();
    });
  });
});
