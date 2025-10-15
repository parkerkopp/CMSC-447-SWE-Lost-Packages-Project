// src/composables/AccessDatabase.js
// Uses Vue 3's Composition API with reactive references
import { ref } from "vue";
// Imports SQL.js, a JS SQLite library that runs entirely in the
// browser via WebAssembly
import initSqlJs from "sql.js";

export function useDatabase() {
  // The actual database instance (null until initialized)
  const db = ref(null);
  // Boolean indicating if database operations are in progress
  const loading = ref(false);
  // Stores any error messages from failed operations
  const error = ref(null);

  const initDatabase = async () => {
    /*
     * Handles the complex process of setting up the database
     *  Loading State Management: Sets loading to true and clears
     *    previous errors
     * */
    loading.value = true;
    error.value = null;

    try {
      // Initialize SQL.js
      // Downloads the WebAssembly files needed for SQL.js from
      // their CDN
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      // Database file loading
      // Fetches a pre-existing SQLite database file from the public
      // directory
      const response = await fetch("../../public/package_db.db"); // Note: no 'public' in the path
      if (!response.ok) {
        throw new Error(`Failed to load database: ${response.statusText}`);
      }

      // Converts the response to an ArrayBuffer
      const buffer = await response.arrayBuffer();
      // then to Uint8Array
      // Creates a new SQL.js database instance from the binary data
      db.value = new SQL.Database(new Uint8Array(buffer));

      console.log("Database loaded successfully");
    } catch (err) {
      error.value = err.message;
      console.error("Error loading database:", err);
    } finally {
      loading.value = false;
    }
  };

  const query = (sql) => {
    /*
     * Parameters: Takes a SQL string
     * */
    // Database validation
    if (!db.value) {
      throw new Error("Database not initialized. Call initDatabase() first.");
    }

    try {
      // Statement Preparation: Compiles the SQL into an
      //  executable statement object
      // Performance: Prepared statements are more efficient
      //  than raw SQL execution
      const stmt = db.value.prepare(sql);
      const result = [];

      // stmt.step() advances to the next row and returns true if
      //  a row exists
      while (stmt.step()) {
        // stmt.getAsObject() converts the current row into a JS
        //  object with column names as keys
        // Each row is pushed into the results array
        /* Example
         *  If your table has columns: id, name, email
         *    Each row becomes:
         *      { id: 1, name: "John", email: "john@email.com" }*/
        result.push(stmt.getAsObject());
      }

      // Critical cleanup: Releases the prepared statement from
      //  memory
      // Memory Leak Prevention: Without this, statements would
      //  accumulate and cause memory issues
      stmt.free();
      return result;
    } catch (err) {
      console.error("Query error:", err);
      throw err;
    }
  };

  // Convenience Method: Wrapper around the main query function
  // Single Result: Returns only the first row or null if no results
  // Use Cases: Perfect for queries where you expect only one result
  //  (e.g., finding a user by ID)
  const queryFirst = (sql, params = []) => {
    const results = query(sql, params);
    return results.length > 0 ? results[0] : null;
  };

  // Safe cleanup: Checks if database exists before closing
  const closeDatabase = () => {
    // Prevents errors: Avoids attempting to close an already closed
    //  or non-existent database
    if (db.value) {
      // Resource Management
      db.value.close(); // releases the database from memory
      db.value = null; // clears the Vue reactive interface
    }
  };

  /*
   * State: db, loading, error (reactive references)
   * Actions: initDatabase, query, queryFirst, closeDatabase (functions)
   * */
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
