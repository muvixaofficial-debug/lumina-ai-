const STORAGE_KEY = "lumina_ai_image_library_v1";

function readLibrary() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeLibrary(images) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

export function getSavedImages() {
  return readLibrary().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveImage({ imageUrl, prompt = "", title = "" }) {
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("Image URL is required.");
  }

  const images = readLibrary();
  const image = {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    imageUrl,
    prompt: String(prompt),
    title: String(title || prompt || "Generated image"),
    createdAt: new Date().toISOString()
  };

  images.unshift(image);
  writeLibrary(images);
  return image;
}

export function deleteSavedImage(id) {
  const images = readLibrary();
  const updated = images.filter(image => image.id !== id);
  writeLibrary(updated);
  return updated;
}

export function getSavedImage(id) {
  return readLibrary().find(image => image.id === id) || null;
}

export function clearImageLibrary() {
  localStorage.removeItem(STORAGE_KEY);
}
