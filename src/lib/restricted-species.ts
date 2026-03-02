// Protected/endangered bird species that cannot be sold
export const RESTRICTED_SPECIES = [
  "saker falcon", "peregrine falcon", "red-naped shaheen", "laggar falcon", "eurasian hobby",
  "alexandrine parakeet", "rose-ringed parakeet", "blossom-headed parakeet", "slaty-headed parakeet",
  "houbara bustard", "macqueen's bustard", "great indian bustard",
  "sarus crane", "demoiselle crane", "common crane",
  "western tragopan", "cheer pheasant", "monal pheasant",
  "greater flamingo", "indian skimmer", "sociable lapwing",
  "steppe eagle", "greater-spotted eagle", "imperial eagle", "pallas's fishing eagle",
  "white-rumped vulture", "indian vulture", "egyptian vulture", "king vulture",
  "pallid scops owl", "indian eagle-owl", "short-eared owl",
];

export function findRestrictedSpecies(text: string): string | null {
  const lower = text.toLowerCase();
  for (const species of RESTRICTED_SPECIES) {
    if (lower.includes(species)) {
      return species;
    }
  }
  return null;
}
