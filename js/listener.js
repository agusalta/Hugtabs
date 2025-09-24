import { db } from './firebase.js';
import { onSnapshot, collection, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { openMany } from './actions.js';
import { updateTagSeenStatus } from './crud.js';
import { showToast } from './utils.js';

export function initRealtimeListener(containerId) {
  const container = document.getElementById(containerId);
  
  const groupsQuery = query(collection(db, "groups"), orderBy("name", "asc"));
  const tagsQuery = query(collection(db, "tags"), orderBy("createdAt", "desc"));

  let groupsData = [];
  let tagsData = [];

  const render = () => {
    container.innerHTML = "";

    const tagsByGroup = tagsData.reduce((acc, tag) => {
      if (!acc[tag.group]) {
        acc[tag.group] = [];
      }
      acc[tag.group].push(tag);
      return acc;
    }, {});

    groupsData.forEach(group => {
      const groupName = group.name;
      const groupTags = tagsByGroup[groupName] || [];

      const groupSection = document.createElement('div');
      
      const groupTab = document.createElement('div');
      groupTab.className = 'group-tab';
      groupTab.title = `Abrir todos los links de "${groupName}"`;

      groupTab.addEventListener('click', async (e) => {
        if (e.target.closest('.group-actions')) {
          return;
        }

        const urlsToOpen = groupTags.map(t => t.url).filter(Boolean);

        if (urlsToOpen.length === 0) {
          showToast(`No hay links para abrir en "${groupName}".`, 'info');
          return;
        }

        try {
          const openedCount = await openMany(urlsToOpen);
          showToast(`Abriendo ${openedCount} links de "${groupName}".`, 'success');
        } catch (err) {
          console.error('Error abriendo links del grupo:', err);
          showToast(err.message || 'No se pudieron abrir las pestañas.', 'error');
        }
      });

      const groupNameEl = document.createElement('span');
      groupNameEl.className = 'group-name';
      groupNameEl.textContent = groupName;
      groupTab.appendChild(groupNameEl);

      const groupActions = document.createElement('div');
      groupActions.className = 'group-actions';

      const addLinkToGroupBtn = document.createElement('button');
      addLinkToGroupBtn.className = 'button-styles';
      addLinkToGroupBtn.textContent = '+';
      addLinkToGroupBtn.title = `Agregar Link a ${groupName}`;
      addLinkToGroupBtn.onclick = (e) => {
        e.stopPropagation();
        window.openAddLinkModal(groupName);
      };
      groupActions.appendChild(addLinkToGroupBtn);
      
      if (groupName !== 'General') {
        const deleteGroupBtn = document.createElement('button');
        deleteGroupBtn.className = 'button-styles delete-group-btn';
        deleteGroupBtn.innerHTML = '−';
        deleteGroupBtn.title = `Eliminar Grupo ${groupName}`;
        deleteGroupBtn.onclick = (e) => {
          e.stopPropagation();
          window.openDeleteGroupModal(groupName);
        };
        groupActions.appendChild(deleteGroupBtn);
      }

      groupTab.appendChild(groupActions);
      groupSection.appendChild(groupTab);

      const groupContent = document.createElement('div');
      groupContent.className = 'group-content';

      groupTags.forEach(tag => {
        const tagEl = document.createElement('div');
        tagEl.className = 'tag';
        if (tag.seen) {
            tagEl.classList.add('seen');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'seen-checkbox';
        checkbox.checked = tag.seen;
        checkbox.title = tag.seen ? 'Marcar como no visto' : 'Marcar como visto';
        checkbox.addEventListener('change', (e) => {
            updateTagSeenStatus(tag.id, e.target.checked);
        });

        const linkEl = document.createElement('a');
        linkEl.textContent = tag.name;
        linkEl.title = tag.url;
        linkEl.href = tag.url;
        linkEl.target = '_blank';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-tag';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = () => window.deleteTag(tag.id);

        tagEl.appendChild(checkbox);
        tagEl.appendChild(linkEl);
        tagEl.appendChild(deleteBtn);
        groupContent.appendChild(tagEl);
      });

      groupSection.appendChild(groupContent);
      container.appendChild(groupSection);
    });
  };

  onSnapshot(groupsQuery, (snapshot) => {
    groupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    render();
  }, (error) => console.error("Error en listener de grupos: ", error));

  onSnapshot(tagsQuery, (snapshot) => {
    tagsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    render();
  }, (error) => console.error("Error en listener de tags: ", error));
}
