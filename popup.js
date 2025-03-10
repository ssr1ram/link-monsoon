// file: popup.js
document.addEventListener('DOMContentLoaded', () => {
  const groupSelect = document.getElementById('link-group-select');
  const setSelect = document.getElementById('link-set-select');

  // Initialize with lastVisited or default
  function initializeSelectors() {
    chrome.storage.local.get(['linkGroupsIndex', 'lastVisited'], (result) => {
      const linkGroups = result.linkGroupsIndex || [];
      const lastVisited = result.lastVisited || {};

      // Populate groups
      groupSelect.innerHTML = '';
      linkGroups.forEach(group => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.name;
        groupSelect.appendChild(option);
      });

      // Set initial group and set based on lastVisited or default
      const defaultGroup = linkGroups[0] || {};
      const defaultSet = defaultGroup.linkSets ? defaultGroup.linkSets[0] : {};
      const { groupId = defaultGroup.id, setId = defaultSet.id } = lastVisited;

      // Verify and set the group
      const validGroup = linkGroups.find(g => g.id === groupId);
      if (validGroup) {
        groupSelect.value = groupId;
      } else {
        groupSelect.value = defaultGroup.id || '';
      }

      // Update sets and select the last visited or first set
      updateSets(groupId || defaultGroup.id, setId || defaultSet.id);
    });
  }

  // Update sets dropdown and render
  function updateSets(selectedGroupId, selectedSetId) {
    setSelect.innerHTML = '';
    chrome.storage.local.get(['linkGroupsIndex'], (result) => {
      const linkGroups = result.linkGroupsIndex || [];
      const group = linkGroups.find(g => g.id === selectedGroupId);

      if (group) {
        group.linkSets.forEach(set => {
          const option = document.createElement('option');
          option.value = set.id;
          option.textContent = set.name;
          setSelect.appendChild(option);
        });

        // Select the last visited set if valid, otherwise the first set
        const validSet = group.linkSets.find(s => s.id === selectedSetId);
        setSelect.value = validSet ? selectedSetId : (group.linkSets[0] ? group.linkSets[0].id : '');

        // Render the selected link set
        const groupId = groupSelect.value;
        const setId = setSelect.value;
        if (groupId && setId) {
          loadAndRenderLinkSet(groupId, setId);
        }
      }
    });
  }

  // Event listeners
  groupSelect.addEventListener('change', () => {
    const groupId = groupSelect.value;
    updateSets(groupId, ''); // Clear set selection initially, will be repopulated
    if (groupId) {
      chrome.storage.local.set({ lastVisited: { groupId, setId: '' } }, () => {
      });
    }
  });

  setSelect.addEventListener('change', () => {
    const groupId = groupSelect.value;
    const setId = setSelect.value;
    if (groupId && setId) {
      loadAndRenderLinkSet(groupId, setId);
      chrome.storage.local.set({ lastVisited: { groupId, setId } }, () => {
      });
    }
  });

  // Initial load
  initializeSelectors();
});

function loadAndRenderLinkSet(groupId, setId) {
  const key = `group_${groupId}_set_${setId}`;
  chrome.storage.local.get([key], (result) => {
    const linkSet = result[key];
    if (linkSet) {
      renderMasonryGrid(linkSet.data, linkSet.options);
      // Update lastVisited after rendering (ensures valid load)
      chrome.storage.local.set({ lastVisited: { groupId, setId } }, () => {
      });
    }
  });
}
// end of file: popup.js