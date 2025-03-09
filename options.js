// options.js
document.addEventListener('DOMContentLoaded', () => {
    const sectionsList = document.getElementById('sections-list');
    const saveButton = document.getElementById('save');
    const status = document.getElementById('status');
    const numColumnsInput = document.getElementById('num-columns');
    const linkLengthInput = document.getElementById('link-length');
    const uploadInput = document.getElementById('upload-input');
    const linkGroupsSelect = document.getElementById('link-groups');
    const linkSetsSelect = document.getElementById('link-sets');
    const addLinkSetButton = document.getElementById('add-link-set');
    const addGroupButton = document.getElementById('add-group'); // New button for adding a group
    const groupNameInput = document.getElementById('group-name'); // New input for group name

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
        addGroupButton.addEventListener('click', () => {
            const groupName = groupNameInput.value.trim();
            if (groupName) {
                addNewGroup(groupName);
                groupNameInput.value = ''; // Clear input after adding
            } else {
                status.textContent = 'Please enter a group name.';
                status.style.color = 'red';
                setTimeout(() => { status.textContent = '   '; }, 2000);
            }
        });
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
                console.log('Parsed sections in loadOptions (after filtering):', sections); // Debug log
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
                populateLinkGroups(linkGroups); // Refresh the dropdown
                linkGroupsSelect.value = newGroupId; // Select the new group
                updateLinkSets(); // Update link sets for the new group
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

            // Update both the index and the new link set in a single operation
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

        // Debug: Log the parsed document to check structure
        console.log('Parsed DOM in parseBookmarkData:', doc);

        // Recursive function to parse bookmark sections
        function parseSections(element) {
            const children = element.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                console.log('Processing child:', child.tagName); // Debug log
                if (child.tagName === 'DT' || child.tagName === 'DL') {
                    // Process <DT> for potential <H3> and <DL> pairs
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
                                break; // Found the <DL> immediately following the <H3>
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
                                        console.log(`Collected link: ${a.textContent.trim()} (${a.getAttribute('HREF')})`);
                                    }
                                });
                            };
                            collectLinks(dl);

                            if (links.length > 0) {
                                sections.push({ title: h3.textContent.trim(), links, weight: links.length });
                                console.log(`Found section: ${h3.textContent.trim()} with ${links.length} links`, links);
                            }
                        }
                    }
                    // Recurse into any child (DT or DL) to handle nested structures
                    parseSections(child);
                }
            }
        }

        // Start parsing from the body
        const body = doc.querySelector('body');
        if (body) {
            parseSections(body);
        } else {
            console.warn('No <body> found in the document');
        }

        // Debug: Log final sections
        console.log('Final sections in parseBookmarkData:', sections);
        return sections;
    }
});