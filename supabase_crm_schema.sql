CREATE TABLE customers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  first_name character varying(255) NOT NULL,
  last_name character varying(255) NOT NULL,
  email character varying(255),
  phone_number character varying(50) NOT NULL,
  address text,
  city character varying(255),
  custom_fields jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  lead_id uuid
);

CREATE TABLE documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying(255) NOT NULL,
  type character varying(100) NOT NULL,
  path character varying(1000) NOT NULL,
  customer_id uuid,
  product_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE inventory (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  min_threshold integer NOT NULL DEFAULT 10,
  last_restock timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE invoices (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  invoice_number character varying(50) NOT NULL,
  status character varying(50) NOT NULL,
  amount numeric NOT NULL,
  due_date timestamp with time zone NOT NULL,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE leads (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lead_source character varying(255) NOT NULL,
  utm_source character varying(255),
  utm_medium character varying(255),
  utm_campaign character varying(255),
  utm_content character varying(255),
  phone_number character varying(50) NOT NULL,
  email character varying(255),
  first_name character varying(255) NOT NULL,
  last_name character varying(255) NOT NULL,
  custom_fields jsonb,
  status character varying(50) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_to uuid
);

CREATE TABLE notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  type character varying(100) NOT NULL,
  status character varying(50) NOT NULL,
  channel character varying(50) NOT NULL,
  content jsonb NOT NULL,
  scheduled_for timestamp with time zone,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  product_id uuid,
  package_id uuid,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL
);

CREATE TABLE orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  status character varying(50) NOT NULL,
  subtotal numeric NOT NULL,
  discount numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL,
  payment_method character varying(50),
  payment_status character varying(50),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE package_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  package_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL,
  price_override numeric
);

CREATE TABLE packages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying(255) NOT NULL,
  description text NOT NULL,
  base_price numeric NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying(255) NOT NULL,
  sku character varying(100) NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  cost numeric NOT NULL,
  category character varying(100) NOT NULL,
  active boolean NOT NULL DEFAULT true,
  warranty_months integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE service_appointments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  technician_id uuid NOT NULL,
  product_id uuid,
  service_type character varying(100) NOT NULL,
  status character varying(50) NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  type character varying(100) NOT NULL,
  payload jsonb NOT NULL,
  status character varying(50) NOT NULL,
  priority integer NOT NULL DEFAULT 1,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  completed_at timestamp with time zone,
  error text
);

CREATE TABLE technicians (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  first_name character varying(255) NOT NULL,
  last_name character varying(255) NOT NULL,
  email character varying(255) NOT NULL,
  phone_number character varying(50) NOT NULL,
  status character varying(50) NOT NULL,
  skills jsonb,
  work_schedule jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  first_name character varying(255) NOT NULL,
  last_name character varying(255) NOT NULL,
  email character varying(255) NOT NULL,
  role character varying(50) NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE warranties (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  product_id uuid NOT NULL,
  order_item_id uuid NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  status character varying(50) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
