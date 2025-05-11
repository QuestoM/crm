// build/auth.js

(function() {
    const supabaseUrl = 'https://rhpntgjnzhtxswanibep.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocG50Z2puemh0eHN3YW5pYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDUwMDEsImV4cCI6MjA1OTA4MTAwMX0.GQ5JrsjWIMrg0atDiMFz6NCWH7lDT-AJd3lTNCVZq7Y';

    let supabaseClient = null;
    let currentUser = null;
    let currentSession = null;

    // --- Initialization ---
    function initializeSupabase() {
        try {
            if (window.supabase && typeof window.supabase.createClient === 'function') {
                supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
                    auth: {
                        // Supabase JS v2 automatically persists sessions in localStorage
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true // Useful for OAuth and password resets
                    }
                });
                console.log('Auth Client: Supabase client initialized.');

                // Listen for auth state changes
                supabaseClient.auth.onAuthStateChange((event, session) => {
                    console.log('Auth State Change:', event, session);
                    currentSession = session;
                    currentUser = session?.user || null;

                    // Optional: Dispatch a custom event for other parts of the app to react
                    window.dispatchEvent(new CustomEvent('auth-state-change', { detail: { session, user: currentUser } }));

                    // If the session is explicitly signed out, redirect to login
                    if (event === 'SIGNED_OUT') {
                       redirectToLogin();
                    }
                });

                // Return the client for immediate use if needed elsewhere
                return supabaseClient;

            } else {
                console.error('Auth Client: Supabase SDK not loaded correctly.');
                return null;
            }
        } catch (error) {
            console.error('Auth Client: Error initializing Supabase:', error);
            return null;
        }
    }

    // --- Core Auth Functions ---

    async function signIn(email, password) {
        if (!supabaseClient) {
            console.error('Auth Client: Supabase not initialized for sign in.');
            return { data: null, error: new Error("Auth client not ready.") };
        }
        // Use signInWithPassword for email/password login
        return await supabaseClient.auth.signInWithPassword({ email, password });
         // Supabase JS v2 returns { data: { user, session }, error }
    }

    async function signOut() {
        if (!supabaseClient) {
            console.error('Auth Client: Supabase not initialized for sign out.');
            return { error: new Error("Auth client not ready.") };
        }
        const { error } = await supabaseClient.auth.signOut();
        if (!error) {
           console.log("Signed out successfully.");
           // onAuthStateChange listener will handle redirect via SIGNED_OUT event
        } else {
           console.error("Sign out error:", error);
        }
        return { error };
    }

    async function getCurrentUser() {
        if (!supabaseClient) {
            console.warn('Auth Client: Supabase not initialized for getCurrentUser. Trying to initialize...');
             initializeSupabase(); // Attempt initialization
             if (!supabaseClient) return null; // Still failed
        }

        // First check the immediate state
         if (currentUser) return currentUser;

         // If not set, try fetching from Supabase (handles page refresh)
        try {
             const { data: { user }, error } = await supabaseClient.auth.getUser();
             if (error) {
                 // Don't log "No session" as an error, it's expected if not logged in
                 if (error.message !== 'No session found') {
                     console.warn("Auth Client: Error fetching current user:", error.message);
                 }
                 return null;
             }
             currentUser = user; // Cache the user
             return user;
        } catch (e) {
             console.error("Auth Client: Exception fetching current user:", e);
             return null;
        }
    }

    async function getSession() {
        if (!supabaseClient) {
            console.warn('Auth Client: Supabase not initialized for getSession.');
            return null;
        }
        // Prefer the cached session from onAuthStateChange if available
        if (currentSession) return currentSession;

        // Fetch if not cached (e.g., on initial load before listener fires)
        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error) {
                 console.warn("Auth Client: Error fetching session:", error.message);
                 return null;
             }
             currentSession = session; // Cache session
             return session;
        } catch (e) {
             console.error("Auth Client: Exception fetching session:", e);
             return null;
        }
    }

     // --- Redirection ---
     function redirectToLogin() {
         // Avoid redirect loops if already on login page
         if (!window.location.pathname.endsWith('login.html')) {
             console.log('Redirecting to login page...');
             window.location.href = './login.html';
         }
     }

    // --- Expose Public Methods ---
    window.authClient = {
        initializeSupabase,
        signIn,
        signOut,
        getCurrentUser,
        getSession,
        redirectToLogin,
        // Expose the raw client if needed, but use specific functions preferably
        getSupabaseClient: () => supabaseClient
    };

    // --- Initial Check ---
    // Initialize immediately
    initializeSupabase();

    // Perform an initial session check (async) after initialization
    // This is important for redirecting on page load if not authenticated
    getSession().then(session => {
        if (!session) {
            console.log("No active session found on initial load.");
            redirectToLogin();
        } else {
             console.log("Active session found on initial load.");
             // You could potentially trigger an initial data load here if needed
             // But index.html will also do its own checks
        }
    });

})();