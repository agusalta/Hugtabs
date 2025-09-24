
import { addTag, addGroup, deleteTag, deleteGroup } from './crud.js';
import { showToast } from './utils.js';
import { initRealtimeListener } from './listener.js';

document.addEventListener('DOMContentLoaded', () => {
    // Buttons
    const addGroupBtn = document.getElementById("addGroupBtn");
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    // Modals
    const addModal = document.getElementById("addModal");
    const addGroupModal = document.getElementById("addGroupModal");
    const deleteGroupModal = document.getElementById('deleteGroupModal');

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

    let selectedGroup = null;
    let groupToDelete = null;

    // --- MODAL VISIBILITY --- //

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
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteGroupModal.style.display = 'none';
    });

    // --- FORM SUBMISSIONS --- //

    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();

        if (!name || !url || !selectedGroup) {
            showToast("El nombre, la URL y el grupo son obligatorios.", 'error');
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

    confirmDeleteBtn.addEventListener('click', async () => {
        if (groupToDelete) {
            await deleteGroup(groupToDelete);
            showToast(`Grupo "${groupToDelete}" eliminado.`, 'info');
            deleteGroupModal.style.display = 'none';
            groupToDelete = null;
        }
    });
    
    // --- MODAL TRIGGER FUNCTIONS --- //
    
    function openAddLinkModal(groupName) {
        selectedGroup = groupName;
        document.getElementById('addModalTitle').textContent = `Agregar Link a ${groupName}`;
        addModal.style.display = "block";
    }

    function openDeleteGroupModal(groupName) {
        groupToDelete = groupName;
        document.getElementById('deleteGroupText').textContent = `¿Seguro que quieres eliminar el grupo "${groupName}" y todos sus links? Esta acción es permanente.`;
        deleteGroupModal.style.display = 'block';
    }

    // --- SEARCH --- //

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const tags = document.querySelectorAll('.tag');
        const groups = document.querySelectorAll('.groups-container > div');

        tags.forEach(tag => {
            const isVisible = tag.textContent.toLowerCase().includes(searchTerm);
            tag.style.display = isVisible ? 'flex' : 'none';
        });

        groups.forEach(group => {
            const groupName = group.querySelector('.group-name').textContent.toLowerCase();
            const hasVisibleTags = Array.from(group.querySelectorAll('.tag')).some(t => t.style.display !== 'none');
            const isGroupMatch = groupName.includes(searchTerm);
            
            if(searchTerm.length > 0) { // Si hay búsqueda
                group.style.display = hasVisibleTags || isGroupMatch ? 'block' : 'none';
            } else { // Si no hay búsqueda
                group.style.display = 'block';
            }
        });
    });

    // --- INITIALIZATION --- //
    window.deleteTag = deleteTag;
    window.openAddLinkModal = openAddLinkModal;
    window.openDeleteGroupModal = openDeleteGroupModal;
    initRealtimeListener("linksBody");
});
