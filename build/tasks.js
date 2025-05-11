// build/tasks.js - גרסה מתוקנת v3

// הסרת הצהרות const כפולות. מניחים שהפונקציות זמינות גלובלית.
// const openModal = window.openModal;
// const closeCurrentModal = window.closeCurrentModal;
// const showToast = window.showToast;
// const supabaseClient = window.supabaseClient; 

// פונקציית-תחליף פשוטה למקרה שהפונקציה המקורית לא נטענה
// const handleMentions = window.handleMentions || function(textArea, container, searchFn, onSelectFn, onRemoveFn) {
//   console.log("Mention handling default placeholder used.");
// };

// Helper function to format dates
function formatDateDisplay(dateString) {
  if (!dateString) return "-";
  try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
      return dateString;
  }
}

const importanceMap = { 1: 'low', 2: 'medium', 3: 'high' };
const importanceTextMap = { low: 'נמוכה', medium: 'בינונית', high: 'גבוהה' };
const reverseImportanceMap = { 'low': 1, 'medium': 2, 'high': 3 };
const urgencyMap = { 1: 'low', 2: 'medium', 3: 'high' };
const urgencyTextMap = { low: 'נמוכה', medium: 'בינונית',   high: 'גבוהה' };
const reverseUrgencyMap = { 'low': 1, 'medium': 2, 'high': 3 }; 

const tasksModule = {
currentMentions: [],
// הוספת התייחסות פנימית ל-supabaseClient
_supabaseClient: null,
// Add searchTerm property to store the current search term
searchTerm: '',

// פונקציה לקבלת ה-client, מנסה להשיג מ-window אם קיים
getSupabaseClient() {
  // אם כבר יש לנו client, נחזיר אותו
  if (this._supabaseClient) return this._supabaseClient;
  
  // בדוק אם קיים supabaseClient בחלון
  if (window.supabaseClient) {
    this._supabaseClient = window.supabaseClient;
    return this._supabaseClient;
  }
  
  // בדוק אם קיים authClient שמכיל אותו
  if (window.authClient && typeof window.authClient.getSupabaseClient === 'function') {
    this._supabaseClient = window.authClient.getSupabaseClient();
    if (this._supabaseClient) return this._supabaseClient;
  }
  
  console.error("No Supabase client available anywhere");
  return null;
},

async initializeTasks() {
  console.log("Initializing Tasks Page...");
  
  // נסה להשיג את ה-supabaseClient
  const supabaseClient = this.getSupabaseClient();
  if (!supabaseClient) { 
      console.error("Supabase client is not available anywhere. Task module cannot function.");
      const container = document.getElementById('tasks-container');
      if (container) {
        container.innerHTML = '<p style="color: red; text-align: center;">שגיאה קריטית: מודול Supabase לא אותר. ודא שהחיבור לשרת תקין.</p>';
      }
      if(window.showToast) window.showToast("שגיאה קריטית: Supabase לא אותר.", "error");
      return;
  }
  
  // Check authentication first
  const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
  
  if (sessionError || !session || !session.user) {
    console.error("User not authenticated:", sessionError || "No session found");
    const container = document.getElementById('tasks-container');
    if (container) {
      container.innerHTML = `
        <div class="text-center p-6">
          <p class="text-red-600 mb-4">עליך להתחבר תחילה כדי לצפות ולנהל משימות</p>
          <button id="login-redirect-btn" class="button button-primary">התחבר למערכת</button>
        </div>
      `;
      document.getElementById('login-redirect-btn')?.addEventListener('click', () => {
        window.location.href = './login.html?redirect=' + encodeURIComponent(window.location.pathname);
      });
    }
    return;
  }
  
  console.log("User authenticated:", session.user.id);
  
  const container = document.getElementById('tasks-container');
  if (!container) {
    console.error("Tasks container not found!");
    return;
  }

  container.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold">רשימת משימות</h3>
      <button id="add-task-btn" class="button button-primary">הוסף משימה חדשה</button>
    </div>
    <div id="task-list-area" class="space-y-3">
      <div class="loading"><div class="spinner"></div></div>
    </div>
  `;

  document.getElementById('add-task-btn')?.addEventListener('click', () => {
      // גישה ישירה לפונקציה הגלובלית
      if (!window.openModal) { 
           console.error("openModal function is not available on window object.");
           if(window.showToast) window.showToast("שגיאה בפתיחת מודאל.", "error");
           return;
      }
    this.openCreateTaskModal();
  });

  // Set up search input listener
  this.setupSearchListener();
  
  this.renderTasksList();
},

// Add function to set up the search listener
setupSearchListener() {
  const searchInput = document.getElementById('tasks-search');
  if (searchInput) {
    searchInput.addEventListener('input', this.debounce(() => {
      this.searchTerm = searchInput.value.trim().toLowerCase();
      this.renderTasksList();
    }, 500));
  } else {
    console.warn("Tasks search input not found");
  }
},

// Add debounce utility function
debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
},

async fetchTasks() {
  try {
    const supabaseClient = this.getSupabaseClient();
    if (!supabaseClient) throw new Error("Supabase client not available");
    
    const { data, error } = await supabaseClient
      .from('user_tasks_view') 
      .select(`
        id, 
        title, 
        description, 
        status, 
        priority_level, 
        urgency_level,  
        due_date, 
        assignee_name, 
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) throw error; 

     const mappedData = data?.map(task => ({
        ...task, 
        priority: importanceMap[task.priority_level] || 'medium', 
        urgency: urgencyMap[task.urgency_level] || 'medium'  
    })) || [];

    return { data: mappedData, error: null };

  } catch (err) {
    console.error("Error fetching tasks:", err);
    if(window.showToast) window.showToast("שגיאה בטעינת משימות: " + err.message, "error");
    return { data: null, error: err };
  }
},

