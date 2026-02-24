// File System Access API utilities for local media storage
// Requires Chrome or Edge browser

let directoryHandle = null;
let fileCache = new Map(); // Cache blob URLs to avoid re-reading files

/**
 * Check if File System Access API is supported
 */
export function isFileSystemSupported() {
  return 'showDirectoryPicker' in window;
}

/**
 * Check if we have an active directory handle
 */
export function hasDirectoryAccess() {
  return directoryHandle !== null;
}

/**
 * Get the current directory name (if any)
 */
export function getDirectoryName() {
  return directoryHandle?.name || null;
}

/**
 * Request access to a local folder
 * Returns { success: boolean, name?: string, error?: string }
 */
export async function requestFolderAccess() {
  if (!isFileSystemSupported()) {
    return { success: false, error: 'File System Access API not supported' };
  }

  try {
    directoryHandle = await window.showDirectoryPicker({
      mode: 'read'
    });

    // Clear cache when switching folders
    clearCache();

    return { success: true, name: directoryHandle.name };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'Folder selection cancelled' };
    }
    return { success: false, error: err.message };
  }
}

/**
 * Verify we still have permission to the directory
 */
export async function verifyPermission() {
  if (!directoryHandle) return false;

  try {
    const permission = await directoryHandle.queryPermission({ mode: 'read' });
    return permission === 'granted';
  } catch {
    return false;
  }
}

/**
 * Request permission if needed (for when page is reloaded)
 */
export async function requestPermissionIfNeeded() {
  if (!directoryHandle) return false;

  try {
    const permission = await directoryHandle.requestPermission({ mode: 'read' });
    return permission === 'granted';
  } catch {
    return false;
  }
}

/**
 * Read a file from the directory and return a blob URL
 * @param {string} relativePath - Path relative to the granted folder (e.g., "media/photo.jpg")
 * @returns {Promise<string>} Blob URL or empty string if not found
 */
export async function getFileUrl(relativePath) {
  if (!directoryHandle || !relativePath) return '';

  // Check cache first
  if (fileCache.has(relativePath)) {
    return fileCache.get(relativePath);
  }

  try {
    // Navigate to the file through the directory structure
    const pathParts = relativePath.split('/').filter(p => p && p !== '.');

    let currentHandle = directoryHandle;

    // Navigate through directories
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentHandle = await currentHandle.getDirectoryHandle(pathParts[i]);
    }

    // Get the file
    const fileName = pathParts[pathParts.length - 1];
    const fileHandle = await currentHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();

    // Create blob URL
    const blobUrl = URL.createObjectURL(file);

    // Cache it
    fileCache.set(relativePath, blobUrl);

    return blobUrl;
  } catch (err) {
    console.warn(`Could not load file: ${relativePath}`, err.message);
    return '';
  }
}

/**
 * Check if a file exists in the directory
 * @param {string} relativePath - Path relative to the granted folder
 * @returns {Promise<boolean>}
 */
export async function fileExists(relativePath) {
  if (!directoryHandle || !relativePath) return false;

  try {
    const pathParts = relativePath.split('/').filter(p => p && p !== '.');

    let currentHandle = directoryHandle;

    for (let i = 0; i < pathParts.length - 1; i++) {
      currentHandle = await currentHandle.getDirectoryHandle(pathParts[i]);
    }

    const fileName = pathParts[pathParts.length - 1];
    await currentHandle.getFileHandle(fileName);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear the blob URL cache (revokes all URLs)
 */
export function clearCache() {
  for (const url of fileCache.values()) {
    URL.revokeObjectURL(url);
  }
  fileCache.clear();
}

/**
 * Disconnect from the current directory
 */
export function disconnect() {
  clearCache();
  directoryHandle = null;
}

/**
 * Store directory handle reference in IndexedDB for persistence
 * Note: The handle can be stored, but user must re-grant permission on page reload
 */
export async function persistDirectoryHandle() {
  if (!directoryHandle) return false;

  try {
    const db = await openDatabase();
    const tx = db.transaction('handles', 'readwrite');
    const store = tx.objectStore('handles');
    await store.put(directoryHandle, 'mediaFolder');
    return true;
  } catch (err) {
    console.warn('Could not persist directory handle:', err);
    return false;
  }
}

/**
 * Restore directory handle from IndexedDB
 * User will need to re-grant permission
 */
export async function restoreDirectoryHandle() {
  try {
    const db = await openDatabase();
    const tx = db.transaction('handles', 'readonly');
    const store = tx.objectStore('handles');
    const handle = await store.get('mediaFolder');

    if (handle) {
      directoryHandle = handle;
      return true;
    }
  } catch (err) {
    console.warn('Could not restore directory handle:', err);
  }
  return false;
}

// IndexedDB helper
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StoryBuilderFS', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('handles')) {
        db.createObjectStore('handles');
      }
    };
  });
}
