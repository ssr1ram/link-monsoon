// render.js
function createSection(title, links, linkLength) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'w-full break-inside-avoid mb-6';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'bg-white p-4 rounded-lg shadow';
    
    const heading = document.createElement('h2');
    heading.className = 'text-xl font-bold mb-2';
    heading.textContent = title;
    
    const ul = document.createElement('ul');
    ul.className = 'list-disc pl-5';
    
    links.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.setAttribute('target', '_blank');
        a.className = 'text-blue-600 hover:underline';
        a.textContent = link.text.length > linkLength 
            ? link.text.substring(0, linkLength) + '...' 
            : link.text;
        li.appendChild(a);
        ul.appendChild(li);
    });
    
    contentDiv.appendChild(heading);
    contentDiv.appendChild(ul);
    sectionDiv.appendChild(contentDiv);
    return sectionDiv;
}

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

function renderMasonryGrid(linkSetData, options) {
    const grid = document.getElementById('masonry-grid');
    grid.innerHTML = ''; // Clear previous content

    const sections_todisplay = options.sections_todisplay || [];
    const numColumns = options.numColumns || 5;
    const linkLength = options.linkLength || 25;
    
    grid.classList.add(`columns-${numColumns}`);
    
    const sections = parseBookmarkData(linkSetData).filter(section => 
        section.title.toLowerCase() !== "bookmarks menu"
    );
    const filteredSections = sections.filter(section => 
        sections_todisplay.length === 0 || sections_todisplay.includes(section.title));

    if (filteredSections.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'No sections selected to display. Please configure in options.';
        message.className = 'text-center text-gray-500';
        grid.appendChild(message);
        return;
    }

    filteredSections.sort((a, b) => b.weight - a.weight);
    const columns = Array(numColumns).fill().map(() => ({ sections: [], totalWeight: 0 }));

    filteredSections.forEach(section => {
        const minWeightColumn = columns.reduce((min, curr) => 
            curr.totalWeight < min.totalWeight ? curr : min, columns[0]);
        
        minWeightColumn.sections.push(section);
        minWeightColumn.totalWeight += section.weight;
    });

    columns.forEach(column => {
        column.sections.forEach(section => {
            grid.appendChild(createSection(section.title, section.links, linkLength));
        });
    });
}

// Load and render the selected link set with its options, using lastVisited if available
function loadAndRenderLinkSet(groupId, setId) {
    const key = `group_${groupId}_set_${setId}`;
    chrome.storage.local.get([key, 'lastVisited'], (result) => {
        const linkSet = result[key];
        if (linkSet) {
            renderMasonryGrid(linkSet.data, linkSet.options || {
                sections_todisplay: [],
                numColumns: 5,
                linkLength: 25
            });
            // Update lastVisited only if this is a valid load
            if (groupId && setId) {
                chrome.storage.local.set({
                    lastVisited: { groupId, setId }
                }, () => {
                    console.log('Last visited updated:', { groupId, setId });
                });
            }
        }
    });
}

// Initial load based on lastVisited or default
function initializePopup() {
    chrome.storage.local.get(['linkGroupsIndex', 'lastVisited'], (result) => {
        const linkGroups = result.linkGroupsIndex || [];
        const lastVisited = result.lastVisited || {};

        if (linkGroups.length > 0) {
            const defaultGroup = linkGroups[0];
            const defaultSet = defaultGroup.linkSets[0] || {};
            const { groupId = defaultGroup.id, setId = defaultSet.id } = lastVisited;

            // Verify the group and set exist
            const group = linkGroups.find(g => g.id === groupId);
            if (group && group.linkSets.some(s => s.id === setId)) {
                loadAndRenderLinkSet(groupId, setId);
            } else {
                // Fall back to the first available group and set
                loadAndRenderLinkSet(defaultGroup.id, defaultSet.id);
            }
        }
    });
}

// Call initializePopup on load
initializePopup();

window.onload = () => {
    // Placeholder for future UI interaction (e.g., dropdown change)
    // Example: If you add a group/set selector, update lastVisited here
};