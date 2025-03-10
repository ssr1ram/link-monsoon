// file: options.js
document.addEventListener('DOMContentLoaded', () => {
    const submenuContainer = document.getElementById('submenu-options');
    const sectionsContainer = document.getElementById('sections-container');
    const optionsTitle = document.getElementById('options-title');
    const loadedOptions = [];

    function loadSubmenuOption(option) {
        try {
            const { config, html, init } = option;

            const menuItem = document.createElement('a');
            menuItem.href = '#';
            menuItem.id = config.menuId;
            menuItem.className = 'flex items-center space-x-2 text-gray-800 hover:bg-gray-300 rounded px-4 py-2';
            menuItem.innerHTML = `<span>${config.label}</span>`;
            submenuContainer.appendChild(menuItem);

            sectionsContainer.innerHTML += html;

            const section = document.getElementById(config.sectionId);

            loadedOptions.push({
                menuItem,
                sectionId: config.sectionId, // Store ID instead of reference
                label: config.label,
                init,
                initialized: false
            });
        } catch (error) {
            console.error(`Error loading submenu option ${config.id}:`, error);
        }
    }

    if (!window.submenuOptions) {
        console.error('window.submenuOptions is undefined. Check build/submenu-options.js');
        window.submenuOptions = [];
    }
    window.submenuOptions.forEach(loadSubmenuOption);

    function updateActiveSection(activeMenu, sectionId, titleText, initFunc) {
        loadedOptions.forEach(opt => {
            opt.menuItem.classList.remove('active-menu');
        });
        activeMenu.classList.add('active-menu');
        
        const showSection = document.getElementById(sectionId); // Re-query section
        loadedOptions.forEach(opt => {
            const section = document.getElementById(opt.sectionId);
            if (section) section.classList.remove('active');
        });
        if (showSection) {
            showSection.classList.add('active');
            if (!initFunc.initialized) {
                initFunc.init();
                initFunc.initialized = true;
            }
        } else {
            console.error(`Section for ${titleText} is null`);
        }

        optionsTitle.textContent = `Options: ${titleText}`;
    }

    loadedOptions.forEach((opt, index) => {
        opt.menuItem.addEventListener('click', (e) => {
            e.preventDefault();
            updateActiveSection(opt.menuItem, opt.sectionId, opt.label, opt);
        });

        if (index === 0) {
            updateActiveSection(opt.menuItem, opt.sectionId, opt.label, opt);
        }
    });
});