-- Synthetic data for CRM system with Hebrew names
-- First, let's insert users (staff)

-- Add status column to customers table if it doesn't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS status VARCHAR(50);

-- Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight NUMERIC(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(10) DEFAULT 'kg';
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{"length": 0, "width": 0, "height": 0, "unit": "cm"}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS model_number VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS specs JSONB;

INSERT INTO users (first_name, last_name, email, role) VALUES
('אבי', 'כהן', 'avi.cohen@company.com', 'admin'),
('שרה', 'לוי', 'sara.levi@company.com', 'sales'),
('יעקב', 'מזרחי', 'yaakov.mizrahi@company.com', 'sales'),
('רחל', 'אברהם', 'rachel.avraham@company.com', 'support'),
('משה', 'פרץ', 'moshe.peretz@company.com', 'technician'),
('דנה', 'שלום', 'dana.shalom@company.com', 'sales');

-- Products with categories
INSERT INTO products (name, sku, description, price, cost, category, warranty_months) VALUES
('מזגן אינוורטר 1 כ"ס', 'AC-INV-1', 'מזגן חסכוני באנרגיה', 2499.99, 1500.00, 'מיזוג אוויר', 36),
('מזגן אינוורטר 2 כ"ס', 'AC-INV-2', 'מזגן לחדר גדול', 3499.99, 2200.00, 'מיזוג אוויר', 36),
('מקרר 4 דלתות', 'REF-4D-1', 'מקרר משפחתי גדול', 5999.99, 3800.00, 'מקררים', 24),
('מקרר 2 דלתות', 'REF-2D-1', 'מקרר קומפקטי', 2999.99, 1800.00, 'מקררים', 24),
('מכונת כביסה 8 ק"ג', 'WASH-8KG', 'מכונת כביסה חסכונית', 1999.99, 1200.00, 'מכשירי חשמל', 24),
('מייבש כביסה', 'DRY-STD-1', 'מייבש עם חיישן לחות', 1899.99, 1100.00, 'מכשירי חשמל', 24),
('תנור אפייה משולב', 'OVEN-CMB-1', 'תנור משולב כיריים', 3499.99, 2100.00, 'מטבח', 12),
('מדיח כלים צר', 'DISH-NAR-1', 'מדיח כלים לדירה קטנה', 2299.99, 1400.00, 'מטבח', 24),
('טלוויזיה "55', 'TV-55-SMART', 'טלוויזיה חכמה רזולוציה 4K', 2999.99, 1800.00, 'בידור', 12),
('מערכת קולנוע ביתית', 'AUDIO-HT-1', 'מערכת שמע איכותית', 1499.99, 900.00, 'בידור', 12);

-- Create inventory for these products
INSERT INTO inventory (product_id, quantity, min_threshold, last_restock)
SELECT id, 
       FLOOR(RANDOM() * 50) + 10, 
       10, 
       NOW() - (RANDOM() * INTERVAL '30 days')
FROM products;

-- Create some packages
INSERT INTO packages (name, description, base_price) VALUES
('חבילת מטבח בסיסית', 'תנור ומדיח כלים', 5500.00),
('חבילת כביסה מלאה', 'מכונת כביסה ומייבש', 3699.99),
('חבילת בידור', 'טלוויזיה ומערכת שמע', 4299.99);

-- Add items to packages
INSERT INTO package_items (package_id, product_id, quantity)
SELECT 
    (SELECT id FROM packages WHERE name = 'חבילת מטבח בסיסית'),
    (SELECT id FROM products WHERE sku = 'OVEN-CMB-1'),
    1
UNION ALL
SELECT 
    (SELECT id FROM packages WHERE name = 'חבילת מטבח בסיסית'),
    (SELECT id FROM products WHERE sku = 'DISH-NAR-1'),
    1
UNION ALL
SELECT 
    (SELECT id FROM packages WHERE name = 'חבילת כביסה מלאה'),
    (SELECT id FROM products WHERE sku = 'WASH-8KG'),
    1
UNION ALL
SELECT 
    (SELECT id FROM packages WHERE name = 'חבילת כביסה מלאה'),
    (SELECT id FROM products WHERE sku = 'DRY-STD-1'),
    1
UNION ALL
SELECT 
    (SELECT id FROM packages WHERE name = 'חבילת בידור'),
    (SELECT id FROM products WHERE sku = 'TV-55-SMART'),
    1
UNION ALL
SELECT 
    (SELECT id FROM packages WHERE name = 'חבילת בידור'),
    (SELECT id FROM products WHERE sku = 'AUDIO-HT-1'),
    1;

-- Insert technicians
INSERT INTO technicians (first_name, last_name, email, phone_number, status, skills, work_schedule) VALUES
('דוד', 'אלון', 'david.alon@company.com', '052-1234567', 'active', '["מיזוג אוויר", "מקררים"]', '{"days": ["Sun", "Mon", "Tue", "Wed", "Thu"], "hours": "08:00-17:00"}'),
('יוסי', 'חיים', 'yossi.haim@company.com', '052-2345678', 'active', '["מטבח", "מכשירי חשמל"]', '{"days": ["Sun", "Mon", "Tue", "Wed", "Thu"], "hours": "08:00-17:00"}'),
('מיכל', 'דהן', 'michal.dahan@company.com', '052-3456789', 'active', '["בידור", "מטבח"]', '{"days": ["Sun", "Mon", "Wed", "Thu"], "hours": "09:00-18:00"}');

-- Insert leads with Hebrew names
INSERT INTO leads (lead_source, utm_source, utm_medium, utm_campaign, phone_number, email, first_name, last_name, status, assigned_to) VALUES
('website', 'google', 'cpc', 'summer_sale', '050-1111222', 'noa.israeli@gmail.com', 'נועה', 'ישראלי', 'new', (SELECT id FROM users WHERE email = 'sara.levi@company.com')),
('facebook', 'facebook', 'social', 'home_appliances', '050-2222333', 'yaron.ben@gmail.com', 'ירון', 'בן-ארי', 'contacted', (SELECT id FROM users WHERE email = 'yaakov.mizrahi@company.com')),
('referral', NULL, NULL, NULL, '050-3333444', 'shira.levy@gmail.com', 'שירה', 'לוי', 'qualified', (SELECT id FROM users WHERE email = 'sara.levi@company.com')),
('instagram', 'instagram', 'social', 'kitchen_promo', '050-4444555', 'tal.cohen@gmail.com', 'טל', 'כהן', 'new', NULL),
('phone', NULL, NULL, NULL, '050-5555666', 'ronen.mizrahi@gmail.com', 'רונן', 'מזרחי', 'contacted', (SELECT id FROM users WHERE email = 'yaakov.mizrahi@company.com')),
('website', 'google', 'organic', NULL, '050-6666777', 'michal.avraham@gmail.com', 'מיכל', 'אברהם', 'qualified', (SELECT id FROM users WHERE email = 'sara.levi@company.com')),
('trade_show', NULL, NULL, 'tel_aviv_expo', '050-7777888', 'uri.golan@gmail.com', 'אורי', 'גולן', 'nurturing', (SELECT id FROM users WHERE email = 'yaakov.mizrahi@company.com')),
('newspaper', NULL, 'print', 'weekend_special', '050-8888999', 'liora.dayan@gmail.com', 'ליאורה', 'דיין', 'new', NULL);

-- Add more customers directly
INSERT INTO customers (first_name, last_name, email, phone_number, address, city, status) VALUES
('יעל', 'שטרן', 'yael.stern@gmail.com', '050-9876543', 'רחוב הבנים 23', 'רעננה', 'active'),
('עמית', 'גרין', 'amit.green@gmail.com', '050-8765432', 'רחוב ביאליק 7', 'גבעתיים', 'active'),
('גיל', 'נחמיאס', 'gil.nachmias@gmail.com', '050-7654321', 'רחוב סוקולוב 34', 'הרצליה', 'inactive'),
('דנית', 'אדרי', 'danit.edry@gmail.com', '050-6543210', 'רחוב ויצמן 12', 'כפר סבא', 'active'),
('אלון', 'ברק', 'alon.barak@gmail.com', '050-5432109', 'רחוב רוטשילד 90', 'תל אביב', 'active'),
('עינב', 'מור', 'einav.mor@gmail.com', '050-4321098', 'רחוב הרצל 56', 'ראשון לציון', 'active');

-- Convert some leads to customers but keep them as leads too
INSERT INTO customers (first_name, last_name, email, phone_number, address, city, lead_id, status)
SELECT 
    l.first_name,
    l.last_name,
    l.email,
    l.phone_number,
    CASE 
        WHEN l.first_name = 'שירה' THEN 'רחוב הזית 15'
        WHEN l.first_name = 'רונן' THEN 'שדרות הרצל 78'
        WHEN l.first_name = 'מיכל' THEN 'רחוב אלנבי 45'
    END,
    CASE 
        WHEN l.first_name = 'שירה' THEN 'תל אביב'
        WHEN l.first_name = 'רונן' THEN 'ירושלים'
        WHEN l.first_name = 'מיכל' THEN 'חיפה'
    END,
    l.id,
    'active'
FROM leads l
WHERE l.first_name IN ('שירה', 'רונן', 'מיכל');

-- Update lead status but DON'T delete leads when converted
UPDATE leads 
SET status = 'converted' 
WHERE first_name IN ('שירה', 'רונן', 'מיכל');

-- Create orders for customers
DO $$
DECLARE
    customer_record RECORD;
    current_order_id UUID;
    product_id_var UUID; -- Renamed from product_id to avoid ambiguity
    package_id UUID;
    subtotal_amount NUMERIC(10, 2);
    total_amount NUMERIC(10, 2);
    random_status TEXT;
    invoice_number TEXT;
    item RECORD;
BEGIN
    FOR customer_record IN SELECT * FROM customers LOOP
        -- Random order status
        CASE floor(random() * 4)
            WHEN 0 THEN random_status := 'new';
            WHEN 1 THEN random_status := 'processing';
            WHEN 2 THEN random_status := 'completed';
            ELSE random_status := 'delivered';
        END CASE;
        
        -- Create order
        subtotal_amount := 0;
        
        INSERT INTO orders (customer_id, status, subtotal, discount, tax, total, payment_method, payment_status)
        VALUES (customer_record.id, random_status, 0, 0, 0, 0, 
                CASE WHEN random() > 0.5 THEN 'credit_card' ELSE 'bank_transfer' END,
                CASE WHEN random() > 0.3 THEN 'paid' ELSE 'pending' END)
        RETURNING id INTO current_order_id;
        
        -- Add 1-3 products to order
        FOR i IN 1..floor(random() * 3) + 1 LOOP
            -- Either add a product or a package
            IF random() > 0.7 THEN
                -- Add a package
                SELECT id INTO package_id FROM packages ORDER BY random() LIMIT 1;
                
                SELECT base_price INTO subtotal_amount FROM packages WHERE id = package_id;
                
                INSERT INTO order_items (order_id, product_id, package_id, quantity, unit_price, total_price)
                VALUES (current_order_id, NULL, package_id, 1, subtotal_amount, subtotal_amount);
                
            ELSE
                -- Add a product
                SELECT id, price INTO product_id_var, subtotal_amount FROM products ORDER BY random() LIMIT 1;
                
                INSERT INTO order_items (order_id, product_id, package_id, quantity, unit_price, total_price)
                VALUES (current_order_id, product_id_var, NULL, 1, subtotal_amount, subtotal_amount);
            END IF;
        END LOOP;
        
        -- Update order totals
        SELECT SUM(total_price) INTO subtotal_amount FROM order_items WHERE order_id = current_order_id;
        total_amount := subtotal_amount * 1.17; -- Add 17% VAT
        
        UPDATE orders SET subtotal = subtotal_amount, tax = total_amount - subtotal_amount, total = total_amount WHERE id = current_order_id;
        
        -- Create invoice if order is completed or delivered
        IF random_status IN ('completed', 'delivered') THEN
            invoice_number := 'INV-' || to_char(NOW(), 'YYYYMM') || '-' || floor(random() * 1000)::TEXT;
            
            INSERT INTO invoices (order_id, invoice_number, status, amount, due_date, paid_at)
            VALUES (current_order_id, invoice_number, 
                   CASE WHEN random() > 0.8 THEN 'unpaid' ELSE 'paid' END,
                   total_amount,
                   NOW() + (random() * 30)::INTEGER * INTERVAL '1 day',
                   CASE WHEN random() > 0.8 THEN NULL ELSE NOW() - (random() * 5)::INTEGER * INTERVAL '1 day' END);
        END IF;
        
        -- Create warranties for products in completed orders
        IF random_status IN ('completed', 'delivered') THEN
            FOR item IN SELECT * FROM order_items WHERE order_id = current_order_id AND order_items.product_id IS NOT NULL LOOP
                INSERT INTO warranties (customer_id, product_id, order_item_id, start_date, end_date, status)
                SELECT 
                    customer_record.id,
                    item.product_id,
                    item.id,
                    NOW() - (random() * 30)::INTEGER * INTERVAL '1 day',
                    NOW() - (random() * 30)::INTEGER * INTERVAL '1 day' + (p.warranty_months * INTERVAL '1 month'),
                    'active'
                FROM products p
                WHERE p.id = item.product_id;
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- Create service appointments
DO $$
DECLARE
    customer_record RECORD;
    warranty_record RECORD;
    technician_id UUID;
    service_status TEXT;
BEGIN
    FOR warranty_record IN SELECT w.*, c.id as customer_id, p.id as product_id 
                          FROM warranties w
                          JOIN customers c ON w.customer_id = c.id
                          JOIN products p ON w.product_id = p.id
                          WHERE random() > 0.7 LOOP
        
        -- Get a technician with the right skills
        SELECT t.id INTO technician_id 
        FROM technicians t, products p 
        WHERE p.id = warranty_record.product_id 
        ORDER BY random() 
        LIMIT 1;
        
        -- Random service status
        CASE floor(random() * 4)
            WHEN 0 THEN service_status := 'scheduled';
            WHEN 1 THEN service_status := 'in_progress';
            WHEN 2 THEN service_status := 'completed';
            ELSE service_status := 'cancelled';
        END CASE;
        
        -- Create appointment
        INSERT INTO service_appointments (
            customer_id, 
            technician_id, 
            product_id, 
            service_type, 
            status, 
            scheduled_at, 
            completed_at, 
            notes
        )
        VALUES (
            warranty_record.customer_id,
            technician_id,
            warranty_record.product_id,
            CASE WHEN random() > 0.5 THEN 'warranty_repair' ELSE 'maintenance' END,
            service_status,
            NOW() + (random() * 14)::INTEGER * INTERVAL '1 day' + (random() * 12)::INTEGER * INTERVAL '1 hour',
            CASE WHEN service_status = 'completed' 
                 THEN NOW() + (random() * 14)::INTEGER * INTERVAL '1 day' + (random() * 12)::INTEGER * INTERVAL '1 hour'
                 ELSE NULL 
            END,
            CASE WHEN random() > 0.7 
                 THEN 'הלקוח דיווח על רעש חריג מהמכשיר'
                 ELSE NULL 
            END
        );
    END LOOP;
END $$;

-- Create notifications for customers
INSERT INTO notifications (customer_id, type, status, channel, content, scheduled_for, sent_at)
SELECT 
    c.id,
    CASE floor(random() * 3)
        WHEN 0 THEN 'appointment_reminder'
        WHEN 1 THEN 'invoice_due'
        ELSE 'warranty_expiring'
    END,
    CASE WHEN random() > 0.3 THEN 'sent' ELSE 'pending' END,
    CASE floor(random() * 3)
        WHEN 0 THEN 'email'
        WHEN 1 THEN 'sms'
        ELSE 'push'
    END,
    CASE floor(random() * 3)
        WHEN 0 THEN '{"subject": "תזכורת לפגישת שירות", "body": "תזכורת לפגישת השירות שלך מחר בשעה 10:00"}'::jsonb
        WHEN 1 THEN '{"subject": "חשבונית לתשלום", "body": "נא להסדיר את התשלום עבור החשבונית האחרונה שלך"}'::jsonb
        ELSE '{"subject": "האחריות שלך עומדת לפוג", "body": "האחריות על המוצר שלך תפוג בעוד 30 ימים"}'::jsonb
    END,
    NOW() + (random() * 10)::INTEGER * INTERVAL '1 day',
    CASE WHEN random() > 0.5 THEN NOW() - (random() * 5)::INTEGER * INTERVAL '1 day' ELSE NULL END
FROM customers c
WHERE random() > 0.5;

-- Add additional data for dashboard metrics
-- Add some more leads with dates in the current month
INSERT INTO leads (lead_source, utm_source, utm_medium, utm_campaign, phone_number, email, first_name, last_name, status, assigned_to, created_at) VALUES
('website', 'google', 'cpc', 'spring_sale', '050-1212345', 'dani.cohen@gmail.com', 'דני', 'כהן', 'new', (SELECT id FROM users WHERE email = 'yaakov.mizrahi@company.com'), NOW() - INTERVAL '2 days'),
('facebook', 'facebook', 'social', 'filter_promo', '050-2323456', 'maya.levi@gmail.com', 'מאיה', 'לוי', 'contacted', (SELECT id FROM users WHERE email = 'sara.levi@company.com'), NOW() - INTERVAL '3 days'),
('instagram', 'instagram', 'social', 'clean_water', '050-3434567', 'omer.israeli@gmail.com', 'עומר', 'ישראלי', 'qualified', (SELECT id FROM users WHERE email = 'yaakov.mizrahi@company.com'), NOW() - INTERVAL '1 day'),
('referral', NULL, NULL, NULL, '050-4545678', 'tamar.david@gmail.com', 'תמר', 'דוד', 'new', (SELECT id FROM users WHERE email = 'sara.levi@company.com'), NOW() - INTERVAL '2 days'),
('phone', NULL, NULL, NULL, '050-5656789', 'assaf.golan@gmail.com', 'אסף', 'גולן', 'contacted', (SELECT id FROM users WHERE email = 'yaakov.mizrahi@company.com'), NOW());

-- Add some more orders in the current month for dashboard metrics
DO $$
DECLARE
    customer_id_var UUID;
    current_order_id UUID;
    product_id_var UUID;
    subtotal_amount NUMERIC(10, 2);
    total_amount NUMERIC(10, 2);
BEGIN
    -- Get a few random customers
    FOR customer_id_var IN SELECT id FROM customers ORDER BY random() LIMIT 5 LOOP
        -- Create recent order for dashboard metrics
        SELECT price INTO subtotal_amount FROM products ORDER BY random() LIMIT 1;
        total_amount := subtotal_amount * 1.17; -- Add 17% VAT
        
        INSERT INTO orders (customer_id, status, subtotal, discount, tax, total, payment_method, payment_status, created_at)
        VALUES (
            customer_id_var, 
            'completed', 
            subtotal_amount, 
            0, 
            total_amount - subtotal_amount, 
            total_amount, 
            'credit_card', 
            'paid',
            NOW() - (random() * 25)::INTEGER * INTERVAL '1 day'
        )
        RETURNING id INTO current_order_id;
        
        -- Add product to order
        SELECT id INTO product_id_var FROM products ORDER BY random() LIMIT 1;
        
        INSERT INTO order_items (order_id, product_id, package_id, quantity, unit_price, total_price)
        VALUES (current_order_id, product_id_var, NULL, 1, subtotal_amount, subtotal_amount);
    END LOOP;
END $$;

-- Create a view that can be used by the dashboard to easily get counts
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT
    (SELECT COUNT(*) FROM leads WHERE status = 'new' OR status = 'contacted') AS new_leads,
    (SELECT COUNT(*) FROM customers WHERE status = 'active') AS active_customers,
    (SELECT COUNT(*) FROM orders WHERE created_at > date_trunc('month', NOW())) AS orders_this_month;

-- Create a view for recent activity
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
    'lead_created' AS activity_type,
    concat(first_name, ' ', last_name) AS name,
    created_at AS activity_date,
    'נוצר ליד חדש עם סטטוס ' || status AS description
FROM 
    leads
UNION ALL
SELECT 
    'order_created' AS activity_type,
    c.first_name || ' ' || c.last_name AS name,
    o.created_at AS activity_date,
    'בוצעה הזמנה בסך ' || o.total || ' ש"ח' AS description
FROM 
    orders o
JOIN 
    customers c ON o.customer_id = c.id
UNION ALL
SELECT 
    'appointment_scheduled' AS activity_type,
    c.first_name || ' ' || c.last_name AS name,
    sa.created_at AS activity_date,
    'נקבעה פגישת שירות מסוג ' || sa.service_type AS description
FROM 
    service_appointments sa
JOIN 
    customers c ON sa.customer_id = c.id
ORDER BY 
    activity_date DESC
LIMIT 10;

-- Create a function to translate status values to readable Hebrew
CREATE OR REPLACE FUNCTION translate_status(status TEXT) RETURNS TEXT AS $$
BEGIN
    RETURN CASE 
        WHEN status = 'new' THEN 'חדש'
        WHEN status = 'contacted' THEN 'נוצר קשר'
        WHEN status = 'qualified' THEN 'מוכשר'
        WHEN status = 'nurturing' THEN 'בטיפול'
        WHEN status = 'converted' THEN 'הומר ללקוח'
        WHEN status = 'closed' THEN 'סגור'
        WHEN status = 'not_interested' THEN 'לא מעוניין'
        WHEN status = 'active' THEN 'פעיל'
        WHEN status = 'inactive' THEN 'לא פעיל'
        ELSE status
    END;
END;
$$ LANGUAGE plpgsql;

-- Create a function to determine status color
CREATE OR REPLACE FUNCTION status_color(status TEXT) RETURNS TEXT AS $$
BEGIN
    RETURN CASE 
        WHEN status IN ('new', 'nurturing') THEN 'blue'
        WHEN status IN ('contacted', 'qualified') THEN 'yellow'
        WHEN status IN ('converted', 'active') THEN 'green'
        WHEN status IN ('closed', 'not_interested', 'inactive') THEN 'red'
        ELSE 'yellow'
    END;
END;
$$ LANGUAGE plpgsql;

-- Update the views to include color and translated status
DROP VIEW IF EXISTS customer_view;
CREATE OR REPLACE VIEW customer_view AS
SELECT 
    c.id,
    c.first_name || ' ' || c.last_name AS name,
    c.phone_number AS phone,
    c.email,
    c.address || (CASE WHEN c.city IS NOT NULL THEN ', ' || c.city ELSE '' END) AS address,
    c.created_at,
    c.status,
    translate_status(c.status) AS status_text,
    status_color(c.status) AS status_color,
    c.lead_id
FROM 
    customers c;

DROP VIEW IF EXISTS lead_view;
CREATE OR REPLACE VIEW lead_view AS
SELECT 
    l.id,
    l.first_name || ' ' || l.last_name AS name,
    l.phone_number AS phone,
    l.email,
    l.lead_source AS source,
    l.status,
    translate_status(l.status) AS status_text,
    status_color(l.status) AS status_color,
    l.created_at,
    l.updated_at,
    l.assigned_to,
    l.utm_source,
    l.utm_medium,
    l.utm_campaign,
    l.utm_content,
    l.custom_fields
FROM 
    leads l;

-- Create activities table for tracking user actions
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert sample activities
INSERT INTO activities (type, description, created_at) VALUES
('lead', 'נוצר ליד חדש - דני כהן', NOW() - INTERVAL '1 hour'),
('customer', 'לקוח חדש נוסף - יעל שטרן', NOW() - INTERVAL '3 hours'),
('order', 'בוצעה הזמנה חדשה ע״י רונן מזרחי', NOW() - INTERVAL '5 hours'),
('service', 'נקבעה פגישת שירות ללקוח מיכל אברהם', NOW() - INTERVAL '12 hours'),
('lead', 'שיחת מכירה בוצעה עם אורי גולן', NOW() - INTERVAL '1 day'),
('order', 'הזמנה מספר 1234 הושלמה', NOW() - INTERVAL '2 days');

-- Create activity_view with user-friendly display
CREATE OR REPLACE VIEW activity_view AS
SELECT 
    id,
    CASE 
        WHEN type = 'lead' THEN 'ליד'
        WHEN type = 'customer' THEN 'לקוח'
        WHEN type = 'order' THEN 'הזמנה'
        WHEN type = 'service' THEN 'שירות'
        ELSE type
    END AS display_type,
    description,
    created_at
FROM 
    activities
ORDER BY 
    created_at DESC;

-- Create a helper view for dashboard to get proper translatable statuses
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM leads WHERE status IN ('new', 'contacted', 'nurturing')) AS new_leads_count,
    (SELECT COUNT(*) FROM customers WHERE status = 'active') AS active_customers_count,
    (SELECT COUNT(*) FROM orders WHERE created_at > date_trunc('month', NOW())) AS orders_this_month_count;

