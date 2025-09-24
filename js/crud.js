import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, where, writeBatch, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CREATE --- //

export const addTag = async (group, name, url) => {
  try {
    await addDoc(collection(db, "tags"), {
      group: group,
      name: name,
      url: url,
      seen: false,
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("No se pudo agregar el link.");
  }
};

export const addGroup = async (groupName) => {
  try {
    const q = query(collection(db, "groups"), where("name", "==", groupName));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error(`El grupo "${groupName}" ya existe.`);
    }

    await addDoc(collection(db, "groups"), {
      name: groupName,
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Error adding group: ", error);
    throw error; // Re-throw original or a new error
  }
};

// --- DELETE --- //

export const deleteTag = async (tagId) => {
  try {
    await deleteDoc(doc(db, "tags", tagId));
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw new Error("No se pudo eliminar el link.");
  }
};

export const deleteGroup = async (groupName) => {
  try {
    // Step 1: Delete all associated tags
    const tagsQuery = query(collection(db, "tags"), where("group", "==", groupName));
    const tagsSnapshot = await getDocs(tagsQuery);
    
    const batch = writeBatch(db);
    tagsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Step 2: Delete the group document itself
    const groupQuery = query(collection(db, "groups"), where("name", "==", groupName));
    const groupSnapshot = await getDocs(groupQuery);

    if (groupSnapshot.empty) {
      console.warn(`Group document "${groupName}" not found, but proceeding since tags are deleted.`);
      return;
    }
    
    const groupDoc = groupSnapshot.docs[0];
    await deleteDoc(groupDoc.ref);

  } catch (error) {
    console.error(`Error during deletion of group "${groupName}": `, error);
    throw new Error(`No se pudo eliminar el grupo "${groupName}".`);
  }
};


// --- UPDATE --- //

export const updateTagSeenStatus = async (tagId, seen) => {
    try {
        const tagRef = doc(db, "tags", tagId);
        await updateDoc(tagRef, {
            seen: seen
        });
    } catch (error) {
        console.error("Error updating tag status: ", error);
        // En este caso, no lanzamos error para no ser intrusivos.
    }
};