# Cookie Cruncher
<img width="1536" height="1024" alt="b00fd637-ed80-4749-9d86-4df1c4c58099" src="https://github.com/user-attachments/assets/d85edac6-ea15-4b26-97db-cf48f6290e20" />
Automatically rejects cookies on common cookie banners and hides them. But under some limitations:

Some sites randomize selectors; text matching helps but isn’t perfect.

Cross-origin iframes (e.g., Cookiebot) cannot be scripted due to browser security. In those cases the extension hides the iframe and unlocks the page; it may not set a real consent choice.

Currently supports only Hebrew and English

## Install (Developer Mode)
Clone this repository.

open chrome://extensions and enable Developer mode (top-right).

click 'Load unpacked' (top left) and choose the folder of this repo.


## Contributing

### What to contribute
- Selectors for Reject buttons of CMPs you encounter.
- Text phrases (reject) in new languages.
- Known cross-origin iframe hosts to hide (prevents stuck overlays).
- Bug fixes, perf tweaks, tests.

### How to contribute
Upon encountering a cookie banner not handled by this extension, open the browser's developer tools (Ctrl+Shift+I)

Use the inspect tool (cursor icon) to highlight the Reject button.

If you see id="some-reject-all-id" add the selector "#some-reject-all-id" to the ```buttonsSelector``` array decleration.

If you see class="some-button-class some-reject-all-class" add the selector ".some-button-class.some-reject-all-class"  to the ```buttonsSelector``` array decleration.

As a sanity check you may verify in the Console:
```Javescript
document.querySelectorAll("#some-reject-all-id").length
document.querySelectorAll(".some-button-class.some-reject-all-class").length
```
It should return > 0 on that page.

If you encounter some button text not already present in the ```rejectText``` array, feel free to add it as well.

### CSS selector tips

#id matches an element with id="id".

.class1.class2 means the same element has both classes (no spaces).

Don’t use :contains() (not a real CSS selector).

If a class has odd characters, escape it:

```
document.querySelector('.' + CSS.escape('weird:class/name'));
```

### Opening a PR
Prefer one CMP per PR.

Include site/CMP name, HTML snippet or screenshot, and the exact selector(s).
