window.submenuOptions = [
  {
    config: {
    id: 'link-sets',
    label: 'Link Sets',
    menuId: 'link-sets-menu',
    sectionId: 'link-sets-section'
},
    html: `<div id="link-sets-section" class="section-content">
    <div class="section-container">
        <div class="mb-4">
            <label for="link-groups" class="block text-xs font-medium text-gray-700 mb-2">Select Link Group and Set:</label>
            <div class="flex flex-col sm:flex-row gap-4">
                <div class="flex flex-col w-full max-w-md">
                    <select id="link-groups" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <!-- Populated dynamically -->
                    </select>
                </div>
                <div class="flex flex-col gap-2 w-full max-w-md">
                    <select id="link-sets" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <!-- Populated dynamically -->
                    </select>
                    <div class="flex justify-end">
                        <button id="add-link-set" class="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2 text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>Upload Link set</span>
                        </button>
                    </div>
                </div>
            </div>
            <input type="file" id="upload-input" class="hidden">
        </div>
        <div class="mb-4">
            <div class="grid grid-cols-3 gap-4 items-center">
                <label for="num-columns" class="col-span-2 text-xs font-medium text-gray-700">Number of Columns (2-12):</label>
                <input type="number" id="num-columns" min="2" max="12" class="col-span-1 w-full max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="grid grid-cols-3 gap-4 items-center">
                <label for="link-length" class="col-span-2 text-xs font-medium text-gray-700">Link Text Length (10-100):</label>
                <input type="number" id="link-length" min="10" max="100" class="col-span-1 w-full max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
        </div>
        <div id="sections-list" class="space-y-4 mb-6"></div>
        <button id="save" class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm">Save</button>
    </div>
</div>`,
    init: function init() {
    const sectionsList = document.getElementById('sections-list');
    const saveButton = document.getElementById('save');
    const status = document.getElementById('status');
    const numColumnsInput = document.getElementById('num-columns');
    const linkLengthInput = document.getElementById('link-length');
    const uploadInput = document.getElementById('upload-input');
    const linkGroupsSelect = document.getElementById('link-groups');
    const linkSetsSelect = document.getElementById('link-sets');
    const addLinkSetButton = document.getElementById('add-link-set');
    // const addGroupButton = document.getElementById('add-group');
    // const groupNameInput = document.getElementById('group-name');

    // Load data
    chrome.storage.local.get(['linkGroupsIndex'], (result) => {
        const linkGroups = result.linkGroupsIndex || [];

        // Populate link groups dropdown
        populateLinkGroups(linkGroups);

        // Initial load of sets and options
        updateLinkSets();
        loadOptions();

        // Handle group and set changes
        linkGroupsSelect.addEventListener('change', updateLinkSets);
        linkSetsSelect.addEventListener('change', loadOptions);

        // Handle upload
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const htmlContent = event.target.result;
                    const groupId = linkGroupsSelect.value;
                    addLinkSet(groupId, htmlContent);
                };
                reader.readAsText(file);
            }
        });

        addLinkSetButton.addEventListener('click', () => {
            uploadInput.click();
        });

        // Handle adding a new group
        // addGroupButton.addEventListener('click', () => {
        //     const groupName = groupNameInput.value.trim();
        //     if (groupName) {
        //         addNewGroup(groupName);
        //         groupNameInput.value = '';
        //     } else {
        //         status.textContent = 'Please enter a group name.';
        //         status.style.color = 'red';
        //         setTimeout(() => { status.textContent = '   '; }, 2000);
        //     }
        // });
    });

    function populateLinkGroups(linkGroups) {
        linkGroupsSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a group';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        linkGroupsSelect.appendChild(defaultOption);

        linkGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            linkGroupsSelect.appendChild(option);
        });
    }

    function updateLinkSets() {
        linkSetsSelect.innerHTML = '';
        const groupId = linkGroupsSelect.value;
        chrome.storage.local.get(['linkGroupsIndex'], (result) => {
            const linkGroups = result.linkGroupsIndex || [];
            const group = linkGroups.find(g => g.id === groupId);
            if (group) {
                group.linkSets.forEach(set => {
                    const option = document.createElement('option');
                    option.value = set.id;
                    option.textContent = set.name;
                    linkSetsSelect.appendChild(option);
                });
                if (group.linkSets.length > 0) loadOptions();
            }
        });
    }

    function loadOptions() {
        const groupId = linkGroupsSelect.value;
        const setId = linkSetsSelect.value;
        const key = `group_${groupId}_set_${setId}`;
        chrome.storage.local.get([key], (result) => {
            const linkSet = result[key];
            if (linkSet) {
                sectionsList.innerHTML = '';
                const sections = parseBookmarkData(linkSet.data).filter(section => 
                    section.title.toLowerCase() !== "bookmarks menu"
                );
                if (sections.length === 0) {
                    const message = document.createElement('p');
                    message.textContent = 'No sections found in this link set.';
                    message.className = 'text-red-500';
                    sectionsList.appendChild(message);
                } else {
                    sections.forEach(section => {
                        const div = document.createElement('div');
                        div.className = 'section-checkbox';
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.id = section.title;
                        checkbox.value = section.title;
                        checkbox.checked = linkSet.options?.sections_todisplay?.includes(section.title) || true;
                        const label = document.createElement('label');
                        label.htmlFor = section.title;
                        label.textContent = section.title;
                        div.appendChild(checkbox);
                        div.appendChild(label);
                        sectionsList.appendChild(div);
                    });
                }
                numColumnsInput.value = linkSet.options?.numColumns || 5;
                linkLengthInput.value = linkSet.options?.linkLength || 25;
            }
        });
    }

    function addNewGroup(groupName) {
        chrome.storage.local.get(['linkGroupsIndex'], (result) => {
            let linkGroups = result.linkGroupsIndex || [];
            const newGroupId = `group-${Date.now()}`;
            const newGroup = {
                id: newGroupId,
                name: groupName,
                linkSets: []
            };

            linkGroups.push(newGroup);
            const updateData = { linkGroupsIndex: linkGroups };

            chrome.storage.local.set(updateData, () => {
                status.textContent = `Group "${groupName}" added.`;
                status.style.color = 'blue';
                setTimeout(() => { status.textContent = '   '; }, 2000);
                populateLinkGroups(linkGroups);
                linkGroupsSelect.value = newGroupId;
                updateLinkSets();
            });
        });
    }

    function addLinkSet(groupId, htmlContent) {
        chrome.storage.local.get(['linkGroupsIndex'], (result) => {
            let linkGroups = result.linkGroupsIndex || [];
            const group = linkGroups.find(g => g.id === groupId) || { id: groupId, name: groupId, linkSets: [] };
            if (!linkGroups.find(g => g.id === groupId)) {
                linkGroups.push(group);
            }

            const newSetId = `set-${Date.now()}`;
            const newSetKey = `group_${groupId}_set_${newSetId}`;
            const sections = parseBookmarkData(htmlContent).filter(section => 
                section.title.toLowerCase() !== "bookmarks menu"
            ).map(s => s.title);
            const newLinkSet = {
                id: newSetId,
                name: `Link Set ${group.linkSets.length + 1}`,
                data: htmlContent,
                options: {
                    sections_todisplay: sections,
                    numColumns: 5,
                    linkLength: 25
                }
            };

            group.linkSets.push({ id: newSetId, name: newLinkSet.name });
            const updateData = {
                linkGroupsIndex: linkGroups,
                [newSetKey]: newLinkSet
            };

            chrome.storage.local.set(updateData, () => {
                status.textContent = 'Link set added.';
                status.style.color = 'blue';
                setTimeout(() => { status.textContent = '   '; }, 2000);
                updateLinkSets();
                linkSetsSelect.value = newSetId;
                loadOptions();
            });
        });
    }

    saveButton.addEventListener('click', () => {
        const groupId = linkGroupsSelect.value;
        const setId = linkSetsSelect.value;
        const key = `group_${groupId}_set_${setId}`;
        const selectedSections = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        const numColumns = parseInt(numColumnsInput.value, 10);
        const linkLength = parseInt(linkLengthInput.value, 10);

        if (isNaN(numColumns) || numColumns < 2 || numColumns > 12) {
            status.textContent = 'Number of columns must be between 2 and 12.';
            status.style.color = 'red';
            return;
        }
        if (isNaN(linkLength) || linkLength < 10 || linkLength > 100) {
            status.textContent = 'Link text length must be between 10 and 100.';
            status.style.color = 'red';
            return;
        }

        chrome.storage.local.get([key], (result) => {
            let linkSet = result[key];
            if (linkSet) {
                linkSet.options = {
                    sections_todisplay: selectedSections,
                    numColumns: numColumns,
                    linkLength: linkLength
                };
                chrome.storage.local.set({ [key]: linkSet }, () => {
                    status.textContent = 'Options saved.';
                    status.style.color = 'blue';
                    setTimeout(() => { status.textContent = '   '; }, 2000);
                });
            }
        });
    });

    function parseBookmarkData(htmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const sections = [];

        function parseSections(element) {
            const children = element.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.tagName === 'DT' || child.tagName === 'DL') {
                    if (child.tagName === 'DT') {
                        let h3 = null;
                        let dl = null;
                        const dtChildren = child.children;
                        for (let j = 0; j < dtChildren.length; j++) {
                            const dtChild = dtChildren[j];
                            if (dtChild.tagName === 'H3') {
                                h3 = dtChild;
                            } else if (dtChild.tagName === 'DL' && h3) {
                                dl = dtChild;
                                break;
                            }
                        }

                        if (h3 && dl) {
                            const links = [];
                            const collectLinks = (dlElement) => {
                                const aElements = dlElement.getElementsByTagName('a');
                                Array.from(aElements).forEach(a => {
                                    if (a.getAttribute('HREF')) {
                                        links.push({
                                            text: a.textContent.trim(),
                                            href: a.getAttribute('HREF')
                                        });
                                    }
                                });
                            };
                            collectLinks(dl);

                            if (links.length > 0) {
                                sections.push({ title: h3.textContent.trim(), links, weight: links.length });
                            }
                        }
                    }
                    parseSections(child);
                }
            }
        }

        const body = doc.querySelector('body');
        if (body) {
            parseSections(body);
        }
        return sections;
    }
}
  },
  {
    config: {
    id: 'link-groups',
    label: 'Link Groups',
    menuId: 'link-groups-menu',
    sectionId: 'link-groups-section'
},
    html: `<div id="link-groups-section" class="section-content">
    <div class="section-container">
        <div class="mb-6">
            <label for="group-name" class="block text-xs font-medium text-gray-700 mb-2">New Group Name:</label>
            <div class="flex flex-col sm:flex-row gap-4">
                <input type="text" id="group-name" class="w-full max-w-md px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <button id="add-group" class="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <span>Group</span>
                </button>
            </div>
        </div>
        <hr class="border-gray-200 mb-6">
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <h2 class="text-base font-semibold mb-4 text-gray-900">Help</h2>
            <p class="text-xs text-gray-600">This section will contain help content and documentation for using the extension options.</p>
        </div>
    </div>
</div>`,
    init: function init() {
    const addGroupButton = document.getElementById('add-group');
    const groupNameInput = document.getElementById('group-name');
    const status = document.getElementById('status');

    addGroupButton.addEventListener('click', () => {
        const groupName = groupNameInput.value.trim();
        if (groupName) {
            chrome.storage.local.get(['linkGroupsIndex'], (result) => {
                let linkGroups = result.linkGroupsIndex || [];
                const newGroupId = `group-${Date.now()}`;
                const newGroup = {
                    id: newGroupId,
                    name: groupName,
                    linkSets: []
                };

                linkGroups.push(newGroup);
                const updateData = { linkGroupsIndex: linkGroups };

                chrome.storage.local.set(updateData, () => {
                    status.textContent = `Group "${groupName}" added.`;
                    status.style.color = 'blue';
                    setTimeout(() => { status.textContent = '   '; }, 2000);
                    groupNameInput.value = '';
                });
            });
        } else {
            status.textContent = 'Please enter a group name.';
            status.style.color = 'red';
            setTimeout(() => { status.textContent = '   '; }, 2000);
        }
    });
}
  },
  {
    config: {
    id: 'dummy-settings',
    label: 'Dummy Settings',
    menuId: 'dummy-settings-menu',
    sectionId: 'dummy-settings-section'
},
    html: `<div id="dummy-settings-section" class="section-content">
    <div class="section-container">
        <div class="mb-6">
            <h2 class="text-base font-semibold mb-4 text-gray-900">Dummy Settings</h2>
            <div class="mb-4">
                <label for="dummy-option" class="block text-xs font-medium text-gray-700 mb-2">Dummy Option:</label>
                <input type="text" id="dummy-option" class="w-full max-w-md px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter dummy value">
            </div>
            <button id="save-dummy" class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm">Save Dummy Settings</button>
        </div>
    </div>
</div>`,
    init: function init() {
    document.getElementById('save-dummy').addEventListener('click', () => {
        const dummyValue = document.getElementById('dummy-option').value;
        chrome.storage.local.set({ dummyOption: dummyValue }, () => {
            const status = document.getElementById('status');
            status.textContent = 'Dummy settings saved.';
            status.style.color = 'blue';
            setTimeout(() => { status.textContent = '   '; }, 2000);
        });
    });
}
  },
  {
    config: {
    id: 'browser-bookmarks',
    label: 'Browser Bookmarks',
    menuId: 'browser-bookmarks-menu',
    sectionId: 'browser-bookmarks-section'
},
    html: `<!-- file: section.html -->
<div id="browser-bookmarks-section" class="section-content">
    <div class="section-container w-full max-w-none">
        <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
            <!-- Left Column -->
            <div class="left-column min-w-0">
                <div class="mb-6">
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button id="fetch-bookmarks" class="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2 text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            <span>Fetch Bookmarks</span>
                        </button>
                    </div>
                    <div id="status" class="mt-2 text-sm"></div>
                </div>
                <div id="bookmarks-display" class="bg-white p-6 rounded-lg shadow-sm min-h-[200px] mt-6">
                    <h2 class="text-base font-semibold mb-4 text-gray-900">Bookmarks</h2>
                    <div id="bookmarks-actions" class="flex gap-2 mb-4 hidden">
                        <button id="export-link-group" class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                            Export as Link Group
                        </button>
                        <button id="export-link-set" class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                            Export as Link Set
                        </button>
                    </div>
                    <div id="bookmarks-list" class="text-sm text-gray-600"></div>
                </div>
            </div>
            
            <!-- Right Column -->
            <div class="right-column min-w-0">
                <div class="bg-white p-6 rounded-lg shadow-sm min-h-[200px]">
                    <h2 class="text-base font-semibold mb-4 text-gray-900">Help</h2>
                    <div class="text-sm text-gray-600">
                        <p>Help content placeholder for browser bookmarks.</p>
                        <p>Here you can add documentation, tips, or guidance for managing bookmarks.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`,
    init: function init() {
    const fetchBookmarksButton = document.getElementById('fetch-bookmarks');
    const status = document.getElementById('status');
    const bookmarksList = document.getElementById('bookmarks-list');
    const bookmarksActions = document.getElementById('bookmarks-actions');
    const exportLinkGroupButton = document.getElementById('export-link-group');
    const exportLinkSetButton = document.getElementById('export-link-set');
    let selectedFolders = new Set();
    let collapsedFolders = new Set(); // Track collapsed folders

    // Function to initialize collapsed state for all folders
    function initializeCollapsedState(bookmark) {
        if (bookmark.children) {
            collapsedFolders.add(bookmark.id);
            bookmark.children.forEach(child => initializeCollapsedState(child));
        }
    }

    // Function to create bookmark item HTML
    function createBookmarkItem(bookmark, indent = 0, isRoot = false) {
        if (!bookmark.url && !bookmark.children) return '';

        let html = '';
        
        // If it's a folder
        if (bookmark.children) {
            const folderId = bookmark.id;
            const isCollapsed = collapsedFolders.has(folderId);
            
            html += `
                <div class="bookmark-folder ml-${indent * 4} mb-2" data-folder-id="${folderId}">
                    <div class="flex items-center gap-2">
                        <button class="toggle-folder" data-folder-id="${folderId}">
                            <svg class="w-4 h-4 transform ${isCollapsed ? '' : 'rotate-90'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                        <input type="checkbox" 
                               class="folder-checkbox" 
                               data-folder-id="${folderId}"
                               id="folder-${folderId}">
                        <label for="folder-${folderId}" class="flex items-center gap-2 cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                            </svg>
                            <span class="font-medium text-gray-800">${bookmark.title || 'Unnamed Folder'}</span>
                        </label>
                    </div>
                    <div class="folder-contents ${isCollapsed ? 'hidden' : ''}" data-folder-id="${folderId}">
            `;
            
            // Add children (will be hidden if collapsed)
            bookmark.children.forEach(child => {
                html += createBookmarkItem(child, indent + 1);
            });
            
            html += '</div></div>';
        }
        // If it's a bookmark with URL
        else if (bookmark.url) {
            html += `
                <div class="bookmark-item ml-${indent * 4} mb-2">
                    <a href="${bookmark.url}" target="_blank" 
                       class="text-blue-600 hover:underline flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.473-1.473M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.473 1.473"></path>
                        </svg>
                        ${bookmark.title || 'Untitled Bookmark'}
                    </a>
                </div>
            `;
        }
        return html;
    }

    // Function to update action bar visibility
    function updateActionBar() {
        if (selectedFolders.size > 0) {
            bookmarksActions.classList.remove('hidden');
        } else {
            bookmarksActions.classList.add('hidden');
        }
    }

    // Handle folder selection
    function handleFolderSelection(event) {
        const checkbox = event.target;
        const folderId = checkbox.dataset.folderId;
        
        if (checkbox.checked) {
            selectedFolders.add(folderId);
        } else {
            selectedFolders.delete(folderId);
        }
        updateActionBar();
    }

    // Handle folder toggle
    function handleFolderToggle(event) {
        const button = event.currentTarget;
        const folderId = button.dataset.folderId;
        const contents = document.querySelector(`.folder-contents[data-folder-id="${folderId}"]`);
        const icon = button.querySelector('svg');

        if (collapsedFolders.has(folderId)) {
            collapsedFolders.delete(folderId);
            contents.classList.remove('hidden');
            icon.classList.add('rotate-90');
        } else {
            collapsedFolders.add(folderId);
            contents.classList.add('hidden');
            icon.classList.remove('rotate-90');
        }
    }

    // Handle export actions (placeholder functions)
    exportLinkGroupButton.addEventListener('click', () => {
        alert(`Exporting ${selectedFolders.size} folder(s) as Link Group`);
        // Implement export logic here
    });

    exportLinkSetButton.addEventListener('click', () => {
        alert(`Exporting ${selectedFolders.size} folder(s) as Link Set`);
        // Implement export logic here
    });

    fetchBookmarksButton.addEventListener('click', () => {
        status.textContent = 'Fetching bookmarks...';
        status.style.color = 'blue';
        bookmarksList.innerHTML = ''; // Clear previous bookmarks
        selectedFolders.clear();
        collapsedFolders.clear(); // Reset collapsed state
        updateActionBar();

        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
            if (chrome.runtime.lastError) {
                status.textContent = 'Error fetching bookmarks';
                status.style.color = 'red';
                setTimeout(() => { status.textContent = ''; }, 2000);
                return;
            }

            status.textContent = 'Bookmarks fetched successfully';
            status.style.color = 'green';
            setTimeout(() => { status.textContent = ''; }, 2000);

            // Initialize all folders as collapsed
            bookmarkTreeNodes.forEach(node => {
                initializeCollapsedState(node);
            });

            // Process and display bookmarks
            let bookmarksHTML = '';
            bookmarkTreeNodes.forEach(node => {
                bookmarksHTML += createBookmarkItem(node, 0, true);
            });
            bookmarksList.innerHTML = bookmarksHTML;

            // Add event listeners to checkboxes
            const checkboxes = document.querySelectorAll('.folder-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', handleFolderSelection);
            });

            // Add event listeners to toggle buttons
            const toggleButtons = document.querySelectorAll('.toggle-folder');
            toggleButtons.forEach(button => {
                button.addEventListener('click', handleFolderToggle);
            });
        });
    });
}
  }
];