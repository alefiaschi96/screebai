import { Locale } from "@/i18n/settings";

export const devEasyWords = {
  en: ["dot"],
  it: ["punto"],
};

// List of random words for drawing prompts
export const words = {
  en: [
    "airplane",
    "tree",
    "kite",
    "whale",
    "doll",
    "banana",
    "boat",
    "glass",
    "bicycle",
    "mouth",
    "bag",
    "dog",
    "hat",
    "carrot",
    "house",
    "calendar",
    "sock",
    "horse",
    "key",
    "guitar",
    "computer",
    "heart",
    "dolphin",
    "dinosaur",
    "elephant",
    "butterfly",
    "window",
    "flower",
    "fork",
    "ant",
    "strawberry",
    "seal",
    "ice cream",
    "glove",
    "cat",
    "lion",
    "book",
    "moon",
    "sleeping moon",
    "snail",
    "toy car",
    "hand",
    "pencil",
    "apple",
    "cow",
    "cloud",
    "glasses",
    "eye",
    "umbrella",
    "watch",
    "bear",
    "ball",
    "soccer ball",
    "balloon",
    "sheep",
    "pen",
    "marker",
    "paintbrush",
    "fish",
    "pizza",
    "chicken",
    "door",
    "puzzle",
    "notebook",
    "frog",
    "spider",
    "robot",
    "shoe",
    "chair",
    "sun",
    "smiling sun",
    "star",
    "cup",
    "table",
    "phone",
    "tiger",
    "cake",
    "toy train",
    "backpack",
    "yo-yo",
  ],
  it: [
    "aereo",
    "albero",
    "aquilone",
    "balena",
    "bambola",
    "banana",
    "barca",
    "bicchiere",
    "bicicletta",
    "bocca",
    "borsa",
    "cane",
    "cappello",
    "carota",
    "casa",
    "calendario",
    "calzino",
    "cavallo",
    "chiave",
    "chitarra",
    "computer",
    "cuore",
    "delfino",
    "dinosauro",
    "elefante",
    "farfalla",
    "finestra",
    "fiore",
    "forchetta",
    "formica",
    "fragola",
    "foca",
    "gelato",
    "guanto",
    "gatto",
    "leone",
    "libro",
    "luna",
    "luna che dorme",
    "lumaca",
    "macchinina",
    "mano",
    "matita",
    "mela",
    "mucca",
    "nuvola",
    "occhiali",
    "occhio",
    "ombrello",
    "orologio",
    "orso",
    "palla",
    "pallone",
    "palloncino",
    "pecora",
    "penna",
    "pennarello",
    "pennello",
    "pesce",
    "pizza",
    "pollo",
    "porta",
    "puzzle",
    "quaderno",
    "rana",
    "ragno",
    "robot",
    "scarpa",
    "sedia",
    "sole",
    "sole che sorride",
    "stella",
    "tazza",
    "tavolo",
    "telefono",
    "tigre",
    "torta",
    "trenino",
    "zaino",
    "yo-yo",
  ],
};

// Function to get a random word from the list
export const getRandomWord = (locale: Locale): string => {
  // Usa devEasyWords in ambiente di sviluppo, words in produzione
  // const wordList = process.env.NODE_ENV === 'development' ? devEasyWords : words;
  const wordList = words;

  const randomIndex = Math.floor(Math.random() * wordList[locale].length);
  return wordList[locale][randomIndex];
};
