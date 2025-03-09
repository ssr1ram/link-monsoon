# Link monsoon

Manage hunderds of Link groups each holding multiple Link sets each holding many links
Supports Netscape file format so one can easily import and export links

## Files
.
├── background.js
├── js
│   └── tw.js
├── manifest.json
├── options.html
├── options.js
├── options.txt
├── popup.html
├── popup.js
├── readme.md
└── render.js

## Tailwindcss

We did 
```
wget https://unpkg.com/@tailwindcss/browser@4.0.12/dist/index.global.js
and renamed index.global.js to js/tw.js
```

TODO: Think of a more elegant way to get tailwind since chrome does not allow cdn usage in extensions.


## Bookmark CRUD

Use firefox 

Setup
- create a separate profile and import the html file (Settings -> Import bookmarks as html)
- use the "Selective Bookmarks Export tool" add-on https://addons.mozilla.org/en-US/firefox/addon/bookmarks-export-tool/

CRUD - Use browser bookmark star and place in folder as needed
Export - Use add-on tool to export folder

## tl;dr what is Link Monsoon?

Link Monsoon lets you organize thousands of links and easily naviagte between them.

The extension changes your new tab to the primary interface

## Points of note

- Link Groups hold multiple Link sets
- Each Link set is a bookmark file in the Netscape boomark format (what you get when you export bookmarks from say your browser in html)
- Browser bookmarks have a concept of a folder. Each folder contains multiple links. A Link Set within Link Monsoon represents a folder that contains many links

.
├── Link Group A
│   ├── Link Set 1
│   │   ├── Link 1-1
│   │   └── Link 1-2
│   └── Link Set 2
│       ├── Link 2-1
│       └── Link 2-2
└── Link Group B
    └── Link Set 3
        ├── Link 3-1
        └── Link 3-2

- The Folder name "Bookmark Menu" is filtered out
- All data is stored in chrome local storage
