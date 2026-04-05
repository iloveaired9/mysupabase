/**
 * Query Builder
 * Handles SQL query execution and result display
 */

class QueryBuilder {
  /**
   * Execute SQL query
   */
  static async executeQuery() {
    const queryInput = document.getElementById('queryInput');
    const query = queryInput.value.trim();

    if (!query) {
      UIComponents.showToast('Please enter a query', 'warning');
      return;
    }

    // Validate that it's a SELECT query
    if (!query.toUpperCase().startsWith('SELECT')) {
      UIComponents.showToast('Only SELECT queries are allowed', 'warning');
      return;
    }

    const resultsDiv = document.getElementById('queryResults');
    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(UIComponents.createSpinner());

    try {
      const response = await apiClient.executeQuery(query);
      this.renderResults(response.data);
      UIComponents.showToast(`Query executed successfully (${response.rowCount} rows)`, 'success');
    } catch (error) {
      console.error('Query execution failed:', error);
      resultsDiv.innerHTML = '';
      resultsDiv.appendChild(UIComponents.createInfoBox(`Error: ${error.message}`, 'error'));
      UIComponents.showToast('Query execution failed', 'error');
    }
  }

  /**
   * Render query results
   */
  static renderResults(data) {
    const resultsDiv = document.getElementById('queryResults');
    resultsDiv.innerHTML = '';

    if (!data || data.length === 0) {
      resultsDiv.appendChild(UIComponents.createInfoBox('No results found', 'info'));
      return;
    }

    const columns = Object.keys(data[0]);
    const table = UIComponents.createTable(columns, data);
    resultsDiv.appendChild(table);
  }

  /**
   * Load sample queries
   */
  static loadSampleQueries() {
    const queryInput = document.getElementById('queryInput');

    const samples = {
      'All Posts': 'SELECT * FROM posts LIMIT 10;',
      'Posts with Count': 'SELECT p.id, p.title, c.name as category FROM posts p JOIN categories c ON p.category_id = c.id LIMIT 5;',
      'Category Stats': 'SELECT c.name, COUNT(p.id) as post_count FROM categories c LEFT JOIN posts p ON c.id = p.category_id GROUP BY c.id, c.name;',
      'Top Posts by Likes': 'SELECT id, title, likes FROM posts ORDER BY likes DESC LIMIT 10;',
    };

    // You can add a sample queries dropdown here if needed
    return samples;
  }

  /**
   * Export results as JSON
   */
  static exportAsJSON(data) {
    if (!data || data.length === 0) {
      UIComponents.showToast('No data to export', 'warning');
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    UIComponents.showToast('Results exported as JSON', 'success');
  }

  /**
   * Export results as CSV
   */
  static exportAsCSV(data) {
    if (!data || data.length === 0) {
      UIComponents.showToast('No data to export', 'warning');
      return;
    }

    const columns = Object.keys(data[0]);
    const csv = [
      columns.join(','),
      ...data.map(row =>
        columns.map(col => {
          const value = row[col];
          // Escape quotes and wrap in quotes if necessary
          if (typeof value === 'string') {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    UIComponents.showToast('Results exported as CSV', 'success');
  }

  /**
   * Copy query results to clipboard
   */
  static copyResults(data) {
    if (!data || data.length === 0) {
      UIComponents.showToast('No data to copy', 'warning');
      return;
    }

    const json = JSON.stringify(data, null, 2);
    UIComponents.copyToClipboard(json);
  }

  /**
   * Clear query and results
   */
  static clearAll() {
    document.getElementById('queryInput').value = '';
    document.getElementById('queryResults').innerHTML = '';
  }

  /**
   * Format SQL query
   */
  static formatQuery() {
    const queryInput = document.getElementById('queryInput');
    let query = queryInput.value;

    // Simple SQL formatting
    query = query
      .replace(/\bSELECT\b/gi, 'SELECT')
      .replace(/\bFROM\b/gi, 'FROM')
      .replace(/\bWHERE\b/gi, 'WHERE')
      .replace(/\bJOIN\b/gi, 'JOIN')
      .replace(/\bON\b/gi, 'ON')
      .replace(/\bGROUP BY\b/gi, 'GROUP BY')
      .replace(/\bORDER BY\b/gi, 'ORDER BY')
      .replace(/\bLIMIT\b/gi, 'LIMIT');

    queryInput.value = query;
    UIComponents.showToast('Query formatted', 'success', 1500);
  }
}
