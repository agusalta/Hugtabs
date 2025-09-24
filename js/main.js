import { addTag, deleteTag, addGroup } from './crud.js';
import { showToast } from './utils.js';
import { initRealtimeListener, listenToGroups } from './listener.js';

document.addEventListener('DOMContentLoaded', () => {
    // Buttons
    const addBtn = document.getElementById("addBtn");
    const addGroupBtn = document.getElementById("addGroupBtn");

    // Modals
    const addModal = document.getElementById("addModal");
    const addGroupModal = document.getElementById("addGroupModal");

    // Close Buttons
    const closeButtons = document.querySelectorAll(".close-btn");

    // Forms
    const addForm = document.getElementById("addForm");
    const addGroupForm = document.getElementById("addGroupForm");

    // Inputs
    const nameInput = document.getElementById("nameInput");
    const urlInput = document.getElementById("urlInput");
    const newGroupNameInput = document.getElementById("newGroupNameInput");
    const searchInput = document.getElementById("searchInput");

    // Group selection
    const groupSelectionContainer = document.getElementById("groupSelection");
    let selectedGroup = 'General'; // Default group

    // --- MODAL VISIBILITY --- //

    addBtn.addEventListener('click', () => {
        populateGroupSelection();
        addModal.style.display = "block";
    });

    addGroupBtn.addEventListener('click', () => {
        addGroupModal.style.display = "block";
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.style.display = "none";
            }
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target == addModal || event.target == addGroupModal) {
            addModal.style.display = "none";
            addGroupModal.style.display = "none";
        }
    });

    // --- FORM SUBMISSIONS --- //

    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();

        if (!name || !url) {
            showToast("El nombre y la URL son obligatorios.", 'error');
            return;
        }

        await addTag(selectedGroup, name, url);

        addModal.style.display = "none";
        addForm.reset();
    });

    addGroupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const groupName = newGroupNameInput.value.trim();
        if (groupName) {
            await addGroup(groupName);
            addGroupModal.style.display = "none";
            addGroupForm.reset();
        }
    });

    // --- GROUP SELECTION LOGIC --- //

    function populateGroupSelection() {
        listenToGroups((groups) => {
            groupSelectionContainer.innerHTML = '<p>Selecciona un grupo:</p>'; // Reset
            const allGroups = ['General', ...groups.filter(g => g !== 'General')];
            
            allGroups.forEach(group => {
                const badge = document.createElement('span');
                badge.className = 'group-badge';
                badge.textContent = group;
                if (group === selectedGroup) {
                    badge.classList.add('selected');
                }
                badge.addEventListener('click', () => {
                    selectedGroup = group;
                    document.querySelectorAll('.group-badge').forEach(b => b.classList.remove('selected'));
                    badge.classList.add('selected');
                });
                groupSelectionContainer.appendChild(badge);
            });
        });
    }

    // --- SEARCH --- //

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        document.querySelectorAll('.tag').forEach(tag => {
            tag.style.display = tag.textContent.toLowerCase().includes(searchTerm) ? 'inline-flex' : 'none';
        });
    });

    // --- INITIALIZATION --- //
    window.deleteTag = deleteTag;
    initRealtimeListener("linksBody");
});