async renderTasksList() {
  const listArea = document.getElementById('task-list-area');
  if (!listArea) return;
  listArea.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

  const { data: tasks, error } = await this.fetchTasks();

  if (error) { 
    listArea.innerHTML = `<p style="color: red; text-align: center;">שגיאה בטעינת רשימת המשימות.</p>`;
    return;
  }

  if (!tasks || tasks.length === 0) {
    listArea.innerHTML = `<p style="text-align: center; color: #6b7280; padding: 2rem 0;">אין משימות להצגה.</p>`;
    return;
  }

  // Filter tasks if search term is present
  let filteredTasks = tasks;
  if (this.searchTerm) {
    filteredTasks = tasks.filter(task => {
      const titleMatch = task.title?.toLowerCase().includes(this.searchTerm);
      const descMatch = task.description?.toLowerCase().includes(this.searchTerm);
      const assigneeMatch = task.assignee_name?.toLowerCase().includes(this.searchTerm);
      return titleMatch || descMatch || assigneeMatch;
    });
  }

  // Sort tasks: open first, then closed, then by creation date descending
  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.status === 'open' && b.status !== 'open') return -1;
    if (a.status !== 'open' && b.status === 'open') return 1;
    // If statuses are the same, sort by created_at descending
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (sortedTasks.length === 0) {
    listArea.innerHTML = `<p style="text-align: center; color: #6b7280; padding: 2rem 0;">לא נמצאו משימות התואמות את החיפוש.</p>`;
    return;
  }

  listArea.innerHTML = sortedTasks.map(task => this.createTaskListItem(task)).join('');

  listArea.querySelectorAll('.task-list-item').forEach(item => {
    item.addEventListener('click', (event) => {
      // Prevent triggering edit when clicking on interactive elements inside the item if needed
      // if (event.target.closest('button, a')) return;
      
      const taskId = item.getAttribute('data-task-id');
      if (taskId) {
        console.log("Opening task details for:", taskId);
        this.openViewTaskModal(taskId); // Call the new function
      } else {
        console.error("Task ID not found on clicked item");
      }
    });
  });
},

createTaskListItem(task) { 
  // Use importanceMap and urgencyMap for mapping numeric levels to keys
  const importanceKey = importanceMap[task.priority_level] || 'medium';
  const urgencyKey = urgencyMap[task.urgency_level] || 'medium'; // Default to medium if level is unexpected
  
  // Use text maps for display
  const importanceText = importanceTextMap[importanceKey];
  const urgencyText = urgencyTextMap[urgencyKey];

  const importanceColors = { low: 'bg-blue-100 text-blue-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-red-100 text-red-800' };
  const urgencyColors = { low: 'bg-gray-100 text-gray-800', medium: 'bg-orange-100 text-orange-800', high: 'bg-pink-100 text-pink-800' }; // Adjusted colors slightly
  const statusColors = { open: 'bg-green-100 text-green-800', closed: 'bg-gray-300 text-gray-600', default: 'bg-gray-100 text-gray-800' };
  
  const statusText = task.status === 'closed' ? 'סגור' : 'פתוח';
  const statusColor = statusColors[task.status || 'default'] || statusColors.default;
  const importanceColor = importanceColors[importanceKey];
  const urgencyColor = urgencyColors[urgencyKey];

  return `
    <div class="task-list-item bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow duration-150" data-task-id="${task.id}">
      <div class="flex justify-between items-start mb-2">
        <span class="font-semibold text-gray-800">${task.title || 'ללא כותרת'}</span>
        <span class="text-xs px-2 py-0.5 rounded-full ${statusColor}">${statusText}</span>
      </div>
      <p class="text-sm text-gray-600 mb-3 break-words">${task.description || 'אין תיאור'}</p> 
      <div class="flex flex-wrap justify-between items-center text-xs text-gray-500 gap-2">
        <div class="flex flex-wrap gap-x-2 gap-y-1">
          <span>תאריך יעד: ${formatDateDisplay(task.due_date)}</span>
          ${task.assignee_name ? `<span>משויך: ${task.assignee_name}</span>` : ''}
        </div>
        <div class="flex flex-wrap gap-1">
          <span class="inline-block px-2 py-0.5 rounded-full ${importanceColor}" title="חשיבות">ח: ${importanceText}</span>
          <span class="inline-block px-2 py-0.5 rounded-full ${urgencyColor}" title="דחיפות">ד: ${urgencyText}</span>
        </div>
      </div>
    </div>
  `;
},