-- Update the language and format settings for consistent display
CREATE OR REPLACE FUNCTION format_date(date_value TIMESTAMP WITH TIME ZONE) 
RETURNS TEXT AS $$
BEGIN
    RETURN to_char(date_value, 'DD.MM.YYYY');
END;
$$ LANGUAGE plpgsql;

-- Create a comprehensive view for dashboard recent leads
CREATE OR REPLACE VIEW recent_leads_view AS
SELECT 
    l.id,
    l.first_name || ' ' || l.last_name AS name,
    l.phone_number AS phone,
    CASE 
        WHEN l.lead_source = 'website' THEN 'אתר אינטרנט'
        WHEN l.lead_source = 'facebook' THEN 'פייסבוק'
        WHEN l.lead_source = 'referral' THEN 'הפניה'
        WHEN l.lead_source = 'phone' THEN 'שיחת טלפון'
        WHEN l.lead_source = 'instagram' THEN 'אינסטגרם'
        WHEN l.lead_source = 'trade_show' THEN 'תערוכה'
        WHEN l.lead_source = 'newspaper' THEN 'עיתון'
        ELSE l.lead_source
    END AS source,
    l.status,
    translate_status(l.status) AS status_text,
    status_color(l.status) AS status_color,
    format_date(l.created_at) AS created_date,
    l.created_at
