# Chrome Web Store Privacy Justifications

Copy this content into each field of the Chrome Web Store Privacy section.

---

## Single Purpose Description

```
Export and import YouTube subscriptions between accounts without using APIs. Helps users migrate or backup their YouTube subscriptions through simple JSON export/import functionality.
```

---

## Permission Justifications

### activeTab Justification

```
Required to access the current YouTube page (subscriptions list or channel pages) only when the user clicks the extension icon. This permission allows the extension to read subscription data from the DOM and automate subscription clicks on channel pages.
```

### scripting Justification

```
Required to inject content scripts into YouTube pages to extract subscription data from the DOM during export and to automate clicking the subscribe button during import. Scripts only run on YouTube.com when the user initiates export or import actions.
```

### storage Justification

```
Required to save user preferences (rate limiting settings, delay configurations) and temporarily store import progress to enable pause/resume functionality. All data is stored locally in the browser and never transmitted externally.
```

### downloads Justification

```
Required to generate and download the JSON file containing exported subscription data. The extension creates a local JSON file with subscription information and triggers a browser download so users can save and import their subscriptions to other accounts.
```

### Host Permission Justification (https://www.youtube.com/*)

```
Required to access YouTube pages for reading subscription data from the subscriptions page and automating subscribe button clicks on channel pages. The extension only operates on YouTube.com and does not access any other websites. No data is sent to external servers.
```

---

## Are you using remote code?

**Select:** No, I am not using remote code

---

## Additional Notes

- All processing happens locally in the user's browser
- No external APIs or servers are used
- No user data is collected, stored remotely, or transmitted
- The extension is fully open source and transparent about its operations
- Users maintain complete control over their data