openCreateTaskModal() {
  this.currentMentions = [];
  const formContent = this.createTaskForm();

  window.openModal({ // שימוש ב-window.openModal
    modalId: 'create-task',
    title: 'יצירת משימה חדשה',
    contentElement: formContent,
    sizeClass: 'modal-md',
    footerActionsHTML: '<button id="save-task-btn" class="button button-primary">שמור משימה</button>',
    onLoad: (modalBody, relatedData, modalRef) => { 
      const saveBtn = modalRef?.footerActionsElement?.querySelector('#save-task-btn'); 
      if (saveBtn) {
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        newSaveBtn.addEventListener('click', async () => {
          const taskData = this.getTaskDataFromForm(modalBody); 
          if (taskData) {
            newSaveBtn.textContent = 'שומר...';
            newSaveBtn.disabled = true;
            const { error } = await this.createTask(taskData);
            newSaveBtn.textContent = 'שמור משימה';
            newSaveBtn.disabled = false;
            if (!error) {
              if(window.closeCurrentModal) window.closeCurrentModal(); // שימוש ב-window
              if(window.showToast) window.showToast("משימה נוצרה בהצלחה!", "success"); // שימוש ב-window
              this.renderTasksList();
            } else {
              if(window.showToast) window.showToast(`שגיאה ביצירת משימה: ${error.message}`, "error"); // שימוש ב-window
            }
          }
        });
      } else {
        console.error("Save button not found using modalRef.");
      }
    }
  });
},

createTaskForm() {
  const formContainer = document.createElement('div');
  formContainer.innerHTML = `
    <form id="new-task-form" class="space-y-4">
      <div>
        <label for="task-title" class="block text-sm font-medium text-gray-700">כותרת:</label>
        <input type="text" id="task-title" name="title" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
      </div>
      <div>
        <label for="task-description" class="block text-sm font-medium text-gray-700">תיאור (תייג עם @):</label>
        <div class="relative">
           <textarea id="task-description" name="description" rows="4" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
           <div id="mention-dropdown-container" class="absolute z-10 w-full" style="display: none;"></div>
        </div>
      </div>
       <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div>
            <label for="task-importance" class="block text-sm font-medium text-gray-700">חשיבות:</label>
            <select id="task-importance" name="importance" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="low">נמוכה</option>
              <option value="medium" selected>בינונית</option> 
              <option value="high">גבוהה</option>
            </select>
         </div>
         <div>
            <label for="task-urgency" class="block text-sm font-medium text-gray-700">דחיפות:</label>
            <select id="task-urgency" name="urgency" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="low">נמוכה</option>
              <option value="medium" selected>בינונית</option>
              <option value="high">גבוהה</option>
            </select>
          </div>
         <div>
            <label for="task-due-date" class="block text-sm font-medium text-gray-700">תאריך יעד:</label>
            <input type="date" id="task-due-date" name="due_date" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
       </div>
       <input type="hidden" id="task-mentions-data" name="mentions_json" value="[]"> 
    </form>
  `;

  const descriptionField = formContainer.querySelector('#task-description');
  const mentionDropdownContainer = formContainer.querySelector('#mention-dropdown-container');
  const mentionsDataInput = formContainer.querySelector('#task-mentions-data');

  if (descriptionField && mentionDropdownContainer && mentionsDataInput) {
    try {
      if (typeof this.handleMentions === 'function') {
        this.handleMentions.bind(this)(
          descriptionField,
          mentionDropdownContainer,
          this.searchMentions.bind(this),
          (mention) => {
            console.log("Mention selected:", mention);
            if (!this.currentMentions.some(m => m.id === mention.id && m.type === mention.type)) {
              this.currentMentions.push(mention);
              mentionsDataInput.value = JSON.stringify(this.currentMentions);
            }
          },
          (mention) => {
            console.log("Mention removed:", mention);
            this.currentMentions = this.currentMentions.filter(m => !(m.id === mention.id && m.type === mention.type));
            mentionsDataInput.value = JSON.stringify(this.currentMentions);
          }
        );
      } else {
        console.warn("tasksModule.handleMentions function not available");
      }
    } catch (err) {
      console.error("Error initializing mentions:", err);
    }
  } else {
    console.error("Could not find elements for mention handling in task form.");
  }

  return formContainer;
},

getTaskDataFromForm(formElement) {
  const titleInput = formElement.querySelector('#task-title');
  const descriptionInput = formElement.querySelector('#task-description');
  const importanceSelect = formElement.querySelector('#task-importance');
  const urgencySelect = formElement.querySelector('#task-urgency');
  const dueDateInput = formElement.querySelector('#task-due-date');

  if (!titleInput || !descriptionInput || !importanceSelect || !urgencySelect || !dueDateInput) {
    console.error("Could not find all task form elements");
    if(window.showToast) window.showToast("שגיאה באיסוף נתונים מהטופס", "error");
    return null;
  }

  const title = titleInput.value.trim();
  if (!title) {
    if(window.showToast) window.showToast("כותרת המשימה היא שדה חובה", "warning");
    titleInput.focus();
    return null;
  }
  
  const importanceText = importanceSelect.value;
  const urgencyText = urgencySelect.value;
  const importanceLevel = reverseImportanceMap[importanceText] || 2; 
  const urgencyLevel = reverseUrgencyMap[urgencyText] || 2;

  return {
    title: title,
    description: descriptionInput.value.trim() || null,
    priority_level: importanceLevel, 
    urgency_level: urgencyLevel,   
    assigned_to: null,
    due_date: dueDateInput.value || null,
    mentions: this.currentMentions.map(m => ({ entity_id: m.id, entity_type: m.type })) 
  };
},

