import * as Y from 'yjs';
import { LeveldbPersistence } from 'y-leveldb';

export function createPersistence(dir) {
  const ldb = new LeveldbPersistence(dir);

  return {
    ldb,
    bindState: async (docName, ydoc) => {
      const persisted = await ldb.getYDoc(docName);
      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persisted));
      persisted.destroy();
      ydoc.on('update', (update) => {
        void ldb.storeUpdate(docName, update);
      });
    },
    writeState: async () => {},
  };
}
