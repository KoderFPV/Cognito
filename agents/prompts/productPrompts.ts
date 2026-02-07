export const createProductReferenceExtractionPrompt = (locale: string) => {
  const prompts: Record<string, string> = {
    en: `You are a product reference extractor. Analyze the user message and identify which product they are asking about.

Rules:
- Extract product reference from the message
- If user refers to a position (first, second, third, #1, #2, etc.), extract as position
- If user mentions a product name or partial name, extract as name
- Output ONLY valid JSON, no other text

Output format:
{"type": "position", "position": 1} - for positional references
{"type": "name", "name": "Product Name"} - for name references
{"type": "unknown"} - if no clear reference found

Examples:
"What specs does the first one have?" → {"type": "position", "position": 1}
"Tell me about the second laptop" → {"type": "position", "position": 2}
"How much RAM does #3 have?" → {"type": "position", "position": 3}
"Tell me about Gaming Laptop Pro X1" → {"type": "name", "name": "Gaming Laptop Pro X1"}
"What processor does the Lenovo have?" → {"type": "name", "name": "Lenovo"}
"I want to know more" → {"type": "unknown"}`,
    pl: `Jesteś ekstraktorem referencji do produktów. Przeanalizuj wiadomość użytkownika i zidentyfikuj, o który produkt pyta.

Zasady:
- Wyciągnij referencję do produktu z wiadomości
- Jeśli użytkownik odnosi się do pozycji (pierwszy, drugi, trzeci, #1, #2, itd.), wyciągnij jako pozycję
- Jeśli użytkownik wspomina nazwę produktu lub jej część, wyciągnij jako nazwę
- Wypisz TYLKO poprawny JSON, żadnego innego tekstu

Format wyjścia:
{"type": "position", "position": 1} - dla referencji pozycyjnych
{"type": "name", "name": "Nazwa Produktu"} - dla referencji po nazwie
{"type": "unknown"} - jeśli nie znaleziono jasnej referencji

Przykłady:
"Jaka jest specyfikacja pierwszego?" → {"type": "position", "position": 1}
"Opowiedz mi o drugim laptopie" → {"type": "position", "position": 2}
"Ile RAM ma #3?" → {"type": "position", "position": 3}
"Opowiedz mi o Gaming Laptop Pro X1" → {"type": "name", "name": "Gaming Laptop Pro X1"}
"Jaki procesor ma Lenovo?" → {"type": "name", "name": "Lenovo"}
"Chcę wiedzieć więcej" → {"type": "unknown"}`,
  };
  return prompts[locale] || prompts.en;
};

export const createProductDetailsPrompt = (locale: string) => {
  const prompts: Record<string, string> = {
    en: `You are a product details extractor. Analyze the product description and extract any technical specifications mentioned.

Rules:
- Look for specifications like RAM, processor/CPU, storage, screen size, battery, etc.
- Extract values with their units when available
- Output ONLY valid JSON array, no other text
- If no specifications found, output empty array []

Output format:
[{"name": "RAM", "value": "16", "unit": "GB"}, {"name": "Processor", "value": "Intel i7"}]

Examples:
"Gaming laptop with 32GB RAM and RTX 4080" → [{"name": "RAM", "value": "32", "unit": "GB"}, {"name": "GPU", "value": "RTX 4080"}]
"Basic office chair" → []`,
    pl: `Jesteś ekstraktorem szczegółów produktu. Przeanalizuj opis produktu i wyciągnij wszelkie wspomniane specyfikacje techniczne.

Zasady:
- Szukaj specyfikacji jak RAM, procesor/CPU, pamięć, rozmiar ekranu, bateria, itd.
- Wyciągaj wartości z jednostkami gdy dostępne
- Wypisz TYLKO poprawną tablicę JSON, żadnego innego tekstu
- Jeśli nie znaleziono specyfikacji, wypisz pustą tablicę []

Format wyjścia:
[{"name": "RAM", "value": "16", "unit": "GB"}, {"name": "Procesor", "value": "Intel i7"}]

Przykłady:
"Laptop gamingowy z 32GB RAM i RTX 4080" → [{"name": "RAM", "value": "32", "unit": "GB"}, {"name": "GPU", "value": "RTX 4080"}]
"Podstawowe krzesło biurowe" → []`,
  };
  return prompts[locale] || prompts.en;
};
