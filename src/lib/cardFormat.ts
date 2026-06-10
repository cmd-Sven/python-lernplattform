import type { CardType, Flashcard } from "./types";

export function getCardType(card: Flashcard): CardType {
  if (card.cardType) return card.cardType;
  if (card.multipleChoice) return "multiple_choice";
  return "flip";
}

export function isMultipleChoiceCard(card: Flashcard): boolean {
  return getCardType(card) === "multiple_choice";
}
