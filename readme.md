# World Clock

A small tool that shows the current time in a few cities at once. No sign-up, no backend, nothing sent anywhere — it just runs in your browser.

## What it does

- Shows your own local time when you first open it
- Lets you search for a city and add its clock to the list
- Updates every clock once a second
- Remembers your added cities the next time you open the page
- Lets you remove a city with one click

## Why

Most world clock sites are cluttered with ads or need an account. This one is just the clock — open the page and it works.

## Running it locally

Timezone data comes straight from the browser, so there's nothing to install. But some browsers block local storage when you open a file directly (`file://`), so it's best to serve it over a local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Files

| File | What's in it |
|---|---|
| `index.html` | Page structure |
| `styles.css` | Look and layout |
| `helpers.js` | The actual timezone logic — pure functions, no page stuff mixed in |
| `app.js` | Connects the logic to the page — search, add, remove, tick every second |
| `helpers.test.js` | Tests for `helpers.js`, run with `node --test` |

## Testing

```bash
node --test
```

## Notes

Built as one of several small browser tools that all follow the same idea: everything happens on your machine, nothing gets sent to a server.

