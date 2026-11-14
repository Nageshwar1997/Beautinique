# @beautinique/frontend-data-table

> **Status:** v1.0.0 (2026-11-14). TASKS T3.7 PR B (owner ka faisla, 2026-11-13: v1 isi kaam me).

Data-dense apps (Master, Admin, Super Admin, Support, Finance, Growth; DESIGN §10) ki **list**: badi screen pe asli `<table>`, phone (375 px) pe cards, cursor pages aur **filters URL me** (ARCHITECTURE §9.2), taaki reload, share kiya link aur browser ka Back wahi rows dikhayein. Saved views aur CSV export T6.1 me khule hain: pehli review queue (Admin, Phase 4) ke saath.

## Install

```bash
npm install @beautinique/frontend-data-table
```

Peer: `react` 19, `react-router` 8 (filters URL me). App ki CSS me, tailwind aur styles ke baad:

```css
@import '@beautinique/frontend-data-table/tailwind.css';
```

Iske bina table ki classes ki CSS nahi banti (Tailwind `node_modules` nahi padhta).

## API

| Export                                                                                                                                         | Kaam                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DataTable({ label, columns, rows, rowKey, status, refreshing, errorMessage, onRetry, empty, onOpen, openLabel, openKey, footer, tableFrom })` | `tableFrom` (default `48rem`) se upar `<table>` (`label` caption, primary column row header), neeche cards (`<ul>`; primary column title, baaki `dt`/`dd`, `hideOnCard` wale nahi). `status`: `loading` (spinner, screen reader ke liye bhi), `error` (`errorMessage` + "Try again"), `ready` (rows, ya `empty`). `onOpen` ho to primary cell ek button: Tab/Enter ya row pe kahin bhi click (button poori row pe phaila hai, row me ek hi control). `openKey` wali row `aria-current`. `refreshing`: agla page aate hue purani rows halki. |
| `Column<Row>`                                                                                                                                  | `{ key, header, cell(row), primary?, align?: 'start' \| 'end', hideOnCard?, className? }`. Primary na ho to pehla column.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `useTableUrl({ filters, pagesParam })`                                                                                                         | `filters`: har filter ka URL param aur default (`''` = koi nahi). Deta hai `{ filters, setFilters, clearFilters, filtered, cursor, page, next(nextCursor), previous() }`. Default ya `''` URL se bahar; filter badla to pehla page. Pages ek trail (`?pages=c1.c2`) ke cursors, isliye API ke peeche jaaye bina Previous chalta hai; trail me cursor ke alawa kuch ho, ya `MAX_PAGES` (50) se zyada, to pehla page.                                                                                                                         |
| `CursorPager({ page, nextCursor, onNext, onPrevious, busy, label })`                                                                           | Previous / "Page n" / Next (`nav`, default naam "Pages"). Pehla page aur aakhri ek hi ho to kuch nahi; `busy` pe dono ruke.                                                                                                                                                                                                                                                                                                                                                                                                                 |

## Example

```tsx
const url = useTableUrl({ filters: { email: '', app: '', status: 'active' } });
const grants = useApiQuery(listGrants, { query: { ...url.filters, cursor: url.cursor } });

<DataTable
  label="Staff"
  columns={COLUMNS}
  rows={grants.data?.items ?? []}
  rowKey={(g) => g.grantId}
  status={grants.isPending ? 'loading' : grants.isError ? 'error' : 'ready'}
  onRetry={() => void grants.refetch()}
  onOpen={setOpen}
  footer={
    <CursorPager
      page={url.page}
      nextCursor={grants.data?.nextCursor ?? null}
      onNext={url.next}
      onPrevious={url.previous}
    />
  }
/>;
```

## Playground

`npm run playground --workspace @beautinique/frontend-data-table`, http://localhost:5188: banawati staff list, filters aur pages URL me, server fail karke "Try again", row ka side panel (components `Dialog placement="side"`), app-shell `SectionLayout`, light/dark aur 375 px.

## Tests

`npm test`: table aur cards (matchMedia se chaudai), states, ek control per row, keyboard, axe; URL filters, pages ka trail, Back, ganda trail, `MAX_PAGES`; pager.

## Change log

| Version | Date       | Badlav                                                                                                                                             |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-11-14 | Pehla: `DataTable`, `useTableUrl`, `CursorPager`, `tailwind.css`, playground. Review (T3.7 PR C): `footer` (pager) loading aur khaali page pe bhi. |

## License

MIT © Nageshwar Pawar
