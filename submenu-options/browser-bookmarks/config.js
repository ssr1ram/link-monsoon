// file: config.js
export const config = {
    id: 'browser-bookmarks',
    label: 'Browser Bookmarks',
    menuId: 'browser-bookmarks-menu',
    sectionId: 'browser-bookmarks-section'
};

export function init() {
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