async createTask(task) {
  console.log("Creating task for RPC:", task);
  try {
    const supabaseClient = this.getSupabaseClient();
    if (!supabaseClient) throw new Error("Supabase client not available");
    
    // Get current user session to verify authentication
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError) {
      console.error("Authentication session error:", sessionError);
      throw new Error("Could not verify authentication: " + sessionError.message);
    }
    
    if (!session || !session.user) {
      console.error("No authenticated user found");
      throw new Error("You must be logged in to create tasks");
    }
    
    const userId = session.user.id;
    console.log("Creating task as user:", userId);
    
    // Check if user exists in users table
    const { data: existingUser, error: userCheckError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error("Error checking user:", userCheckError);
      throw new Error("Error verifying user account: " + userCheckError.message);
    }
    
    // If user doesn't exist in the users table, create a record
    if (!existingUser) {
      console.log("User not found in users table. Creating record.");
      const email = session.user.email || 'unknown@example.com';
      const { error: createUserError } = await supabaseClient
        .from('users')
        .insert({
          id: userId,
          email: email,
          first_name: email.split('@')[0],
          last_name: '',
          role: 'user',
          active: true
        });
        
      if (createUserError) {
        console.error("Failed to create user record:", createUserError);
        throw new Error("Failed to create user record: " + createUserError.message);
      }
      console.log("Created user record for:", userId);
    }
    
    // First insert the task
    const { data: taskData, error: taskError } = await supabaseClient
      .from('user_tasks')
      .insert({
        title: task.title,
        description: task.description,
        priority_level: task.priority_level,
        urgency_level: task.urgency_level,
        due_date: task.due_date,
        status: 'open',
        created_by: userId,
        assigned_to: null
      })
      .select('id')
      .single();
    
    if (taskError) {
      console.error("Error creating task:", taskError);
      throw taskError;
    }
    
    // If there are mentions, insert them
    if (task.mentions && task.mentions.length > 0) {
      const mentionsToInsert = task.mentions.map(mention => ({
        task_id: taskData.id,
        entity_id: mention.entity_id,
        entity_type: mention.entity_type,
        created_by: userId
      }));
      
      const { error: mentionsError } = await supabaseClient
        .from('task_mentions')
        .insert(mentionsToInsert);
      
      if (mentionsError) {
        console.warn("Error adding mentions:", mentionsError);
        // We don't throw here, as the task was created successfully
      }
    }
    
    return { data: taskData, error: null };
    
  } catch (err) {
    console.error("Exception in createTask:", err);
    return { data: null, error: err };
  }
},

async searchMentions(query) {
  // Add detailed logging here
  console.log(`searchMentions: Searching for '${query}'`);
  if (query === undefined || query === null) {
    console.warn("searchMentions: Received undefined or null query. Defaulting to empty string.");
    query = ''; // Ensure query is at least an empty string
  }
  
  try {
    const supabaseClient = this.getSupabaseClient();
    if (!supabaseClient) throw new Error("Supabase client not available for mention search");
    
    console.log("searchMentions: Calling RPC 'search_mention_entities'...");
    const { data, error } = await supabaseClient.rpc('search_mention_entities', {
      search_term: query
    });

    if (error) {
      // Log the specific RPC error
      console.error("searchMentions: RPC error:", error);
      // Optionally re-throw or return empty based on desired behavior
      // throw error; // Re-throwing might stop the mention feature entirely on error
      return []; // Return empty array on error to allow typing to continue
    }
    
    // Log the successful result data
    console.log("searchMentions: RPC success, data:", data);
    
    // Map the data as before
    return (data || []).map(item => ({
      id: item.entity_id, 
      type: item.entity_type,
      name: item.entity_name
    }));
  } catch (rpcError) {
    // Log any other exceptions during the process
    console.error("searchMentions: Exception during RPC call:", rpcError);
    return []; // Return empty array on exception
  }
},

