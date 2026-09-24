export type Triple = {
  spec: string;
  requirement: string;
  scenario: string;
};

export function tripleKey(triple: Triple): string {
  return `${triple.spec}\0${triple.requirement}\0${triple.scenario}`;
}
