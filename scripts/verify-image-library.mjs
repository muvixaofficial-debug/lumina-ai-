import assert from 'node:assert/strict';

const store = new Map();

globalThis.localStorage = {
  getItem: key => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: key => store.delete(key),
  clear: () => store.clear()
};

const lib = await import('../src/lib/imageLibrary.js?verify=' + Date.now());
const {
  getSavedImages,
  saveImage,
  deleteSavedImage,
  getSavedImage,
  clearImageLibrary
} = lib;

try {
  clearImageLibrary();

  const image = {
    id: 'lumina-verification-image',
    title: 'Lumina Test Image',
    prompt: 'Image Library verification',
    url: 'data:image/png;base64,iVBORw0KGgo=',
    src: 'data:image/png;base64,iVBORw0KGgo=',
    imageUrl: 'data:image/png;base64,iVBORw0KGgo=',
    dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
    createdAt: new Date().toISOString()
  };

  const saved = saveImage(image);
  assert.ok(saved !== false && saved != null, 'Save returned no result');

  const images = getSavedImages();
  assert.ok(Array.isArray(images), 'Image list is not an array');
  assert.ok(images.length > 0, 'Saved image was not found');

  console.log('PASS: Save image');

  const savedId = saved.id ?? image.id;
  const retrieved = getSavedImage(savedId);
  assert.ok(retrieved, 'Could not retrieve saved image');

  console.log('PASS: Read saved image');

  deleteSavedImage(savedId);
  assert.equal(getSavedImage(savedId), null, 'Image still exists after deletion');

  console.log('PASS: Delete image');
  console.log('Image Library CRUD: PASS');
} catch (error) {
  console.error('Image Library test needs adjustment:', error.message);
  console.error('Save function:', saveImage.toString());
  process.exitCode = 1;
} finally {
  clearImageLibrary();
}