async openViewTaskModal(taskId) {
  console.log(`Fetching task details for ${taskId}`);
  try {
    const supabaseClient = this.getSupabaseClient();
    if (!supabaseClient) throw new Error("Supabase client not available");
    
    // 1. Fetch task data and basic mention info
    const { data: taskData, error: taskError } = await supabaseClient
      .from('user_tasks')
      .select(`*, mentions:task_mentions(id, entity_id, entity_type)`) // Fetch only basic mention info
      .eq('id', taskId)
      .single();

    if (taskError) {
      console.error("Error fetching task details:", taskError);
      throw taskError;
    }
    
    if (!taskData) {
      throw new Error("Task not found");
    }
    
    console.log("Task data fetched:", taskData);
    const basicMentions = taskData.mentions || [];
    this.currentMentions = []; // Reset before populating

    // 2. Fetch details for each mentioned entity type
    if (basicMentions.length > 0) {
      const mentionIdsByType = basicMentions.reduce((acc, m) => {
        if (!acc[m.entity_type]) acc[m.entity_type] = [];
        acc[m.entity_type].push(m.entity_id);
        return acc;
      }, {});

      const entityDetailsPromises = [];
      const entityMap = {}; // To store fetched details by type-id

      // Create promises to fetch details for each type
      for (const type in mentionIdsByType) {
        const ids = mentionIdsByType[type];
        let query = null;
        if (type === 'user') {
          query = supabaseClient.from('users').select('id, first_name, last_name, email').in('id', ids);
        } else if (type === 'customer') {
          query = supabaseClient.from('customers').select('id, first_name, last_name').in('id', ids);
        } else if (type === 'lead') {
          query = supabaseClient.from('leads').select('id, first_name, last_name').in('id', ids);
        } else if (type === 'product') {
          query = supabaseClient.from('products').select('id, name').in('id', ids);
        } else if (type === 'order') {
          query = supabaseClient.from('orders').select('id').in('id', ids);
        }
        
        if (query) {
           entityDetailsPromises.push(
             query.then(({ data, error }) => {
                if (error) console.warn(`Error fetching ${type} details:`, error);
                else data.forEach(entity => entityMap[`${type}-${entity.id}`] = entity);
             })
           );
        }
      }

      // Wait for all detail fetches to complete
      await Promise.all(entityDetailsPromises);

      // 3. Combine basic mention info with fetched details
      this.currentMentions = basicMentions.map(m => {
         const entity = entityMap[`${m.entity_type}-${m.entity_id}`];
         let name = 'Unknown/Deleted Entity'; // Default if entity details not found
         if (entity) {
           if (m.entity_type === 'user') name = `${entity.first_name || ''} ${entity.last_name || ''}`.trim() || entity.email;
           else if (m.entity_type === 'customer') name = `${entity.first_name || ''} ${entity.last_name || ''}`.trim();
           else if (m.entity_type === 'lead') name = `${entity.first_name || ''} ${entity.last_name || ''}`.trim();
           else if (m.entity_type === 'product') name = entity.name;
           else if (m.entity_type === 'order') name = `Order #${entity.id.substring(0, 8)}...`;
         }
         return {
           id: m.entity_id,
           type: m.entity_type,
           name: name,
           mention_id: m.id // Keep the task_mentions primary key if needed later
         };
       });
    }

    console.log("Processed mentions:", this.currentMentions);

    const formContent = this.createTaskForm();

    // Populate form with task data
    formContent.querySelector('#task-title').value = taskData.title || '';
    formContent.querySelector('#task-description').value = taskData.description || '';
    formContent.querySelector('#task-importance').value = importanceMap[taskData.priority_level] || 'medium';
    formContent.querySelector('#task-urgency').value = urgencyMap[taskData.urgency_level] || 'medium';
    formContent.querySelector('#task-due-date').value = taskData.due_date ? new Date(taskData.due_date).toISOString().split('T')[0] : '';
    formContent.querySelector('#task-mentions-data').value = JSON.stringify(this.currentMentions.map(m => ({ id: m.id, type: m.type, name: m.name }))); // Save simplified version

    // Add status change buttons and update button
    const currentStatus = taskData.status || 'open';
    const footerHTML = `
      <div class="flex items-center gap-2">
        <label for="task-status-edit" class="text-sm font-medium text-gray-700">סטטוס:</label>
        <select id="task-status-edit" class="border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm">
          <option value="open" ${currentStatus === 'open' ? 'selected' : ''}>פתוח</option>
          <option value="closed" ${currentStatus === 'closed' ? 'selected' : ''}>סגור</option>
        </select>
      </div>
      <button id="update-task-btn" class="button button-primary">שמור שינויים</button>
    `;

    window.openModal({ // Use window.openModal
      modalId: 'edit-task', // Use a different ID for editing
      title: `עריכת משימה: ${taskData.title}`,
      contentElement: formContent,
      sizeClass: 'modal-md',
      footerActionsHTML: footerHTML,
      relatedData: { originalTask: taskData, originalMentions: basicMentions }, // Store original data
      onLoad: (modalBody, relatedData, modalRef) => {
        // Re-initialize mentions for the description field
        const descriptionField = modalBody.querySelector('#task-description');
        const mentionDropdownContainer = modalBody.querySelector('#mention-dropdown-container');
        const mentionsDataInput = modalBody.querySelector('#task-mentions-data');
        if (descriptionField && mentionDropdownContainer && mentionsDataInput) {
          try {
            if (typeof this.handleMentions === 'function') {
              // We pass the already processed this.currentMentions for potential pre-filling
              this.handleMentions.bind(this)(
                descriptionField,
                mentionDropdownContainer,
                this.searchMentions.bind(this),
                (mention) => { 
                  // Add to currentMentions if not already present
                  if (!this.currentMentions.some(m => m.id === mention.id && m.type === mention.type)) {
                    this.currentMentions.push(mention);
                    mentionsDataInput.value = JSON.stringify(this.currentMentions.map(m => ({ id: m.id, type: m.type, name: m.name })));
                  }
                },
                (mention) => { 
                  // Remove from currentMentions
                  this.currentMentions = this.currentMentions.filter(m => !(m.id === mention.id && m.type === mention.type));
                  mentionsDataInput.value = JSON.stringify(this.currentMentions.map(m => ({ id: m.id, type: m.type, name: m.name })));
                },
                this.currentMentions // Pass initial mentions for display
              );
            } else {
              console.warn("tasksModule.handleMentions function not available");
            }
          } catch (err) {
            console.error("Error re-initializing mentions:", err);
          }
        }

        // Setup update button click handler
        const updateBtn = modalRef?.footerActionsElement?.querySelector('#update-task-btn');
        if (updateBtn) {
          const newUpdateBtn = updateBtn.cloneNode(true);
          updateBtn.parentNode.replaceChild(newUpdateBtn, updateBtn);
          
          newUpdateBtn.addEventListener('click', async () => {
            const updatedTaskFields = this.getTaskDataFromForm(modalBody);
            // We need the full currentMentions array (with id, type) for the update function
            const updatedTaskMentions = { mentions: this.currentMentions.map(m => ({ entity_id: m.id, entity_type: m.type })) };
            
            // --- FIX: Find status select in the footer element ---
            const statusSelect = modalRef?.footerActionsElement?.querySelector('#task-status-edit');
            if (!statusSelect) {
              console.error("Could not find status select element in modal footer.");
              if(window.showToast) window.showToast("שגיאה פנימית: לא נמצא אלמנט סטטוס.", "error");
              return; 
            }
            const newStatus = statusSelect.value;
            // --- END FIX ---
            
            if (updatedTaskFields) {
              newUpdateBtn.textContent = 'מעדכן...';
              newUpdateBtn.disabled = true;
              // Pass both field data and the processed mentions array to updateTask
              const { error } = await this.updateTask(taskId, { ...updatedTaskFields, ...updatedTaskMentions }, newStatus, relatedData.originalMentions);
              newUpdateBtn.textContent = 'שמור שינויים';
              newUpdateBtn.disabled = false;
              if (!error) {
                if(window.closeCurrentModal) window.closeCurrentModal(); // Use window
                if(window.showToast) window.showToast("משימה עודכנה בהצלחה!", "success"); // Use window
                this.renderTasksList(); // Refresh the list
              } else {
                if(window.showToast) window.showToast(`שגיאה בעדכון משימה: ${error.message}`, "error"); // Use window
              }
            }
          });
        } else {
          console.error("Update button not found in modal footer.");
        }
      },
      onCloseCallback: () => {
        this.currentMentions = []; // Clear mentions when modal closes
      }
    });

  } catch (err) {
    console.error("Error opening view/edit task modal:", err);
    if(window.showToast) window.showToast(`שגיאה בטעינת פרטי משימה: ${err.message}`, "error");
  }
},

