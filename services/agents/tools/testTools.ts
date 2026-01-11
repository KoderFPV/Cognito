import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const weatherTool = tool(
  async ({ city }: { city: string }) => {
    const mockWeather: Record<string, string> = {
      warszawa: 'Słonecznie, 22°C',
      kraków: 'Pochmurno, 18°C',
      gdansk: 'Deszczowo, 15°C',
      wrocław: 'Częściowe zachmurzenie, 20°C',
    };

    const normalizedCity = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const weather = mockWeather[normalizedCity] || `Brak danych dla miasta: ${city}`;

    return weather;
  },
  {
    name: 'get_weather',
    description: 'Pobiera aktualną pogodę dla podanego miasta w Polsce',
    schema: z.object({
      city: z.string().describe('Nazwa miasta w Polsce'),
    }),
  }
);

export const calculatorTool = tool(
  async ({ expression }: { expression: string }) => {
    try {
      const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      return `Wynik: ${result}`;
    } catch {
      return 'Błąd: Nieprawidłowe wyrażenie matematyczne';
    }
  },
  {
    name: 'calculator',
    description: 'Wykonuje obliczenia matematyczne. Obsługuje dodawanie, odejmowanie, mnożenie, dzielenie.',
    schema: z.object({
      expression: z.string().describe('Wyrażenie matematyczne, np. "2 + 2" lub "10 * 5"'),
    }),
  }
);

export const chatTools = [weatherTool, calculatorTool];
