// Lista di piatti italiani per generare nickname
export const italianDishes = [
  'pizza_margherita',
  'lasagna',
  'carbonara',
  'risotto',
  'tiramisu',
  'cannoli',
  'gnocchi',
  'parmigiana',
  'bruschetta',
  'polenta',
  'ossobuco',
  'minestrone',
  'pesto',
  'focaccia',
  'arancini',
  'gelato',
  'panettone',
  'prosciutto',
  'mozzarella',
  'ravioli',
  'tortellini',
  'panna_cotta',
  'calzone',
  'caprese',
  'stracciatella',
  'tagliatelle',
  'bolognese',
  'amaretto',
  'biscotti',
  'ciabatta',
  'fettuccine',
  'limoncello',
  'mascarpone',
  'mortadella',
  'pancetta',
  'pecorino',
  'polpette',
  'ricotta',
  'salame',
  'sfogliatella',
  'torrone',
  'zeppole',
  'bagna_cauda',
  'cacciucco',
  'caponata',
  'cassata',
  'crostata',
  'frittata',
  'grissini',
  'involtini',
  'melanzane',
  'orecchiette',
  'pandoro',
  'pastiera',
  'saltimbocca',
  'supplì',
  'zabaione',
  'agnolotti',
  'baci_di_dama',
  'burrata',
  'cicchetti',
  'cotoletta',
  'fiorentina',
  'gorgonzola',
  'malfatti',
  'panzerotti',
  'piadina',
  'porchetta',
  'sbrisolona',
  'taralli',
  'vitello_tonnato'
];

/**
 * Genera un nickname casuale basato su piatti italiani
 * @returns Un nickname nel formato "piatto_italiano" + numero casuale a due cifre
 */
export function generateNickname(): string {
  // Seleziona un piatto casuale dalla lista
  const randomDish = italianDishes[Math.floor(Math.random() * italianDishes.length)];
  
  // Genera un numero casuale a due cifre (10-99)
  const randomNumber = Math.floor(Math.random() * 90) + 10;
  
  // Combina il piatto e il numero per creare un nickname unico
  return `${randomDish}${randomNumber}`;
}
