// background.js
chrome.runtime.onInstalled.addListener(() => {
  const defaultLinkGroupsIndex = [
    {
      id: 'default-group',
      name: 'Default Link Group',
      linkSets: [
        { id: 'set-1', name: 'News Link Set' },
        { id: 'set-2', name: 'Tech Link Set' }
      ]
    }
  ];

  const defaultLinkSets = {
    "group_default-group_set_set-1": {
      id: 'set-1',
      name: 'News Link Set',
      data: `
        <DT><H3>Bookmarks Menu</H3>
        <DL><p>
          <DT><H3>News</H3>
          <DL><p>
            <DT><A HREF="https://arstechnica.com/">Ars Technica</A>
            <DT><A HREF="https://nplusonemag.com/online-only/">n+1 magazine</A>
            <DT><A HREF="http://readwrite.com/">Readwrite.com</A>
          </DL><p>
          <DT><H3>Magazines</H3>
          <DL><p>
            <DT><A HREF="https://www.theatlantic.com/">The Atlantic</A>
            <DT><A HREF="http://www.motherjones.com/">Mother Jones</A>
          </DL><p>
        </DL><p>
      `,
      options: {
        sections_todisplay: ['News', 'Magazines'],
        numColumns: 5,
        linkLength: 25
      }
    },
    "group_default-group_set_set-2": {
      id: 'set-2',
      name: 'Tech Link Set',
      data: `
        <DT><H3>Bookmarks Menu</H3>
        <DL><p>
          <DT><H3>Tech News</H3>
          <DL><p>
            <DT><A HREF="https://primer.on/">Primer on the DLPC A...</A>
            <DT><A HREF="https://uxhunt.com/">UX Hunt - Daily UX/UI...</A>
          </DL><p>
          <DT><H3>Platforms</H3>
          <DL><p>
            <DT><A HREF="https://techcrunch.com/">TechCrunch</A>
            <DT><A HREF="https://pand.net/">Panda</A>
          </DL><p>
        </DL><p>
      `,
      options: {
        sections_todisplay: ['Tech News', 'Platforms'],
        numColumns: 4,
        linkLength: 20
      }
    }
  };

  // Seed the index and link sets using chrome.storage.local
  chrome.storage.local.set({ linkGroupsIndex: defaultLinkGroupsIndex }, () => {
    chrome.storage.local.set(defaultLinkSets, () => {
      console.log('Default link groups and link sets seeded.');
    });
  });
});