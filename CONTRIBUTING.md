# Contributing to Patchwork

Thanks for wanting to help. Patchwork exists so that non-technical people get honest, cited tech help; every contribution is measured against that.

## Ground rules

1. **Cite or don't state** applies to code too: if your change affects what Patchwork claims to users, explain how correctness is preserved.
2. **Reversibility before elegance**: prefer small, easy-to-revert changes.
3. Keep the stack boring. No frameworks, no build step, no database, unless a maintainer has agreed first in an issue.
4. Translations are first-class contributions. Add your language to `I18N` in `public/app.js` and to the stop-here messages in `netlify/functions/ask.mjs` (those must be human-written and human-reviewed, never machine-translated blindly).

## Developer Certificate of Origin (DCO)

We use the [DCO](https://developercertificate.org/) instead of a CLA. Sign your commits:

```
git commit -s -m "Add Italian translation"
```

This adds a `Signed-off-by` line certifying you have the right to submit the change. No copyright assignment, no corporate paperwork. Your code stays yours, licensed under the project license.

## How to submit

1. Open an issue describing the problem or idea (for anything bigger than a typo).
2. Fork, branch, make the change, `npm run check`.
3. Open a pull request with a clear description. Small PRs get reviewed fast.