FROM 
    leads l
ORDER BY 
    l.created_at DESC
LIMIT 10;

-- Create a view for dashboard tasks
CREATE OR REPLACE VIEW dashboard_tasks AS
SELECT 
    id,
    'lead_contact' AS task_type,
    'יצירת קשר עם ליד חדש' AS title,
    first_name || ' ' || last_name AS contact_name,
    phone_number AS contact_info,
    NOW() + (RANDOM() * INTERVAL '8 hours') AS due_time,
    CASE 
        WHEN status = 'new' THEN 'blue'
        WHEN status = 'contacted' THEN 'yellow'
        ELSE 'green'
    END AS color
FROM 
    leads
WHERE 
    status IN ('new', 'contacted', 'nurturing')
ORDER BY 
    RANDOM()
LIMIT 3;

-- Create a view for new customers by month
CREATE OR REPLACE VIEW new_customers_by_month AS
WITH months AS (
    SELECT generate_series(
        date_trunc('month', NOW() - INTERVAL '5 months'),
        date_trunc('month', NOW()),
        '1 month'::interval
    ) AS month_date
)
SELECT 
    TO_CHAR(months.month_date, 'Mon') AS month_name,
    COUNT(c.id) AS customer_count,
    EXTRACT(MONTH FROM months.month_date) AS month_num