async updateTask(taskId, task, newStatus, originalMentions) {
  // originalMentions is the array of {id, entity_id, entity_type} from the initial fetch
  console.log(`Updating task ${taskId} with status ${newStatus}:`, task);
  try {
    const supabaseClient = this.getSupabaseClient();
    if (!supabaseClient) throw new Error("Supabase client not available");

    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    if (!session || !session.user) throw new Error("User not authenticated for update");

    // 1. Update the main task details
    const taskUpdates = {
      title: task.title,
      description: task.description,
      priority_level: task.priority_level,
      urgency_level: task.urgency_level,
      due_date: task.due_date,
      status: newStatus,
      updated_at: new Date().toISOString(),
      completed_at: newStatus === 'closed' ? new Date().toISOString() : null
    };

    const { error: updateError } = await supabaseClient
      .from('user_tasks')
      .update(taskUpdates)
      .eq('id', taskId);

    if (updateError) {
      console.error("Error updating task:", updateError);
      throw updateError;
    }

    // 2. Handle mentions (diff and update using originalMentions)
    const currentMentionRefs = task.mentions.map(m => `${m.entity_type}-${m.entity_id}`); // Mentions currently in the modal
    const originalMentionRefs = (originalMentions || []).map(m => `${m.entity_type}-${m.entity_id}`); // Mentions originally loaded
    
    const mentionsToDelete = (originalMentions || []).filter(m => !currentMentionRefs.includes(`${m.entity_type}-${m.entity_id}`)).map(m => m.id);
    const mentionsToAdd = task.mentions.filter(m => !originalMentionRefs.includes(`${m.entity_type}-${m.entity_id}`)).map(mention => ({
      task_id: taskId,
      entity_id: mention.entity_id,
      entity_type: mention.entity_type,
      created_by: session.user.id
    }));

    // Perform deletions
    if (mentionsToDelete.length > 0) {
      const { error: deleteError } = await supabaseClient
        .from('task_mentions')
        .delete()
        .in('id', mentionsToDelete);
      if (deleteError) console.warn("Error deleting mentions:", deleteError);
    }

    // Perform insertions
    if (mentionsToAdd.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('task_mentions')
        .insert(mentionsToAdd);
      if (insertError) console.warn("Error adding new mentions:", insertError);
    }
    
    console.log(`Task ${taskId} updated successfully.`);
    return { error: null };

  } catch (err) {
    console.error(`Exception in updateTask for ${taskId}:`, err);
    return { error: err };
  }
},

