const cloud = window.__cloud = new Map();
let n = 0; const ts = ms => ({ toMillis: () => ms });
export const initializeFirestore = () => ({}), persistentLocalCache = () => ({}), persistentMultipleTabManager = () => ({});
export const collection = () => "col", doc = (c, id) => ({ id: decodeURIComponent(id) });
export const serverTimestamp = () => "SAT", query = () => "q", where = () => "w";
export const Timestamp = { fromMillis: ts };
window.__writes = 0;
export async function setDoc(ref, data) { window.__writes++; cloud.set(data.p, { ...data, sat: ts(1e12 + ++n) }); }
export function onSnapshot(q, opts, cb) { window.__snap = cb; return () => { window.__snap = null; }; }
const snapOf = d => ({ data: () => d, metadata: { hasPendingWrites: false }, ref: { p: d.p } });
export async function getDocs() { return { docs: [...cloud.values()].map(snapOf) }; }
export const writeBatch = () => { const del = []; return { delete: r => del.push(r.p), commit: async () => del.forEach(p => cloud.delete(p)) }; };
window.__fire = (fromCache = false) => window.__snap({ docChanges: () => [...cloud.values()].map(d => ({ type: "added", doc: snapOf(d) })), docs: [...cloud.values()].map(snapOf), metadata: { fromCache } });