FROM 
    months
LEFT JOIN 
    customers c ON date_trunc('month', c.created_at) = months.month_date
GROUP BY 
    months.month_date, month_name, month_num
ORDER BY 
    months.month_date;

-- Create a view for leads by source
CREATE OR REPLACE VIEW leads_by_source AS
WITH lead_sources AS (
    SELECT 
        CASE 
            WHEN lead_source = 'website' THEN 'אתר'
            WHEN lead_source = 'facebook' THEN 'פייסבוק'
            WHEN lead_source = 'referral' THEN 'הפניות'
            WHEN lead_source = 'instagram' THEN 'אינסטגרם'
            WHEN lead_source = 'phone' THEN 'טלפון'
            WHEN lead_source = 'trade_show' THEN 'תערוכה'
            WHEN lead_source = 'newspaper' THEN 'עיתון'
            ELSE 'אחר'
        END AS source,
        COUNT(*) AS count
    FROM 
        leads
    GROUP BY 
        source
)
SELECT 
    source,
    count,
    ROUND((count * 100.0) / (SELECT SUM(count) FROM lead_sources), 1) AS percentage,
    CASE 
        WHEN source = 'אתר' THEN '#3b82f6'
        WHEN source = 'פייסבוק' THEN '#8b5cf6'
        WHEN source = 'הפניות' THEN '#ec4899'
        WHEN source = 'אינסטגרם' THEN '#ef4444'
        WHEN source = 'טלפון' THEN '#10b981'
        WHEN source = 'תערוכה' THEN '#6366f1'
        WHEN source = 'עיתון' THEN '#a855f7'
        ELSE '#f59e0b'
    END AS color
