/**
 * UI Components
 * Reusable UI utilities for rendering components
 */

class UIComponents {
  /**
   * Create and display a toast notification
   */
  static showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    // Close button handler
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    // Auto-remove after duration
    setTimeout(() => {
      toast.remove();
    }, duration);
  }

  /**
   * Create table header row
   */
  static createTableHeader(columns) {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    return thead;
  }

  /**
   * Create table data row
   */
  static createTableRow(columns, data) {
    const row = document.createElement('tr');

    columns.forEach(column => {
      const td = document.createElement('td');
      const value = data[column];

      if (value === null || value === undefined) {
        td.innerHTML = '<em style="opacity: 0.5;">NULL</em>';
      } else if (typeof value === 'boolean') {
        td.innerHTML = `<code>${value ? 'true' : 'false'}</code>`;
      } else if (typeof value === 'object') {
        td.innerHTML = `<code>${JSON.stringify(value).substring(0, 50)}...</code>`;
      } else if (typeof value === 'string' && value.length > 50) {
        td.textContent = value.substring(0, 50) + '...';
        td.title = value;
      } else {
        td.textContent = value;
      }

      row.appendChild(td);
    });

    return row;
  }

  /**
   * Create table from data
   */
  static createTable(columns, rows) {
    const table = document.createElement('table');

    // Add header
    table.appendChild(this.createTableHeader(columns));

    // Add body
    const tbody = document.createElement('tbody');
    rows.forEach(row => {
      tbody.appendChild(this.createTableRow(columns, row));
    });
    table.appendChild(tbody);

    return table;
  }

  /**
   * Create loading spinner
   */
  static createSpinner() {
    const div = document.createElement('div');
    div.className = 'loading-spinner';
    div.textContent = 'Loading';
    return div;
  }

  /**
   * Show modal dialog
   */
  static showModal(title = 'Edit Record') {
    const modal = document.getElementById('recordModal');
    if (modal) {
      document.getElementById('modalTitle').textContent = title;
      modal.classList.add('active');
    }
  }

  /**
   * Hide modal dialog
   */
  static hideModal() {
    const modal = document.getElementById('recordModal');
    if (modal) {
      modal.classList.remove('active');
      const form = document.getElementById('recordForm');
      if (form) {
        form.innerHTML = '';
      }
    }
  }

  /**
   * Create pagination controls
   */
  static createPaginationControls(currentPage, totalPages, onPageChange) {
    const controls = document.createElement('div');
    controls.className = 'pagination-controls';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-secondary';
    prevBtn.textContent = '← Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    pageInfo.style.color = 'var(--text-secondary-color)';
    pageInfo.style.fontSize = 'var(--font-size-sm)';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-secondary';
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));

    controls.appendChild(prevBtn);
    controls.appendChild(pageInfo);
    controls.appendChild(nextBtn);

    return controls;
  }

  /**
   * Create dynamic form from schema
   */
  static createFormFromSchema(columns, data = {}) {
    const form = document.createElement('form');
    form.className = 'modal-form';

    columns.forEach(column => {
      if (column.isPrimaryKey) return; // Skip primary keys

      const group = document.createElement('div');
      group.className = 'form-group';

      const label = document.createElement('label');
      label.textContent = column.name;
      label.htmlFor = column.name;

      let input;

      // Create input based on column type
      switch (column.type.toLowerCase()) {
        case 'boolean':
          input = document.createElement('input');
          input.type = 'checkbox';
          input.id = column.name;
          input.name = column.name;
          if (data[column.name]) {
            input.checked = true;
          }
          break;

        case 'integer':
        case 'bigint':
        case 'smallint':
          input = document.createElement('input');
          input.type = 'number';
          input.id = column.name;
          input.name = column.name;
          if (data[column.name] !== undefined) {
            input.value = data[column.name];
          }
          break;

        case 'numeric':
        case 'decimal':
        case 'double precision':
          input = document.createElement('input');
          input.type = 'number';
          input.step = '0.01';
          input.id = column.name;
          input.name = column.name;
          if (data[column.name] !== undefined) {
            input.value = data[column.name];
          }
          break;

        case 'timestamp':
        case 'timestamp without time zone':
        case 'timestamp with time zone':
          input = document.createElement('input');
          input.type = 'datetime-local';
          input.id = column.name;
          input.name = column.name;
          if (data[column.name]) {
            input.value = new Date(data[column.name]).toISOString().slice(0, 16);
          }
          break;

        case 'date':
          input = document.createElement('input');
          input.type = 'date';
          input.id = column.name;
          input.name = column.name;
          if (data[column.name]) {
            input.value = data[column.name];
          }
          break;

        case 'text':
          input = document.createElement('textarea');
          input.id = column.name;
          input.name = column.name;
          if (data[column.name]) {
            input.value = data[column.name];
          }
          break;

        default:
          input = document.createElement('input');
          input.type = 'text';
          input.id = column.name;
          input.name = column.name;
          if (data[column.name]) {
            input.value = data[column.name];
          }
          if (column.type.startsWith('varchar')) {
            const match = column.type.match(/\((\d+)\)/);
            if (match) {
              input.maxLength = match[1];
            }
          }
      }

      group.appendChild(label);
      group.appendChild(input);
      form.appendChild(group);
    });

    return form;
  }

  /**
   * Create schema item display
   */
  static createSchemaItem(column) {
    const item = document.createElement('div');
    item.className = 'schema-item';

    const header = document.createElement('div');
    header.className = 'schema-item-header';

    const name = document.createElement('div');
    name.className = 'column-name';
    name.textContent = column.name;

    const type = document.createElement('div');
    type.className = 'column-type';
    type.textContent = column.type;

    const badge = document.createElement('span');
    badge.style.marginLeft = 'auto';
    if (column.isPrimaryKey) {
      badge.innerHTML = '<span class="status-badge" style="background-color: rgba(102, 126, 234, 0.2); color: var(--primary-color);">PK</span>';
    }

    header.appendChild(name);
    header.appendChild(type);
    if (column.isPrimaryKey) {
      header.appendChild(badge);
    }

    const properties = document.createElement('div');
    properties.className = 'column-properties';

    const nullableProp = document.createElement('div');
    nullableProp.className = 'property';
    nullableProp.innerHTML = `
      <span class="property-label">Nullable</span>
      <span class="property-value">${column.nullable ? 'Yes' : 'No'}</span>
    `;

    const defaultProp = document.createElement('div');
    defaultProp.className = 'property';
    defaultProp.innerHTML = `
      <span class="property-label">Default</span>
      <span class="property-value">${column.default || 'None'}</span>
    `;

    properties.appendChild(nullableProp);
    properties.appendChild(defaultProp);

    item.appendChild(header);
    item.appendChild(properties);

    return item;
  }

  /**
   * Create info box
   */
  static createInfoBox(message, type = 'info') {
    const box = document.createElement('div');
    box.className = `info-box ${type}`;

    const icon = document.createElement('div');
    icon.className = 'info-box-icon';
    icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

    const content = document.createElement('div');
    content.className = 'info-box-content';
    content.innerHTML = `<div class="info-box-message">${message}</div>`;

    box.appendChild(icon);
    box.appendChild(content);

    return box;
  }

  /**
   * Format value for display
   */
  static formatValue(value) {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  /**
   * Safely copy text to clipboard
   */
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard', 'success', 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      this.showToast('Failed to copy', 'error');
      return false;
    }
  }

  /**
   * Create table creation form with tabs
   */
  static createTableForm() {
    const container = document.createElement('div');
    container.id = 'createTableContainer';

    // Tabs
    const tabs = document.createElement('div');
    tabs.className = 'create-table-tabs';
    tabs.style.display = 'flex';
    tabs.style.gap = '10px';
    tabs.style.marginBottom = '20px';
    tabs.style.borderBottom = '1px solid #ddd';
    tabs.innerHTML = `
      <button type="button" class="tab-btn-create active" data-tab="form" style="padding: 10px 15px; border: none; background: none; cursor: pointer; border-bottom: 2px solid #667eea; color: #667eea;">
        📝 Form Builder
      </button>
      <button type="button" class="tab-btn-create" data-tab="ddl" style="padding: 10px 15px; border: none; background: none; cursor: pointer; color: #999;">
        🔧 DDL SQL
      </button>
    `;
    container.appendChild(tabs);

    // Form tab
    const formTab = document.createElement('div');
    formTab.id = 'formTab' ;
    formTab.style.display = 'block';

    const form = document.createElement('form');
    form.className = 'modal-form';
    form.id = 'createTableForm';

    // Table name input
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    nameGroup.innerHTML = `
      <label for="tableName">Table Name *</label>
      <input type="text" id="tableName" name="tableName" placeholder="e.g., users, products" required>
      <small>Must start with letter or underscore, contain only alphanumeric and underscores</small>
    `;
    form.appendChild(nameGroup);

    // Columns section
    const columnsSection = document.createElement('div');
    columnsSection.className = 'form-group';
    columnsSection.innerHTML = `
      <label>Columns *</label>
      <div id="columnsContainer">
        <!-- Columns will be added here -->
      </div>
      <button type="button" id="addColumnBtn" class="btn btn-secondary" style="margin-top: 10px;">
        + Add Column
      </button>
    `;
    form.appendChild(columnsSection);

    // Add first column row
    this.addColumnRow();

    // Buttons for form tab
    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '10px';
    buttonGroup.style.marginTop = '20px';
    buttonGroup.innerHTML = `
      <button type="submit" class="btn btn-primary" style="flex: 1;">Create Table</button>
      <button type="button" id="cancelCreateTableBtn" class="btn btn-secondary" style="flex: 1;">Cancel</button>
    `;
    form.appendChild(buttonGroup);
    formTab.appendChild(form);
    container.appendChild(formTab);

    // DDL tab
    const ddlTab = document.createElement('div');
    ddlTab.id = 'ddlTab';
    ddlTab.style.display = 'none';

    const ddlForm = document.createElement('form');
    ddlForm.id = 'createTableDDLForm';

    const ddlGroup = document.createElement('div');
    ddlGroup.className = 'form-group';
    ddlGroup.innerHTML = `
      <label for="ddlQuery">CREATE TABLE DDL *</label>
      <textarea id="ddlQuery" name="ddlQuery" placeholder="CREATE TABLE users (&#10;  id SERIAL PRIMARY KEY,&#10;  name TEXT NOT NULL,&#10;  email TEXT NOT NULL,&#10;  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP&#10;);" style="font-family: monospace; min-height: 200px;" required></textarea>
      <small>Enter CREATE TABLE statement. Supports CREATE, ALTER, and DROP statements.</small>
    `;
    ddlForm.appendChild(ddlGroup);

    // Buttons for DDL tab
    const ddlButtonGroup = document.createElement('div');
    ddlButtonGroup.style.display = 'flex';
    ddlButtonGroup.style.gap = '10px';
    ddlButtonGroup.style.marginTop = '20px';
    ddlButtonGroup.innerHTML = `
      <button type="submit" class="btn btn-primary" style="flex: 1;">Execute DDL</button>
      <button type="button" id="cancelDDLBtn" class="btn btn-secondary" style="flex: 1;">Cancel</button>
    `;
    ddlForm.appendChild(ddlButtonGroup);
    ddlTab.appendChild(ddlForm);
    container.appendChild(ddlTab);

    // Tab switching logic
    const tabBtns = container.querySelectorAll('.tab-btn-create');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = btn.dataset.tab;

        // Update active tab button
        tabBtns.forEach(b => {
          b.classList.remove('active');
          b.style.borderBottom = 'none';
          b.style.color = '#999';
        });
        btn.classList.add('active');
        btn.style.borderBottom = '2px solid #667eea';
        btn.style.color = '#667eea';

        // Show/hide tab content
        document.getElementById('formTab').style.display = tabName === 'form' ? 'block' : 'none';
        document.getElementById('ddlTab').style.display = tabName === 'ddl' ? 'block' : 'none';
      });
    });

    return container;
  }

  /**
   * Add a column row to the table creation form
   */
  static addColumnRow(index = null) {
    const container = document.getElementById('columnsContainer');
    if (!container) return;

    const idx = container.children.length;
    const columnRow = document.createElement('div');
    columnRow.className = 'column-row';
    columnRow.style.display = 'grid';
    columnRow.style.gridTemplateColumns = '1fr 1fr 1fr 1fr auto';
    columnRow.style.gap = '8px';
    columnRow.style.marginBottom = '10px';
    columnRow.style.alignItems = 'center';

    columnRow.innerHTML = `
      <input type="text" placeholder="Column name" class="col-name" required>
      <select class="col-type">
        <option value="TEXT">TEXT</option>
        <option value="INTEGER">INTEGER</option>
        <option value="BIGINT">BIGINT</option>
        <option value="NUMERIC">NUMERIC</option>
        <option value="BOOLEAN">BOOLEAN</option>
        <option value="TIMESTAMP">TIMESTAMP</option>
        <option value="DATE">DATE</option>
        <option value="UUID">UUID</option>
      </select>
      <label style="display: flex; align-items: center; gap: 4px;">
        <input type="checkbox" class="col-nullable" checked>
        Nullable
      </label>
      <label style="display: flex; align-items: center; gap: 4px;">
        <input type="checkbox" class="col-primary">
        Primary Key
      </label>
      <button type="button" class="btn-delete-col" style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">×</button>
    `;

    const deleteBtn = columnRow.querySelector('.btn-delete-col');
    deleteBtn.addEventListener('click', () => {
      columnRow.remove();
      // Disable delete if only one column left
      const rows = container.querySelectorAll('.column-row');
      rows.forEach(row => {
        row.querySelector('.btn-delete-col').disabled = rows.length === 1;
      });
    });

    container.appendChild(columnRow);

    // Disable delete if only one column
    const rows = container.querySelectorAll('.column-row');
    rows.forEach(row => {
      row.querySelector('.btn-delete-col').disabled = rows.length === 1;
    });
  }
}
