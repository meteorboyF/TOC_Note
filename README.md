# TOC Notes — CSE 2233 Theory of Computation

Interactive study notes for the UIU CSE 2233 mid-term, built from 21 past papers (2018–2026), class notes and slides.

**Live site:** https://meteorboyf.github.io/TOC_Note/

- **Basic Concepts** — symbols, alphabets, strings, Σⁿ, languages, the 5-tuple, δ̂, with small interactive tools.
- **DFA** — 12 question types (recipe, tricks, traps), with every past DFA question solved: state meanings, step-by-step construction, transition table, 5-tuple and an interactive step-by-step visualiser.
- **Past Papers** — every paper question by question, tagged by topic and linked to its solution.

Coming next: NFA, ε-NFA, NFA/ε-NFA → DFA, NFA trees, regular expressions.

## How the DFAs are made (and checked)

The site is static (no build step needed to view it). DFA content lives in `tools/`:

- `tools/questions.mjs` — each question's language written as an exact predicate.
- `tools/notes.mjs` — the type-wise notes and per-question explanations / state meanings.
- `tools/build.mjs` — builds the **minimal DFA** for every predicate (Myhill–Nerode), checks it against the predicate on **every string up to length 8–18**, checks the sample strings printed on the papers, and writes `assets/data/dfa-data.js`.

```bash
node tools/build.mjs          # rebuild + verify
node tools/build.mjs --dump   # also print every state, to write state meanings
```

Diagrams are laid out in the browser by Graphviz ([viz-js](https://github.com/mdaines/viz-js), vendored in `assets/vendor/`).

To preview locally: `python3 -m http.server` in this folder, then open http://localhost:8000.