FROM 
    lead_sources
ORDER BY 
    count DESC;

-- Create a view for lead conversion analytics
CREATE OR REPLACE VIEW lead_conversion_analytics AS
WITH monthly_stats AS (
    SELECT
        date_trunc('month', l.created_at) AS month,
        COUNT(l.id) AS total_leads,
        COUNT(CASE WHEN l.status = 'converted' THEN 1 END) AS converted_leads
    FROM
        leads l
    GROUP BY
        date_trunc('month', l.created_at)
    ORDER BY
        month DESC
    LIMIT 6
)
SELECT
    TO_CHAR(month, 'Mon YYYY') AS month_name,
    EXTRACT(MONTH FROM month) AS month_num,
    EXTRACT(YEAR FROM month) AS year_num,
    total_leads,
    converted_leads,
    CASE
        WHEN total_leads > 0 THEN ROUND((converted_leads::numeric / total_leads) * 100, 1)
        ELSE 0
    END AS conversion_rate,
    CASE
        WHEN LAG(total_leads) OVER (ORDER BY month) > 0 THEN
            ROUND(((total_leads - LAG(total_leads) OVER (ORDER BY month))::numeric / LAG(total_leads) OVER (ORDER BY month)) * 100, 1)
        ELSE 0
    END AS lead_growth_rate
FROM
    monthly_stats;

-- Create a view for orders with customer name
CREATE OR REPLACE VIEW orders_view AS
SELECT 
    o.id,
    o.customer_id,
    c.first_name || ' ' || c.last_name AS customer_name,
    o.created_at,
    o.status,
    o.payment_method,
    o.payment_status,
    o.subtotal,
    o.discount,
    o.tax,
    o.total,
    o.notes,
    o.installation_included,
    o.updated_at
FROM 
    orders o
LEFT JOIN
    customers c ON o.customer_id = c.id; 