# Lumina AI — Development Notes

## Verified
- Production build succeeds; bundle-size warning remains.
- Chat History CRUD tests pass.
- Six coding modes and coding request builder tests pass.
- Image Library save, read and delete tests pass.
- AuthPanel and Firebase auth service exist but are not yet integrated into the main app.

## Verification commands
node scripts/verify-features.mjs
node scripts/verify-image-library.mjs
npm run build

## Firebase setup
Configure VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID and VITE_FIREBASE_APP_ID in a local .env file. Never commit .env.
Enable Google, Facebook and Email/Password providers in Firebase Console before testing real login.

## Remaining work
- Integrate login, chat history and image library into the main app after reviewing App.jsx.
- Review lazy loading to reduce the large JavaScript bundle.
- Video generation remains deferred until 100,000 downloads.
