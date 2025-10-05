// --- Tag Helpers ---

const getTagsFromStorage = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get({ tags: [] }, (result) => {
      resolve(result.tags);
    });
  });
};

const saveTagsToStorage = (tags) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ tags }, () => {
      resolve();
    });
  });
};

// --- Group Helpers ---

const getGroupsFromStorage = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get({ groups: [] }, (result) => {
      resolve(result.groups);
    });
  });
};

const saveGroupsToStorage = (groups) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ groups }, () => {
      resolve();
    });
  });
};


// --- CREATE --- //

export const addTag = async (group, name, url) => {
  try {
    const tags = await getTagsFromStorage();
    const newTag = {
      id: Date.now().toString(), // Simple unique ID
      group: group,
      name: name,
      url: url,
      seen: false,
      createdAt: new Date().toISOString()
    };
    tags.push(newTag);
    await saveTagsToStorage(tags);
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("No se pudo agregar el link.");
  }
};

export const addGroup = async (groupName) => {
  try {
    const groups = await getGroupsFromStorage();
    if (groups.some(group => group.name === groupName)) {
      throw new Error(`El grupo "'${groupName}'" ya existe.`);
    }
    const newGroup = {
      id: Date.now().toString(),
      name: groupName,
      createdAt: new Date().toISOString()
    };
    groups.push(newGroup);
    await saveGroupsToStorage(groups);
  } catch (error) {
    console.error("Error adding group: ", error);
    throw error; // Re-throw original or a new error
  }
};

// --- READ --- //

export const getTags = async () => {
  try {
    return await getTagsFromStorage();
  } catch (error) {
    console.error("Error getting tags: ", error);
    throw new Error("No se pudieron obtener los links.");
  }
}

export const getGroups = async () => {
  try {
    return await getGroupsFromStorage();
  } catch (error) {
    console.error("Error getting groups: ", error);
    throw new Error("No se pudieron obtener los grupos.");
  }
}


// --- DELETE --- //

export const deleteTag = async (tagId) => {
  try {
    let tags = await getTagsFromStorage();
    tags = tags.filter(tag => tag.id !== tagId);
    await saveTagsToStorage(tags);
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw new Error("No se pudo eliminar el link.");
  }
};

export const deleteGroup = async (groupName) => {
  try {
    // Step 1: Delete all associated tags
    let tags = await getTagsFromStorage();
    tags = tags.filter(tag => tag.group !== groupName);
    await saveTagsToStorage(tags);


    // Step 2: Delete the group document itself
    let groups = await getGroupsFromStorage();
    groups = groups.filter(group => group.name !== groupName);
    await saveGroupsToStorage(groups);

  } catch (error) {
    console.error(`Error during deletion of group "'${groupName}'": `, error);
    throw new Error(`No se pudo eliminar el grupo "'${groupName}'".`);
  }
};


// --- UPDATE --- //

export const updateTagSeenStatus = async (tagId, seen) => {
  try {
    let tags = await getTagsFromStorage();
    const tagIndex = tags.findIndex(tag => tag.id === tagId);
    if (tagIndex !== -1) {
      tags[tagIndex].seen = seen;
      await saveTagsToStorage(tags);
    }
  } catch (error) {
    console.error("Error updating tag status: ", error);
    // En este caso, no lanzamos error para no ser intrusivos.
  }
};

// --- ORDER --- //
// Reordenar grupos según un arreglo de nombres en el orden deseado
export const reorderGroups = async (orderedGroupNames) => {
  try {
    const groups = await getGroupsFromStorage();
    const nameToGroup = new Map(groups.map(g => [g.name, g]));
    const ordered = [];
    for (const name of orderedGroupNames) {
      const g = nameToGroup.get(name);
      if (g) {
        ordered.push(g);
        nameToGroup.delete(name);
      }
    }
    for (const rest of nameToGroup.values()) {
      ordered.push(rest);
    }
    await saveGroupsToStorage(ordered);
  } catch (error) {
    console.error("Error reordenando grupos: ", error);
    throw new Error("No se pudo reordenar los grupos.");
  }
};