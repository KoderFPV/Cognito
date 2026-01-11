import { Tool } from '@langchain/core/tools';

interface IWeatherInput {
  city: string;
}

interface ICalculatorInput {
  expression: string;
}

class WeatherTool extends Tool {
  name = 'get_weather';
  description = 'Pobiera aktualną pogodę dla podanego miasta w Polsce. Input: {"city": "nazwa miasta"}';

  async _call(input: string) {
    let city: string;
    try {
      const parsed = JSON.parse(input) as IWeatherInput;
      city = parsed.city;
    } catch {
      city = input;
    }

    const mockWeather: Record<string, string> = {
      warszawa: 'Słonecznie, 22°C',
      krakow: 'Pochmurno, 18°C',
      gdansk: 'Deszczowo, 15°C',
      wroclaw: 'Częściowe zachmurzenie, 20°C',
    };

    const normalizedCity = city
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const weather = mockWeather[normalizedCity] || `Brak danych dla miasta: ${city}`;

    return weather;
  }
}

class CalculatorTool extends Tool {
  name = 'calculator';
  description = 'Wykonuje obliczenia matematyczne. Obsługuje dodawanie, odejmowanie, mnożenie, dzielenie. Input: {"expression": "wyrażenie"}';

  async _call(input: string) {
    let expression: string;
    try {
      const parsed = JSON.parse(input) as ICalculatorInput;
      expression = parsed.expression;
    } catch {
      expression = input;
    }

    try {
      const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      return `Wynik: ${result}`;
    } catch {
      return 'Błąd: Nieprawidłowe wyrażenie matematyczne';
    }
  }
}

export const weatherTool = new WeatherTool();
export const calculatorTool = new CalculatorTool();
export const chatTools = [weatherTool, calculatorTool];
