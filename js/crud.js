import { db } from './firebase.js';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showToast } from './utils.js';

// Function to add a new group
export async function addGroup(groupName) {
  try {
    const q = query(collection(db, "groups"), where("name", "==", groupName));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        await addDoc(collection(db, "groups"), {
            name: groupName,
            createdAt: serverTimestamp()
        });
        showToast(`Grupo "${groupName}" creado.`, 'success');
    } else {
        showToast(`El grupo "${groupName}" ya existe.`, 'info');
    }
  } catch (error) {
    console.error("Error adding group: ", error);
    showToast("Error al crear el grupo.", 'error');
  }
}

// Function to add a new tag to a group
export async function addTag(group, name, url) {
  try {
    await addDoc(collection(db, "tags"), {
      group: group,
      name: name,
      url: url,
      seen: false, // Initial seen status
      createdAt: serverTimestamp()
    });
    showToast(`Tag "${name}" agregado al grupo "${group}".`, 'success');
  } catch (error) {
    console.error("Error adding document: ", error);
    showToast("Error al agregar el tag.", 'error');
  }
}

// Function to delete a tag by its ID
export async function deleteTag(id) {
  try {
    await deleteDoc(doc(db, "tags", id));
    showToast("Tag eliminado.");
  } catch (error) {
    console.error("Error deleting document: ", error);
    showToast("Error al eliminar el tag.", 'error');
  }
}

// Function to update the seen status of a tag
export async function updateTagSeenStatus(id, seen) {
    try {
        const tagRef = doc(db, "tags", id);
        await updateDoc(tagRef, {
            seen: seen
        });
    } catch (error) {
        console.error("Error updating tag status: ", error);
        showToast("Error al actualizar el estado del tag.", 'error');
    }
}
