/**
 * API Client
 * Handles all HTTP requests to backend API
 */

class APIClient {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    // Auto-detect host in production
    if (window.location.hostname !== 'localhost') {
      this.baseURL = `http://${window.location.hostname}:3000/api`;
    }
  }

  /**
   * Generic request method
   */
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || response.statusText);
      }

      return result;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * Database Introspection
   */

  /**
   * Get all tables with metadata
   */
  async getTables() {
    return this.request('GET', '/db/tables');
  }

  /**
   * Get table schema (columns, types, constraints)
   */
  async getTableSchema(tableName) {
    return this.request('GET', `/db/tables/${tableName}/schema`);
  }

  /**
   * Get paginated records from table
   */
  async getTableRecords(tableName, page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit }).toString();
    return this.request('GET', `/db/tables/${tableName}/records?${params}`);
  }

  /**
   * CRUD Operations
   */

  /**
   * Insert new record
   */
  async insertRecord(tableName, data) {
    return this.request('POST', `/db/tables/${tableName}/records`, data);
  }

  /**
   * Update record (not yet implemented in backend)
   */
  async updateRecord(tableName, id, data) {
    return this.request('PUT', `/db/tables/${tableName}/records/${id}`, data);
  }

  /**
   * Delete record (not yet implemented in backend)
   */
  async deleteRecord(tableName, id) {
    return this.request('DELETE', `/db/tables/${tableName}/records/${id}`);
  }

  /**
   * Create new table
   */
  async createTable(tableName, columns) {
    return this.request('POST', '/db/tables', { tableName, columns });
  }

  /**
   * Query Execution
   */

  /**
   * Execute SELECT query
   */
  async executeQuery(sqlQuery) {
    return this.request('POST', '/db/query', { query: sqlQuery });
  }
}

// Create global instance
const apiClient = new APIClient();
