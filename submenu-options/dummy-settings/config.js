export const config = {
    id: 'dummy-settings',
    label: 'Dummy Settings',
    menuId: 'dummy-settings-menu',
    sectionId: 'dummy-settings-section'
};

export function init() {
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