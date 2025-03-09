export const config = {
    id: 'link-groups',
    label: 'Link Groups',
    menuId: 'link-groups-menu',
    sectionId: 'link-groups-section'
};

export function init() {
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