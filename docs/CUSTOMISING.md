# Making Portico yours

Four files and one settings screen cover almost everything an agency wants to
change. None of it needs a migration.

---

## 1. The journey — `src/lib/journey.ts`

A journey is modules; a module is steps. Completion is a row in `progress`
keyed by step id, and a module unlocks when every module before it is finished.

```ts
{
  slug: "discovery",
  title: "Discovery",
  description: "Everything we need before we start.",
  steps: [
    {
      id: "discovery-brief",       // unique, stable — this is the progress key
      title: "The brief",
      description: "What you are trying to achieve, in your words.",
      type: "form",
      form: "business",            // a key in FORMS
    },
  ],
}
```

### Step types

| `type` | What it renders | Completes when |
| --- | --- | --- |
| `doc` | Markdown from `DOCS[step.doc]` | They press **Mark complete** |
| `form` | The form at `FORMS[step.form]` | They submit it |
| `upload` | A drop zone for `step.upload.category` | The first file lands |
| `checklist` | `step.checklist` as tickable items | Every item is ticked |
| `action` | A button to an external link | They press **Mark complete** |
| `board` | Their live deliverables board | They press **Mark complete** |
| `handoff` | The handoff pack | They press **Mark complete** |

Reordering or renaming is free. **Changing an existing step's `id` orphans the
progress recorded against it** — clients would see that step go incomplete. Add
a new step instead, or accept the reset.

Deleting a step is safe: `completedSteps()` filters out ids the journey no
longer knows about.

## 2. The intake forms — `src/lib/forms.ts`

```ts
business: {
  id: "business",
  title: "About your business",
  intro: "The context we would otherwise spend the first call collecting.",
  fields: [
    { id: "legal_name", label: "Business name", type: "text", required: true, half: true },
    { id: "what_you_do", label: "What do you sell?", type: "textarea", required: true,
      help: "The way you would explain it to a friend." },
    { id: "channels", label: "How do customers find you?", type: "multiselect",
      options: ["Referrals", "Search", "Paid ads"] },
  ],
}
```

Field types: `text`, `textarea`, `email`, `url`, `number`, `select`,
`multiselect`. `half: true` puts two fields on one row; anything else spans the
width. `required: true` is enforced at submit, not while they type.

Answers are one JSON blob per (client, form), so adding, removing, or renaming a
field needs no migration. Renaming a field `id` does orphan its stored answer.

## 3. The words — `src/lib/docs.ts`

The long-form content behind `doc` steps, written in Markdown. `{{portal}}` and
`{{email}}` are replaced with your portal name and support email at render time.

These are the two documents every client reads before you start work. They are
worth rewriting in your own voice — the defaults are opinionated on purpose, and
the working agreement in particular should say what *you* actually promise.

## 4. Brand and defaults — Admin → Settings

| Setting | What it touches |
| --- | --- |
| Portal name | Sidebar, login, page titles, the client-facing "from" label on files |
| Tagline | The headline on the login screen |
| Accent colour | Progress bars, focus rings, active nav, primary buttons |
| Support email | Login footer, handoff pack, the `{{email}}` token in docs |
| Welcome headline / body | The one-time intro screen |
| Kickoff booking link | The `kickoff-book` action step |
| Resources link | An optional card on the client's overview |

These live in the `settings` table. `src/lib/brand.ts` holds the defaults a
fresh install starts with and the schema that renders the settings screen — add
a key there and it appears in the UI.

## Going further

### A different look

`src/app/globals.css` starts with the whole palette as CSS variables. Change
`--bg`, `--panel`, `--border`, `--text`, and `--accent` and the entire portal
follows; the component classes below them (`.card`, `.btn`, `.chip`, `.input`,
`.bar`) are plain CSS you can read in one sitting.

The accent is also runtime-themeable from Settings, which overrides `--accent`
and derives its soft and glow variants — so keep anything accent-coloured
referencing `var(--accent)` rather than a literal.

### The logo

`src/components/Logo.tsx` is an inline SVG arch plus a wordmark that picks up
the portal name from Settings. Swap the paths for your own mark, or replace the
component with an `<Image>`. The raster versions in `public/brand/` are used for
the favicon and social previews.

### More than one project per client

Portico deliberately models one client as one engagement. If you need several
projects per client, the honest change is a `projects` table between `users` and
everything keyed by `user_id`. That is a real fork, not a setting — and a
pull request that adds it behind a flag would be welcome.
