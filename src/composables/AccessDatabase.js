// src/composables/AccessDatabase.js
import { ref } from "vue";
import initSqlJs from "sql.js";

export function useDatabase() {
  const db = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const initDatabase = async () => {
    loading.value = true;
    error.value = null;

    try {
      // Initialize SQL.js
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      // Fetch your database file from public directory
      const response = await fetch("../../public/package_db.db"); // Note: no 'public' in the path
      if (!response.ok) {
        throw new Error(`Failed to load database: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      db.value = new SQL.Database(new Uint8Array(buffer));

      console.log("Database loaded successfully");
    } catch (err) {
      error.value = err.message;
      console.error("Error loading database:", err);
    } finally {
      loading.value = false;
    }
  };

  const query = (sql, params = []) => {
    if (!db.value) {
      throw new Error("Database not initialized. Call initDatabase() first.");
    }

    try {
      const stmt = db.value.prepare(sql);
      const result = [];

      while (stmt.step()) {
        result.push(stmt.getAsObject());
      }

      stmt.free();
      return result;
    } catch (err) {
      console.error("Query error:", err);
      throw err;
    }
  };

  const queryFirst = (sql, params = []) => {
    const results = query(sql, params);
    return results.length > 0 ? results[0] : null;
  };

  const closeDatabase = () => {
    if (db.value) {
      db.value.close();
      db.value = null;
    }
  };

  return {
    db,
    loading,
    error,
    initDatabase,
    query,
    queryFirst,
    closeDatabase,
  };
}
