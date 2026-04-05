/**
 * Table Manager
 * Handles table selection, data loading, and record management
 */

class TableManager {
  constructor() {
    this.currentTable = null;
    this.currentPage = 1;
    this.recordsPerPage = 10;
    this.schema = null;
  }

  /**
   * Load and display all tables
   */
  async loadTableList() {
    const tableList = document.getElementById('tableList');
    tableList.innerHTML = '';

    try {
      const response = await apiClient.getTables();
      const tables = response.data || [];

      if (tables.length === 0) {
        tableList.innerHTML = '<p style="color: var(--text-secondary-color); padding: var(--spacing-md); text-align: center;">No tables found</p>';
        return;
      }

      tables.forEach(table => {
        const item = document.createElement('div');
        item.className = 'table-item';
        item.innerHTML = `
          <div class="icon">📊</div>
          <div class="table-info">
            <div class="table-name">${table.name}</div>
            <div class="table-meta">${table.rowCount} rows</div>
          </div>
        `;

        item.addEventListener('click', () => this.selectTable(table.name));
        tableList.appendChild(item);
      });

    } catch (error) {
      console.error('Failed to load tables:', error);
      UIComponents.showToast(`Error: ${error.message}`, 'error');
      tableList.innerHTML = '<p style="color: var(--danger-color); padding: var(--spacing-md);">Failed to load tables</p>';
    }
  }

  /**
   * Select a table and load its data
   */
  async selectTable(tableName) {
    this.currentTable = tableName;
    this.currentPage = 1;

    // Update active state
    document.querySelectorAll('.table-item').forEach(item => {
      item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // Show content wrapper
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('contentWrapper').style.display = 'flex';

    // Load schema and data
    try {
      const schemaResponse = await apiClient.getTableSchema(tableName);
      this.schema = schemaResponse.data;

      const dataResponse = await apiClient.getTableRecords(tableName, this.currentPage, this.recordsPerPage);

      this.renderTableData(dataResponse.data, dataResponse.pagination);
      this.renderSchemaView(this.schema.columns);
      this.updateSettingsView(tableName, dataResponse.pagination.total, this.schema.columns.length);

    } catch (error) {
      console.error('Failed to load table:', error);
      UIComponents.showToast(`Error: ${error.message}`, 'error');
    }
  }

  /**
   * Render table data in Data tab
   */
  renderTableData(rows, pagination) {
    const tableView = document.getElementById('tableView');
    tableView.innerHTML = '';

    if (rows.length === 0) {
      tableView.appendChild(UIComponents.createInfoBox('No records found', 'info'));
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    const columns = Object.keys(rows[0]);
    const table = UIComponents.createTable(columns, rows);
    tableView.appendChild(table);

    // Render pagination
    this.renderPagination(pagination);
  }

  /**
   * Render pagination controls
   */
  renderPagination(pagination) {
    const container = document.getElementById('pagination');
    container.innerHTML = '';

    if (pagination.pages > 1) {
      const controls = UIComponents.createPaginationControls(
        pagination.page,
        pagination.pages,
        (page) => this.goToPage(page)
      );
      container.appendChild(controls);
    }
  }

  /**
   * Go to specific page
   */
  async goToPage(page) {
    try {
      const response = await apiClient.getTableRecords(this.currentTable, page, this.recordsPerPage);
      this.currentPage = page;
      this.renderTableData(response.data, response.pagination);
    } catch (error) {
      console.error('Failed to load page:', error);
      UIComponents.showToast(`Error: ${error.message}`, 'error');
    }
  }

  /**
   * Render schema view
   */
  renderSchemaView(columns) {
    const schemaView = document.getElementById('schemaView');
    schemaView.innerHTML = '';

    columns.forEach(column => {
      schemaView.appendChild(UIComponents.createSchemaItem(column));
    });
  }

  /**
   * Update settings view
   */
  updateSettingsView(tableName, rowCount, columnCount) {
    document.getElementById('settingTableName').textContent = tableName;
    document.getElementById('settingRowCount').textContent = rowCount;
    document.getElementById('settingColumnCount').textContent = columnCount;
  }

  /**
   * Add new record
   */
  async addRecord() {
    if (!this.schema) return;

    UIComponents.showModal(`Add Record to ${this.currentTable}`);
    const form = document.getElementById('recordForm');
    form.innerHTML = '';
    form.appendChild(UIComponents.createFormFromSchema(this.schema.columns));

    // Save handler
    document.getElementById('saveRecordBtn').onclick = async () => {
      const formData = new FormData(form);
      const data = {};

      // Convert form data to object
      this.schema.columns.forEach(column => {
        if (column.isPrimaryKey) return;

        const value = formData.get(column.name);

        // Type conversion
        if (value === null || value === '') {
          data[column.name] = null;
        } else if (column.type.includes('boolean')) {
          data[column.name] = formData.get(column.name) === 'on';
        } else if (column.type.includes('int') || column.type.includes('numeric') || column.type.includes('decimal')) {
          data[column.name] = isNaN(value) ? value : Number(value);
        } else {
          data[column.name] = value;
        }
      });

      try {
        await apiClient.insertRecord(this.currentTable, data);
        UIComponents.showToast('Record added successfully', 'success');
        UIComponents.hideModal();
        await this.selectTable(this.currentTable);
      } catch (error) {
        console.error('Failed to insert record:', error);
        UIComponents.showToast(`Error: ${error.message}`, 'error');
      }
    };
  }

  /**
   * Get current table name
   */
  getCurrentTable() {
    return this.currentTable;
  }

  /**
   * Check if table is selected
   */
  hasTableSelected() {
    return this.currentTable !== null;
  }
}

// Create global instance
const tableManager = new TableManager();