// --- New Mention Handling Implementation ---
handleMentions(textArea, dropdownContainer, searchFn, onSelectFn, onRemoveFn, initialMentions = []) {
  console.log("handleMentions: Initializing for textarea:", textArea, "Dropdown container:", dropdownContainer); // Log initialization
  if (!textArea || !dropdownContainer) {
    console.error("handleMentions: Textarea or dropdown container is missing!");
    return;
  }
  
  let currentSearchTerm = null;
  let activeIndex = -1;
  let mentionStartIndex = -1;
  let currentResults = [];
  let debounceTimeout = null;
  let skipInputEvent = false; // Flag to prevent infinite loop on selection

  // --- Helper Function to get Cursor Coordinates ---
  function getCursorXY(textarea, position) {
    const properties = [
      'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily',
      'textAlign', 'textTransform', 'textIndent', 'textDecoration',
      'letterSpacing', 'wordSpacing', 'tabSize', 'MozTabSize'
    ];

    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

    // Create a mirror div
    const div = document.createElement('div');
    div.id = 'input-textarea-caret-position-mirror-div';
    document.body.appendChild(div);

    const style = div.style;
    const computed = window.getComputedStyle(textarea);

    // Default wrapping styles
    style.whiteSpace = 'pre-wrap';
    style.wordWrap = 'break-word';

    // Position off-screen
    style.position = 'absolute'; // Required to return coordinates properly
    style.visibility = 'hidden'; // Prevent flash render

    // Transfer the relevant styles from textarea to the div
    properties.forEach(prop => {
      style[prop] = computed[prop];
    });

    if (isFirefox) {
      // Firefox lies about paddingRequired for scrolling:
      // https://bugzilla.mozilla.org/show_bug.cgi?id=757866
      if (textarea.scrollHeight > parseInt(computed.height)) style.overflowY = 'scroll';
    } else {
      style.overflow = 'hidden'; // For Chrome to not render a scrollbar;
    }

    div.textContent = textarea.value.substring(0, position);
    // The following line moves the focus position to the end of the text
    const span = document.createElement('span');
    // Wrapping must be replicated *exactly*, including texts, spaces, and line breaks
    span.textContent = textarea.value.substring(position) || '.'; // Need a non-empty span to get position
    div.appendChild(span);

    const coordinates = {
      top: span.offsetTop + parseInt(computed.borderTopWidth),
      left: span.offsetLeft + parseInt(computed.borderLeftWidth),
      // Add height for positioning below the line
      height: parseInt(computed.lineHeight) || parseInt(computed.fontSize)
    };

    // Remove the mirror div
    document.body.removeChild(div);
    
    return coordinates;
  }
  // --- End Helper Function ---

  // --- Dropdown UI Functions ---
  function showDropdown() {
    if (!dropdownContainer || !textArea) return;
    
    dropdownContainer.style.display = 'block';
    // Styling updates
    dropdownContainer.style.position = 'absolute'; 
    dropdownContainer.style.backgroundColor = 'white';
    dropdownContainer.style.border = '1px solid #eee';
    dropdownContainer.style.borderRadius = '2px'; 
    dropdownContainer.style.maxHeight = '100px';
    dropdownContainer.style.overflowY = 'auto';
    dropdownContainer.style.zIndex = '100';
    dropdownContainer.style.minWidth = 'auto';
    dropdownContainer.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
    const taWidth = textArea.offsetWidth;
    dropdownContainer.style.maxWidth = `${Math.max(90, taWidth * 0.4)}px`;
    
    // Reset transform before calculating position
    dropdownContainer.style.transform = '';

    // --- Calculate Position near cursor (RTL revised) ---
    try {
      const cursorPos = textArea.selectionStart;
      const calculationPos = mentionStartIndex > -1 ? mentionStartIndex : cursorPos;
      console.log(`handleMentions: Calculating position based on index: ${calculationPos}`); // Log position index
      
      const coords = getCursorXY(textArea, calculationPos);
      const taRect = textArea.getBoundingClientRect();
      const offsetParentRect = dropdownContainer.offsetParent ? dropdownContainer.offsetParent.getBoundingClientRect() : { top: 0, left: 0 };

      let top = coords.top + (coords.height || 16) - (taRect.top - offsetParentRect.top) - textArea.scrollTop;
      let cursorEffectiveLeft = coords.left - (taRect.left - offsetParentRect.left) - textArea.scrollLeft;

      // Get dropdown dimensions AFTER content/styles are potentially set
      // We might need to estimate or measure differently if content changes width drastically
      const dropdownWidth = dropdownContainer.offsetWidth;
      const dropdownHeight = dropdownContainer.offsetHeight; 

      // --- RTL Positioning using Transform --- 
      // Position the LEFT edge at the cursor's effective left
      let left = cursorEffectiveLeft;
      // Use transform to shift it left by its own width
      dropdownContainer.style.transform = 'translateX(-100%)';
      // Add a small offset so it doesn't perfectly overlap the cursor
      left -= 5; 
      // --- End RTL Positioning ---

      // Boundary checks (Simplified for transform approach)
      if (left - dropdownWidth < 0) { 
          // If shifting left goes off-screen, revert to placing right of cursor
          left = cursorEffectiveLeft + 5; 
          dropdownContainer.style.transform = ''; // Reset transform
      }
      
      const parentWidth = dropdownContainer.offsetParent ? dropdownContainer.offsetParent.clientWidth : window.innerWidth;
      // Check if the *original* left position (cursor) plus dropdown width exceeds parent
      // This check might need refinement based on transform behavior
      if (cursorEffectiveLeft > parentWidth) {
         left = parentWidth - dropdownWidth - 5;
         dropdownContainer.style.transform = ''; // Reset transform if we override position drastically
      }
      
      // Bottom boundary check (same as before)
      const parentHeight = dropdownContainer.offsetParent ? dropdownContainer.offsetParent.clientHeight : window.innerHeight; 
      if (top + dropdownHeight > parentHeight) {
          top = coords.top - dropdownHeight - (taRect.top - offsetParentRect.top) - textArea.scrollTop;
      }
      
      top = Math.max(0, top); 
      left = Math.max(0, left); 

      dropdownContainer.style.top = `${top}px`; 
      dropdownContainer.style.left = `${left}px`; 
      console.log("handleMentions (RTL Transform): Positioned dropdown at", { top, left }, "Transform:", dropdownContainer.style.transform); 
    } catch (e) {
        console.error("handleMentions: Error calculating dropdown position:", e);
        // Fallback positioning
        dropdownContainer.style.transform = ''; // Reset transform in fallback
        dropdownContainer.style.top = '100%'; 
        dropdownContainer.style.left = 'auto'; 
        dropdownContainer.style.right = '0px'; 
    }
    // --- End Position Calculation ---
  }

  function hideDropdown() {
    dropdownContainer.style.display = 'none';
    currentSearchTerm = null;
    activeIndex = -1;
    currentResults = [];
  }

  function updateDropdown(results) {
    currentResults = results;
    activeIndex = -1; 
    dropdownContainer.innerHTML = '';
    if (results.length === 0) {
      // Minimal "No results"
      dropdownContainer.innerHTML = '<div style="padding: 1px 5px; color: #aaa; font-size: 0.7em;">No results</div>';
    } else {
      results.forEach((item, index) => {
        const div = document.createElement('div');
        // --- Reduce Padding & Font Size Again ---
        div.style.padding = '1px 5px'; // Minimal padding
        div.style.fontSize = '0.75em'; // Minimal font size
        // --- End Size Adjustment ---
        div.style.cursor = 'pointer';
        div.style.whiteSpace = 'nowrap';
        div.style.overflow = 'hidden';
        div.style.textOverflow = 'ellipsis';
        div.setAttribute('title', `${item.name} (${item.type})`);
        div.textContent = `${item.name} (${item.type})`;
        div.addEventListener('mouseenter', () => setActiveItem(index));
        div.addEventListener('mousedown', (e) => {
          e.preventDefault();
          selectItem(index);
        });
        dropdownContainer.appendChild(div);
      });
    }
    showDropdown();
    setActiveItem(0);
  }

  function setActiveItem(index) {
    if (index < -1 || index >= currentResults.length) return;
    
    const items = dropdownContainer.children;
    if (activeIndex >= 0 && items[activeIndex]) {
      items[activeIndex].style.backgroundColor = ''; // Remove previous highlight
    }
    activeIndex = index;
    if (activeIndex >= 0 && items[activeIndex]) {
      items[activeIndex].style.backgroundColor = '#eee'; // Add new highlight
      // Scroll into view if needed
      items[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function selectItem(index) {
    if (index < 0 || index >= currentResults.length) return;
    
    const selectedMention = currentResults[index];
    const text = textArea.value;
    const before = text.substring(0, mentionStartIndex);
    // Note: cursor position might be different from mention end, adjust if needed
    const after = text.substring(textArea.selectionStart);
    const mentionText = `@${selectedMention.name}`; // How the mention looks in text
    
    skipInputEvent = true; // Prevent input event from re-triggering search
    textArea.value = before + mentionText + ' ' + after; // Add space after mention
    
    // Move cursor after the inserted mention + space
    const newCursorPos = (before + mentionText + ' ').length;
    textArea.setSelectionRange(newCursorPos, newCursorPos);
    
    hideDropdown();
    if (typeof onSelectFn === 'function') {
      onSelectFn(selectedMention); // Notify the main module
    }
    textArea.focus();
    setTimeout(() => { skipInputEvent = false; }, 50); // Reset flag after a short delay
  }

  // --- Event Handlers ---
  textArea.addEventListener('input', async (e) => {
    if (skipInputEvent) {
      console.log("handleMentions: Skipping input event due to selection flag.");
      return;
    }
    console.log("handleMentions: Input event fired."); 
    
    const cursorPos = textArea.selectionStart;
    const textBeforeCursor = textArea.value.substring(0, cursorPos);
    console.log(`handleMentions: Text before cursor (pos ${cursorPos}): "${textBeforeCursor}"`); // Log text
    
    // --- Try a simpler regex: @ followed by non-whitespace characters ---
    const atMatch = textBeforeCursor.match(/@([^\s]*)$/);
    // const atMatch = textBeforeCursor.match(/@(\w*)$/); // Alternative: word characters only
    // --- End Regex Change ---
    
    console.log("handleMentions: Regex match result:", atMatch); // Log match result

    if (atMatch) {
      mentionStartIndex = atMatch.index; 
      const searchTerm = atMatch[1]; // Group 1 contains the text after @
      console.log(`handleMentions: Detected '@', mentionStartIndex: ${mentionStartIndex}, search term: '${searchTerm}'`); 
      
      currentSearchTerm = searchTerm;
      clearTimeout(debounceTimeout);
      console.log("handleMentions: Setting debounce timeout for search...");
      debounceTimeout = setTimeout(async () => {
         if (currentSearchTerm === searchTerm) { 
             console.log(`handleMentions: Debounce triggered, searching for: '${searchTerm}'`);
             try {
               const results = await searchFn(searchTerm);
               console.log("handleMentions: Search results:", results);
               if (currentSearchTerm === searchTerm) { 
                  updateDropdown(results);
               }
             } catch (error) {
                 console.error("handleMentions: Error during searchFn execution:", error);
                 hideDropdown();
             }
           } else {
               console.log("handleMentions: Debounce skipped, search term changed.");
           }
      }, 300); 
    } else {
      mentionStartIndex = -1; 
      console.log("handleMentions: No '@' pattern detected immediately before cursor."); // Updated log message
      hideDropdown();
    }
  });

  textArea.addEventListener('keydown', (e) => {
    if (dropdownContainer.style.display === 'block') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveItem(activeIndex < currentResults.length - 1 ? activeIndex + 1 : 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveItem(activeIndex > 0 ? activeIndex - 1 : currentResults.length - 1);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (activeIndex !== -1) {
          e.preventDefault();
          selectItem(activeIndex);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        hideDropdown();
      }
    }
  });

  textArea.addEventListener('blur', () => {
    // Delay hiding to allow click selection
    setTimeout(hideDropdown, 150);
  });

  // TODO: Handle deletion of mentions (more complex, requires tracking mention ranges)
  // For now, removing text manually will break the mention connection.
  // onRemoveFn would be called here if deletion is detected.
  
  // TODO: Pre-fill initial mentions visually (requires mapping back from data to text ranges)

},
// --- End Mention Handling ---
};

// Attach to window
if (typeof window !== 'undefined') {
window.tasksModule = tasksModule;
}