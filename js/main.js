
import { addTag, addGroup, deleteTag, deleteGroup, getTags, getGroups, reorderGroups } from './crud.js';
import { showToast } from './utils.js';

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

    // container
    const linksBody = document.getElementById('linksBody');

    let selectedGroup = null;
    let groupToDelete = null;

    const renderData = async () => {
        linksBody.innerHTML = '';
        const groups = await getGroups();
        const tags = await getTags();

        groups.forEach(group => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group-container';
            groupDiv.dataset.groupName = group.name;
            groupDiv.setAttribute('draggable', 'true');
            const groupTags = tags.filter(tag => tag.group === group.name);

            groupDiv.innerHTML = `
                <div class="group-header">
                    <h2 class="group-name">${group.name}</h2>
                    <div class="group-actions">
                        <button class="add-link-btn" data-group-name="${group.name}">+</button>
                        <button class="delete-group-btn" data-group-name="${group.name}">x</button>
                    </div>
                </div>
                <div class="tags-container">
                    ${groupTags.map(tag => `
                        <div class="tag" data-tag-id="${tag.id}">
                            <a href="${tag.url}" target="_blank">${tag.name}</a>
                            <button class="delete-tag-btn" data-tag-id="${tag.id}">x</button>
                        </div>
                    `).join('')}
                </div>
            `;
            linksBody.appendChild(groupDiv);
        });
    }

    // Fallback DnD nativo (si no hay Sortable)
    function initDragAndDrop() {
        let dragSrcEl = null;
        let isDraggingGroup = false;

        linksBody.addEventListener('dragstart', e => {
            const container = e.target.closest('.group-container');
            const fromHeader = e.target.closest('.group-header');
            if (!container || !fromHeader) {
                e.preventDefault();
                return;
            }
            dragSrcEl = container;
            isDraggingGroup = true;
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => {
                dragSrcEl.classList.add('dragging');
            }, 0);
        });

        linksBody.addEventListener('dragover', e => {
            e.preventDefault();
            const target = e.target.closest('.group-container');
            if (target && target !== dragSrcEl) {
                const rect = target.getBoundingClientRect();
                const next = (e.clientY - rect.top) / rect.height > 0.5;
                linksBody.insertBefore(dragSrcEl, next ? target.nextSibling : target);
            }
        });

        linksBody.addEventListener('dragend', async () => {
            if (dragSrcEl) {
                dragSrcEl.classList.remove('dragging');
                const newOrder = Array.from(linksBody.querySelectorAll('.group-container')).map(node => node.dataset.groupName);
                await reorderGroups(newOrder);
            }
            dragSrcEl = null;
            isDraggingGroup = false;
        });

        // Bloquea clicks durante drag para no abrir nada
        linksBody.addEventListener('click', (e) => {
            if (isDraggingGroup) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }

    const openAddLinkModal = (groupName) => {
        selectedGroup = groupName;
        document.getElementById('addModalTitle').textContent = `Agregar Link a ${groupName}`;
        addModal.style.display = "block";
    }

    const openDeleteGroupModal = (groupName) => {
        groupToDelete = groupName;
        document.getElementById('deleteGroupText').textContent = `¿Seguro que quieres eliminar el grupo "${groupName}" y todos sus links? Esta acción es permanente.`;
        deleteGroupModal.style.display = 'block';
    }

    const deleteTagHandler = async (tagId) => {
        await deleteTag(tagId);
        await renderData();
        showToast('Link eliminado.', 'info');
    };

    linksBody.addEventListener('click', async (event) => {
        const target = event.target;

        if (target.classList.contains('add-link-btn')) {
            const groupName = target.dataset.groupName;
            openAddLinkModal(groupName);
            return;
        }

        if (target.classList.contains('delete-group-btn')) {
            const groupName = target.dataset.groupName;
            openDeleteGroupModal(groupName);
            return;
        }

        if (target.classList.contains('delete-tag-btn')) {
            const tagId = target.dataset.tagId;
            await deleteTagHandler(tagId);
            return;
        }

        // Bloquea cualquier click en el header o contenedor del grupo que no sea sobre botón o <a>
        const header = target.closest('.group-header');
        const container = target.closest('.group-container');
        const inActions = target.closest('.group-actions');
        const isAnchor = target.closest('a');
        if ((header || container) && !inActions && !isAnchor) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
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
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteGroupModal.style.display = 'none';
    });

    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();

        if (!name || !url || !selectedGroup) {
            showToast("El nombre, la URL y el grupo son obligatorios.", 'error');
            return;
        }

        await addTag(selectedGroup, name, url);
        await renderData();

        addModal.style.display = "none";
        addForm.reset();
    });

    addGroupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const groupName = newGroupNameInput.value.trim();
        if (groupName) {
            try {
                await addGroup(groupName);
                await renderData();
            } catch (error) {
                showToast(error.message, 'error');
            }
            addGroupModal.style.display = "none";
            addGroupForm.reset();
        }
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (groupToDelete) {
            await deleteGroup(groupToDelete);
            await renderData();
            showToast(`Grupo "${groupToDelete}" eliminado.`, 'info');
            deleteGroupModal.style.display = 'none';
            groupToDelete = null;
        }
    });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const tags = document.querySelectorAll('.tag');
        const groups = document.querySelectorAll('.group-container');

        tags.forEach(tag => {
            const isVisible = tag.textContent.toLowerCase().includes(searchTerm);
            tag.style.display = isVisible ? 'flex' : 'none';
        });

        groups.forEach(group => {
            const groupName = group.querySelector('.group-name').textContent.toLowerCase();
            const hasVisibleTags = Array.from(group.querySelectorAll('.tag')).some(t => t.style.display !== 'none');
            const isGroupMatch = groupName.includes(searchTerm);

            if (searchTerm.length > 0) {
                group.style.display = hasVisibleTags || isGroupMatch ? 'block' : 'none';
            } else {
                group.style.display = 'block';
            }
        });
    });

    renderData();
    // Inicializa SortableJS o fallback nativo
    if (window.Sortable) {
        new Sortable(linksBody, {
            animation: 120,
            handle: '.group-header',
            draggable: '.group-container',
            ghostClass: 'drag-ghost',
            onEnd: async () => {
                const newOrder = Array.from(linksBody.querySelectorAll('.group-container'))
                    .map(node => node.dataset.groupName);
                await reorderGroups(newOrder);
            }
        });
    } else {
        initDragAndDrop();
    }
});
