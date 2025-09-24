import { db } from './firebase.js';
import { onSnapshot, collection, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { updateTagSeenStatus } from './crud.js';

export function listenToGroups(callback) {
  const q = query(collection(db, "groups"), orderBy("name"));
  onSnapshot(q, (snapshot) => {
    const groups = [];
    snapshot.forEach((doc) => {
      groups.push(doc.data().name);
    });
    callback(groups);
  }, (error) => {
    console.error("Error listening to groups collection: ", error);
    callback([]); // Return empty array on error
  });
}

export function initRealtimeListener(containerId) {
  const container = document.getElementById(containerId);
  const q = query(collection(db, "tags"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    container.innerHTML = ""; 
    const groups = {};

    snapshot.forEach(doc => {
      const tag = { id: doc.id, ...doc.data() };
      if (!groups[tag.group]) {
        groups[tag.group] = [];
      }
      groups[tag.group].push(tag);
    });

    // Get all group names for consistent ordering
    const sortedGroupNames = Object.keys(groups).sort();

    sortedGroupNames.forEach(groupName => {
      const groupSection = document.createElement('div');
      
      const groupTab = document.createElement('div');
      groupTab.className = 'group-tab';
      groupTab.textContent = groupName;
      groupSection.appendChild(groupTab);

      const groupContent = document.createElement('div');
      groupContent.className = 'group-content';
      
      groups[groupName].forEach(tag => {
        const tagEl = document.createElement('div');
        tagEl.className = 'tag';
        if (tag.seen) {
            tagEl.classList.add('seen');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'seen-checkbox';
        checkbox.checked = tag.seen;
        checkbox.addEventListener('change', (e) => {
            updateTagSeenStatus(tag.id, e.target.checked);
        });

        const linkEl = document.createElement('a');
        linkEl.textContent = tag.name;
        if (tag.url) {
            linkEl.href = tag.url;
            linkEl.target = '_blank';
        }

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

  }, (error) => {
    console.error("Error listening to collection: ", error);
  });
}
