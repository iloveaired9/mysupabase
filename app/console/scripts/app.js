/**
 * Main Application
 * Initialize console and setup event listeners
 */

class ConsoleApp {
  constructor() {
    this.init();
  }

  /**
   * Initialize application
   */
  async init() {
    console.log('🚀 Initializing Database Console...');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Setup event listeners and load initial data
   */
  setup() {
    console.log('✅ DOM ready, setting up console...');

    // Initialize managers
    themeManager.init();
    tableManager.loadTableList();

    // Setup event listeners
    this.setupTabEvents();
    this.setupDataEvents();
    this.setupQueryEvents();
    this.setupModalEvents();
    this.setupToolbarEvents();

    console.log('✅ Console ready!');
  }

  /**
   * Setup tab switching
   */
  setupTabEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;

        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Show active tab pane
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');
      });
    });
  }

  /**
   * Setup data tab events
   */
  setupDataEvents() {
    // Add record button
    const addRecordBtn = document.getElementById('addRecordBtn');
    if (addRecordBtn) {
      addRecordBtn.addEventListener('click', () => {
        if (tableManager.hasTableSelected()) {
          tableManager.addRecord();
        } else {
          UIComponents.showToast('Please select a table first', 'warning');
        }
      });
    }

    // Search input (placeholder for future implementation)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query) {
          // TODO: Implement search functionality
          console.log('Search:', query);
        }
      });
    }
  }

  /**
   * Setup query tab events
   */
  setupQueryEvents() {
    // Execute query button
    const executeBtn = document.getElementById('executeQueryBtn');
    if (executeBtn) {
      executeBtn.addEventListener('click', () => {
        QueryBuilder.executeQuery();
      });
    }

    // Allow Ctrl+Enter to execute query
    const queryInput = document.getElementById('queryInput');
    if (queryInput) {
      queryInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          QueryBuilder.executeQuery();
        }
      });
    }
  }

  /**
   * Setup modal events
   */
  setupModalEvents() {
    const modal = document.getElementById('recordModal');
    if (!modal) return;

    // Close button
    document.getElementById('closeModalBtn').addEventListener('click', () => {
      UIComponents.hideModal();
    });

    // Cancel button
    document.getElementById('cancelModalBtn').addEventListener('click', () => {
      UIComponents.hideModal();
    });

    // Click on overlay to close
    document.querySelector('.modal-overlay').addEventListener('click', () => {
      UIComponents.hideModal();
    });

    // Prevent close when clicking on modal content
    document.querySelector('.modal-content').addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        UIComponents.hideModal();
      }
    });
  }

  /**
   * Setup toolbar events
   */
  setupToolbarEvents() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        if (tableManager.hasTableSelected()) {
          refreshBtn.disabled = true;
          refreshBtn.innerHTML = '<span class="icon">⏳</span><span>Refreshing...</span>';
          try {
            await tableManager.selectTable(tableManager.getCurrentTable());
            UIComponents.showToast('Table refreshed', 'success', 1500);
          } catch (error) {
            UIComponents.showToast(`Refresh failed: ${error.message}`, 'error');
          } finally {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<span class="icon">🔄</span><span>Refresh</span>';
          }
        } else {
          await tableManager.loadTableList();
          UIComponents.showToast('Table list refreshed', 'success', 1500);
        }
      });
    }

    // New table button
    const newTableBtn = document.getElementById('newTableBtn');
    if (newTableBtn) {
      newTableBtn.addEventListener('click', () => {
        this.showCreateTableModal();
      });
    }
  }

  /**
   * Update UI state
   */
  updateUIState() {
    const hasTable = tableManager.hasTableSelected();
    const contentWrapper = document.getElementById('contentWrapper');
    const emptyState = document.getElementById('emptyState');

    if (hasTable) {
      emptyState.style.display = 'none';
      contentWrapper.style.display = 'flex';
    } else {
      emptyState.style.display = 'flex';
      contentWrapper.style.display = 'none';
    }
  }

  /**
   * Show create table modal
   */
  showCreateTableModal() {
    UIComponents.showModal('Create New Table');
    const form = UIComponents.createTableForm();
    const recordForm = document.getElementById('recordForm');
    recordForm.innerHTML = '';
    recordForm.appendChild(form);

    // Add column button
    document.getElementById('addColumnBtn').addEventListener('click', () => {
      UIComponents.addColumnRow();
    });

    // Cancel button
    document.getElementById('cancelCreateTableBtn').addEventListener('click', () => {
      UIComponents.hideModal();
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleCreateTable();
    });
  }

  /**
   * Handle table creation
   */
  async handleCreateTable() {
    const tableName = document.getElementById('tableName').value.trim();
    const columnRows = document.querySelectorAll('.column-row');

    if (!tableName) {
      UIComponents.showToast('Table name is required', 'warning');
      return;
    }

    // Collect column definitions
    const columns = [];
    columnRows.forEach(row => {
      const name = row.querySelector('.col-name').value.trim();
      const type = row.querySelector('.col-type').value;
      const nullable = row.querySelector('.col-nullable').checked;
      const isPrimaryKey = row.querySelector('.col-primary').checked;

      if (!name) {
        UIComponents.showToast('All column names are required', 'warning');
        return;
      }

      columns.push({
        name,
        type,
        nullable,
        isPrimaryKey
      });
    });

    if (columns.length === 0) return;

    try {
      const response = await apiClient.createTable(tableName, columns);
      UIComponents.showToast(`Table '${tableName}' created successfully!`, 'success');
      UIComponents.hideModal();

      // Refresh table list
      await tableManager.loadTableList();
    } catch (error) {
      UIComponents.showToast(`Error: ${error.message}`, 'error');
    }
  }

  /**
   * Check database connection
   */
  async checkDatabaseConnection() {
    try {
      await apiClient.getTables();
      document.getElementById('dbStatus').textContent = 'Connected';
      document.querySelector('.status-dot').className = 'status-dot online';
    } catch (error) {
      document.getElementById('dbStatus').textContent = 'Disconnected';
      document.querySelector('.status-dot').className = 'status-dot offline';
      console.error('Database connection failed:', error);
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new ConsoleApp();
  app.checkDatabaseConnection();
});
