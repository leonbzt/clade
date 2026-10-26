// Codex text, from docs/research/moss-facts.md. Lines whose source is from memory or missing ship [unverified].
import type { NodeId } from './tree';

export interface CodexLine {
  text: string;
  sources: string[];
  unverified: boolean;
}

export interface CodexCard {
  node: NodeId;
  title: string;
  lines: CodexLine[];
}

export const CODEX: CodexCard[] = [
  {
    node: 'mosses',
    title: 'Mosses',
    lines: [
      {
        // moss-facts claim 10: moss-specific features are from memory
        text: 'Mosses grow leafy shoots from a thread-like protonema. Most also gain peristome teeth, which meter out spores.',
        sources: [],
        unverified: true,
      },
      {
        // moss-facts claim 6
        text: 'On Surtsey, mosses came first: Funaria and Bryum appeared near steam vents in 1967. Lichens followed in 1970.',
        sources: ['https://english.surtsey.is/?p=1077', 'https://bg.copernicus.org/articles/11/4415/2014/'],
        unverified: false,
      },
    ],
  },
];
