// Helper functions for the CRM system

// Get color for status badges
var getStatusColor = function(status) { 
    if (!status) return "yellow";
    
    status = status.toLowerCase();
    
    if (status === "active" || status === "פעיל" || 
        status === "new" || status === "חדש" ||
        status === "converted" || status === "הומר ללקוח") {
        return "green";
    }
    
    if (status === "contacted" || status === "נוצר קשר" || 
        status === "qualified" || status === "מוכשר" ||
        status === "nurturing" || status === "בטיפול") {
        return "blue";
    }
    
    if (status === "inactive" || status === "לא פעיל" ||
        status === "closed" || status === "סגור" ||
        status === "not_interested" || status === "לא מעוניין") {
        return "red";
    }
    
    return "yellow";
};

// Format Hebrew date
var formatDate = function(dateString) {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
};

// Format lead source to Hebrew
var formatLeadSource = function(source) {
    if (!source) return "";
    
    switch (source) {
        case 'website': return 'אתר אינטרנט';
        case 'facebook': return 'פייסבוק';
        case 'referral': return 'הפניה';
        case 'phone': return 'שיחת טלפון';
        case 'instagram': return 'אינסטגרם';
        case 'trade_show': return 'תערוכה';
        case 'newspaper': return 'עיתון';
        default: return source;
    }
};

// Get activity icon
var getActivityIcon = function(type) {
    switch (type) {
        case 'lead': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
        case 'customer': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
        case 'order': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>';
        case 'service': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>';
        default: return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>';
    }
};

// Get time ago in words
var getTimeAgo = function(dateString) {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Convert to seconds
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
        return "לפני פחות מדקה";
    }
    
    // Convert to minutes
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 60) {
        return "לפני " + minutes + " דקות";
    }
    
    // Convert to hours
    const hours = Math.floor(minutes / 60);
    
    if (hours < 24) {
        return "לפני " + hours + " שעות";
    }
    
    // Convert to days
    const days = Math.floor(hours / 24);
    
    if (days < 30) {
        return "לפני " + days + " ימים";
    }
    
    // Convert to months
    const months = Math.floor(days / 30);
    
    if (months < 12) {
        return "לפני " + months + " חודשים";
    }
    
    // Convert to years
    const years = Math.floor(months / 12);
    
    return "לפני " + years + " שנים";
};
