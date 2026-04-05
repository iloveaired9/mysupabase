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
    this.setupCrudEvents();
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

        // Update CRUD info when CRUD tab is selected
        if (tab === 'crud') {
          this.updateCrudTabInfo();
        }
      });
    });
  }

  /**
   * Update CRUD tab information based on selected table
   */
  updateCrudTabInfo() {
    const tableName = tableManager?.currentTable;
    const crudTableInfo = document.getElementById('crudTableInfo');
    const crudTableDetails = document.getElementById('crudTableDetails');

    if (!tableName) {
      if (crudTableInfo) crudTableInfo.textContent = 'Select a table to test CRUD operations';
      if (crudTableDetails) crudTableDetails.innerHTML = '<li>Select a table to view details</li>';
      return;
    }

    // Update description
    if (crudTableInfo) {
      crudTableInfo.textContent = `Test CRUD operations on the "${tableName}" table`;
    }

    // Fetch table schema to display column information
    apiClient.getTableSchema(tableName).then(schemaResponse => {
      const columns = (schemaResponse.data?.columns) || (schemaResponse.columns) || [];

      // Remove duplicate columns (keep only first occurrence)
      const seen = new Set();
      const uniqueColumns = columns.filter(col => {
        if (seen.has(col.name)) return false;
        seen.add(col.name);
        return true;
      });

      const columnList = uniqueColumns
        .slice(0, 8) // Show first 8 columns
        .map(col => `<li><strong>${col.name}</strong> (${col.type}${col.nullable ? ', nullable' : ', NOT NULL'})</li>`)
        .join('');

      if (crudTableDetails) {
        crudTableDetails.innerHTML = columnList || '<li>No columns found</li>';
      }
    }).catch(error => {
      console.error('Failed to fetch schema:', error);
      if (crudTableDetails) {
        crudTableDetails.innerHTML = `<li>Error loading schema</li>`;
      }
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
   * Setup CRUD test events
   */
  setupCrudEvents() {
    console.log('🔧 Setting up CRUD events...');

    // Wait a bit for DOM to be fully settled
    setTimeout(() => {
      const crudResultsDiv = document.getElementById('crudResults');

      if (!crudResultsDiv) {
        console.error('❌ crudResults div not found');
        return;
      }

      if (!apiClient) {
        console.error('❌ apiClient not defined');
        return;
      }

      console.log('✅ CRUD setup ready, attaching event listeners...');

      // Create test data button
      const createBtn = document.getElementById('crudCreateBtn');
      if (createBtn) {
        createBtn.addEventListener('click', async () => {
          console.log('▶ CREATE clicked');

          const tableName = tableManager?.currentTable;
          if (!tableName) {
            UIComponents.showToast('Please select a table first', 'warning');
            return;
          }

          crudResultsDiv.innerHTML = '';
          crudResultsDiv.appendChild(UIComponents.createSpinner());

          try {
            // Get table schema to find column names
            const schemaResponse = await apiClient.getTableSchema(tableName);
            const columns = (schemaResponse.data?.columns) || (schemaResponse.columns) || [];

            // Remove duplicate columns (keep only first occurrence)
            const seen = new Set();
            const uniqueColumns = columns.filter(col => {
              if (seen.has(col.name)) return false;
              seen.add(col.name);
              return true;
            });

            // Filter for insertable columns (exclude auto-generated, timestamp, and certain types)
            let insertableColumns = uniqueColumns.filter(col =>
              col.name !== 'id' &&
              !col.name.includes('_at') &&
              !col.name.includes('_id') &&
              !col.isPrimaryKey &&
              !col.type.includes('timestamp') && // Exclude timestamp columns
              !col.type.includes('date')  // Exclude date columns
            );

            console.log('Filtered insertable columns:', insertableColumns);

            if (insertableColumns.length === 0) {
              // If no columns found, use all non-primary-key, non-id columns
              insertableColumns = uniqueColumns.filter(col =>
                col.name !== 'id' && !col.isPrimaryKey
              );
              console.log('Fallback insertable columns:', insertableColumns);
            }

            if (insertableColumns.length === 0) {
              crudResultsDiv.innerHTML = '';
              crudResultsDiv.appendChild(
                UIComponents.createInfoBox('❌ No insertable columns found in this table', 'error')
              );
              UIComponents.showToast('Table has no insertable columns', 'warning');
              return;
            }

            // Build a sample INSERT query
            const columnNames = insertableColumns.map(col => col.name).join(', ');
            const placeholders = insertableColumns.map((col, idx) => {
              // Return sample values based on column type
              if (col.type.includes('char') || col.type.includes('text')) {
                // Use short sample values to avoid constraint violations
                const shortValues = ['Test', 'Sample', 'Demo', 'Data', 'Value'];
                return `'${shortValues[idx % shortValues.length]}'`;
              } else if (col.type.includes('int')) {
                return idx + 1;
              } else if (col.type.includes('bool')) {
                return 'true';
              }
              return `'val${idx + 1}'`;
            }).join(', ');

            const insertQuery = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders});`;

            // Try to insert one test row
            await apiClient.executeDML(insertQuery);

            crudResultsDiv.innerHTML = '';
            crudResultsDiv.appendChild(
              UIComponents.createInfoBox(`✅ Inserted test record into ${tableName}`, 'success')
            );
            UIComponents.showToast('Test record created', 'success');
          } catch (error) {
            crudResultsDiv.innerHTML = '';
            crudResultsDiv.appendChild(
              UIComponents.createInfoBox(`❌ Error: ${error.message}`, 'error')
            );
            UIComponents.showToast('Failed to create test record', 'error');
          }
        });
      } else {
        console.warn('⚠️ crudCreateBtn not found');
      }

      // Read all records button
      const readBtn = document.getElementById('crudReadBtn');
      if (readBtn) {
        readBtn.addEventListener('click', async () => {
          console.log('▶ READ clicked');

          const tableName = tableManager?.currentTable;
          if (!tableName) {
            UIComponents.showToast('Please select a table first', 'warning');
            return;
          }

          crudResultsDiv.innerHTML = '';
          crudResultsDiv.appendChild(UIComponents.createSpinner());

          try {
            const response = await apiClient.executeQuery(`SELECT * FROM ${tableName} LIMIT 100;`);
            crudResultsDiv.innerHTML = '';

            if (response.data && response.data.length > 0) {
              const columnNames = Object.keys(response.data[0]);
              const table = UIComponents.createTable(columnNames, response.data);
              crudResultsDiv.appendChild(table);
            } else {
              crudResultsDiv.appendChild(UIComponents.createInfoBox('No records found', 'info'));
            }

            UIComponents.showToast(`Retrieved ${response.data.length} records`, 'success');
          } catch (error) {
            crudResultsDiv.innerHTML = '';
            crudResultsDiv.appendChild(
              UIComponents.createInfoBox(`❌ Error: ${error.message}`, 'error')
            );
            UIComponents.showToast('Failed to read records', 'error');
          }
        });
      } else {
        console.warn('⚠️ crudReadBtn not found');
      }

      // Update first record button
      const updateBtn = document.getElementById('crudUpdateBtn');
      if (updateBtn) {
        updateBtn.addEventListener('click', async () => {
          console.log('▶ UPDATE clicked');

          const tableName = tableManager?.currentTable;
          if (!tableName) {
            UIComponents.showToast('Please select a table first', 'warning');
            return;
          }

          crudResultsDiv.innerHTML = '';
          crudResultsDiv.appendChild(UIComponents.createSpinner());

          try {
            // Get the last inserted record (most recent test data)
            const lastRecord = await apiClient.executeQuery(`SELECT * FROM ${tableName} ORDER BY id DESC LIMIT 1;`);

            if (!lastRecord.data || lastRecord.data.length === 0) {
              crudResultsDiv.innerHTML = '';
              crudResultsDiv.appendChild(
                UIComponents.createInfoBox('No records to update', 'info')
              );
              UIComponents.showToast('Table is empty', 'warning');
              return;
            }

            const record = lastRecord.data[0];
            const recordId = record.id;

            // Build a simple UPDATE query with one column
            const schemaResponse = await apiClient.getTableSchema(tableName);
            const columns = (schemaResponse.data?.columns) || (schemaResponse.columns) || [];

            // Find first updatable column (not id, not timestamp)
            const updateColumn = columns.find(col =>
              col.name !== 'id' && !col.name.includes('_at') && !col.isPrimaryKey
            );

            if (!updateColumn) {
              crudResultsDiv.innerHTML = '';
              crudResultsDiv.appendChild(
                UIComponents.createInfoBox('No updatable columns found', 'warning')
              );
              return;
            }

            // Create update value
            let updateValue = 'Updated';
            if (updateColumn.type.includes('int')) {
              updateValue = '999';
            } else if (updateColumn.type.includes('bool')) {
              updateValue = 'false';
            }

            const updateQuery = `UPDATE ${tableName} SET ${updateColumn.name} = '${updateValue}' WHERE id = ${recordId};`;
            const response = await apiClient.executeDML(updateQuery);

            crudResultsDiv.innerHTML = '';
            crudResultsDiv.appendChild(
              UIComponents.createInfoBox(
                `✅ Updated record #${recordId} successfully\n${updateColumn.name} = '${updateValue}'\n${response.rowsAffected} row(s) affected`,
                'success'
              )
            );
            UIComponents.showToast('Record updated', 'success');
          } catch (error) {
            crudResultsDiv.innerHTML = '';
            crudResultsDiv.appendChild(
              UIComponents.createInfoBox(`❌ Error: ${error.message}`, 'error')
            );
            UIComponents.showToast('Failed to update record', 'error');
          }
        });
      } else {
        console.warn('⚠️ crudUpdateBtn not found');
      }

      // Delete last record button
      const deleteBtn = document.getElementById('crudDeleteBtn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          console.log('▶ DELETE clicked');

          const tableName = tableManager?.currentTable;
          if (!tableName) {
            UIComponents.showToast('Please select a table first', 'warning');
            return;
          }

          crudResultsDiv.innerHTML = '';
          crudResultsDiv.appendChild(UIComponents.createSpinner());

          try {
            // Get the last inserted record to delete it (safest option)
            const lastRecord = await apiClient.executeQuery(`SELECT * FROM ${tableName} ORDER BY id DESC LIMIT 1;`);

            if (!lastRecord.data || lastRecord.data.length === 0) {
              crudResultsDiv.innerHTML = '';
              crudResultsDiv.appendChild(
                UIComponents.createInfoBox('No records to delete', 'info')
              );
              UIComponents.showToast('Table is empty', 'warning');
              return;
            }

            const record = lastRecord.data[0];
            const recordId = record.id;

            // Show record details being deleted
            const recordSummary = Object.entries(record)
              .slice(0, 3)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ');

            const deleteQuery = `DELETE FROM ${tableName} WHERE id = ${recordId};`;
            const response = await apiClient.executeDML(deleteQuery);

            crudResultsDiv.innerHTML = '';
            crudResultsDiv.appendChild(
              UIComponents.createInfoBox(
                `✅ Deleted record #${recordId} successfully\n${recordSummary}\n${response.rowsAffected} row(s) deleted`,
                'success'
              )
            );
            UIComponents.showToast(`Record #${recordId} deleted`, 'success');
          } catch (error) {
            crudResultsDiv.innerHTML = '';
            crudResultsDiv.appendChild(
              UIComponents.createInfoBox(`❌ Error: ${error.message}`, 'error')
            );
            UIComponents.showToast('Failed to delete record', 'error');
          }
        });
      } else {
        console.warn('⚠️ crudDeleteBtn not found');
      }

      console.log('✅ All CRUD event listeners attached successfully');
    }, 100);
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
    const container = UIComponents.createTableForm();
    const recordForm = document.getElementById('recordForm');
    recordForm.innerHTML = '';
    recordForm.appendChild(container);

    // Add column button
    setTimeout(() => {
      const addColumnBtn = document.getElementById('addColumnBtn');
      if (addColumnBtn) {
        addColumnBtn.addEventListener('click', () => {
          UIComponents.addColumnRow();
        });
      }
    }, 0);

    // Cancel buttons
    setTimeout(() => {
      const cancelBtn = document.getElementById('cancelCreateTableBtn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          UIComponents.hideModal();
        });
      }

      const cancelDDLBtn = document.getElementById('cancelDDLBtn');
      if (cancelDDLBtn) {
        cancelDDLBtn.addEventListener('click', () => {
          UIComponents.hideModal();
        });
      }
    }, 0);

    // Form submission (Form tab)
    setTimeout(() => {
      const form = document.getElementById('createTableForm');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.handleCreateTable();
        });
      }
    }, 0);

    // Form submission (DDL tab)
    setTimeout(() => {
      const ddlForm = document.getElementById('createTableDDLForm');
      if (ddlForm) {
        ddlForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.handleCreateTableDDL();
        });
      }
    }, 0);
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
   * Handle DDL execution
   */
  async handleCreateTableDDL() {
    const ddlQuery = document.getElementById('ddlQuery').value.trim();

    if (!ddlQuery) {
      UIComponents.showToast('DDL query is required', 'warning');
      return;
    }

    try {
      const response = await apiClient.executeDDL(ddlQuery);
      UIComponents.showToast('DDL executed successfully!', 'success');
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
