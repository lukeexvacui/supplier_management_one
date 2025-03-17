/*
  # Initial Schema Setup for Supplier Management System

  1. New Tables
    - suppliers: Basic supplier information and status tracking
    - metrics: Performance metrics and historical data
    - evaluations: Supplier evaluation records
    - non_conformities: Issue tracking and resolution
    - documents: File storage and management
    - custom_fields: Dynamic field definitions

  2. Security
    - RLS enabled for all tables
    - Policies for authenticated users
    - Automatic triggers for metrics and status updates

  3. Features
    - UUID generation for all IDs
    - Automatic timestamps
    - Referential integrity with cascading deletes
    - Performance indexes
    - Custom fields support via JSONB
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  legal_name text NOT NULL,
  document_number text UNIQUE NOT NULL,
  category text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  address text,
  location_url text,
  average_rating numeric DEFAULT 0,
  last_evaluation timestamp with time zone,
  status text DEFAULT 'active',
  custom_fields jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  delivery_rate numeric DEFAULT 0,
  non_conformity_rate numeric DEFAULT 0,
  nps_score numeric DEFAULT 0,
  response_time numeric DEFAULT 0,
  quality_score numeric DEFAULT 0,
  positive_evaluations integer DEFAULT 0,
  negative_evaluations integer DEFAULT 0,
  total_evaluations integer DEFAULT 0,
  last_updated timestamp with time zone DEFAULT now(),
  historical_data jsonb DEFAULT '[]'
);

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  evaluator uuid REFERENCES auth.users(id),
  date timestamp with time zone DEFAULT now(),
  ratings jsonb NOT NULL,
  comments text,
  type text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Non-conformities table
CREATE TABLE IF NOT EXISTS non_conformities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  type text NOT NULL,
  severity text NOT NULL,
  description text NOT NULL,
  reported_date timestamp with time zone DEFAULT now(),
  status text DEFAULT 'open',
  resolution_deadline timestamp with time zone NOT NULL,
  resolution_date timestamp with time zone,
  resolution text,
  escalation_reason text,
  impact text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  url text NOT NULL,
  type text NOT NULL,
  size integer NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  uploaded_at timestamp with time zone DEFAULT now(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  evaluation_id uuid REFERENCES evaluations(id) ON DELETE CASCADE,
  non_conformity_id uuid REFERENCES non_conformities(id) ON DELETE CASCADE,
  CHECK (
    (supplier_id IS NOT NULL AND evaluation_id IS NULL AND non_conformity_id IS NULL) OR
    (supplier_id IS NULL AND evaluation_id IS NOT NULL AND non_conformity_id IS NULL) OR
    (supplier_id IS NULL AND evaluation_id IS NULL AND non_conformity_id IS NOT NULL)
  )
);

-- Custom fields table
CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL,
  options jsonb,
  required boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_conformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_suppliers_document_number') THEN
    CREATE INDEX idx_suppliers_document_number ON suppliers(document_number);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_suppliers_name') THEN
    CREATE INDEX idx_suppliers_name ON suppliers(name);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_suppliers_legal_name') THEN
    CREATE INDEX idx_suppliers_legal_name ON suppliers(legal_name);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_suppliers_status') THEN
    CREATE INDEX idx_suppliers_status ON suppliers(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_evaluations_supplier_id') THEN
    CREATE INDEX idx_evaluations_supplier_id ON evaluations(supplier_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_non_conformities_supplier_id') THEN
    CREATE INDEX idx_non_conformities_supplier_id ON non_conformities(supplier_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_non_conformities_status') THEN
    CREATE INDEX idx_non_conformities_status ON non_conformities(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_supplier_id') THEN
    CREATE INDEX idx_documents_supplier_id ON documents(supplier_id);
  END IF;
END $$;

-- Create RLS policies for each table
DO $$ 
BEGIN
  -- Suppliers policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers are viewable by authenticated users') THEN
    CREATE POLICY "Suppliers are viewable by authenticated users" ON suppliers FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers are insertable by authenticated users') THEN
    CREATE POLICY "Suppliers are insertable by authenticated users" ON suppliers FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers are updatable by authenticated users') THEN
    CREATE POLICY "Suppliers are updatable by authenticated users" ON suppliers FOR UPDATE TO authenticated USING (true);
  END IF;

  -- Metrics policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Metrics are viewable by authenticated users') THEN
    CREATE POLICY "Metrics are viewable by authenticated users" ON metrics FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Metrics are insertable by authenticated users') THEN
    CREATE POLICY "Metrics are insertable by authenticated users" ON metrics FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Metrics are updatable by authenticated users') THEN
    CREATE POLICY "Metrics are updatable by authenticated users" ON metrics FOR UPDATE TO authenticated USING (true);
  END IF;

  -- Evaluations policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Evaluations are viewable by authenticated users') THEN
    CREATE POLICY "Evaluations are viewable by authenticated users" ON evaluations FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Evaluations are insertable by authenticated users') THEN
    CREATE POLICY "Evaluations are insertable by authenticated users" ON evaluations FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Evaluations are updatable by authenticated users') THEN
    CREATE POLICY "Evaluations are updatable by authenticated users" ON evaluations FOR UPDATE TO authenticated USING (true);
  END IF;

  -- Non-conformities policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Non-conformities are viewable by authenticated users') THEN
    CREATE POLICY "Non-conformities are viewable by authenticated users" ON non_conformities FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Non-conformities are insertable by authenticated users') THEN
    CREATE POLICY "Non-conformities are insertable by authenticated users" ON non_conformities FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Non-conformities are updatable by authenticated users') THEN
    CREATE POLICY "Non-conformities are updatable by authenticated users" ON non_conformities FOR UPDATE TO authenticated USING (true);
  END IF;

  -- Documents policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Documents are viewable by authenticated users') THEN
    CREATE POLICY "Documents are viewable by authenticated users" ON documents FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Documents are insertable by authenticated users') THEN
    CREATE POLICY "Documents are insertable by authenticated users" ON documents FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Documents are updatable by authenticated users') THEN
    CREATE POLICY "Documents are updatable by authenticated users" ON documents FOR UPDATE TO authenticated USING (true);
  END IF;

  -- Custom fields policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Custom fields are viewable by authenticated users') THEN
    CREATE POLICY "Custom fields are viewable by authenticated users" ON custom_fields FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Custom fields are insertable by authenticated users') THEN
    CREATE POLICY "Custom fields are insertable by authenticated users" ON custom_fields FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Custom fields are updatable by authenticated users') THEN
    CREATE POLICY "Custom fields are updatable by authenticated users" ON custom_fields FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- Functions
CREATE OR REPLACE FUNCTION update_supplier_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update supplier metrics when new evaluation is added
  UPDATE metrics
  SET 
    positive_evaluations = CASE 
      WHEN NEW.type = 'positive' THEN positive_evaluations + 1 
      ELSE positive_evaluations 
    END,
    negative_evaluations = CASE 
      WHEN NEW.type = 'negative' THEN negative_evaluations + 1 
      ELSE negative_evaluations 
    END,
    total_evaluations = total_evaluations + 1,
    last_updated = now()
  WHERE supplier_id = NEW.supplier_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'evaluation_added') THEN
    CREATE TRIGGER evaluation_added
      AFTER INSERT ON evaluations
      FOR EACH ROW
      EXECUTE FUNCTION update_supplier_metrics();
  END IF;
END $$;

-- Function to automatically block suppliers based on non-conformities
CREATE OR REPLACE FUNCTION check_supplier_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'open' OR NEW.status = 'in_progress' THEN
    UPDATE suppliers
    SET status = 'temporarily_blocked'
    WHERE id = NEW.supplier_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'non_conformity_status_changed') THEN
    CREATE TRIGGER non_conformity_status_changed
      AFTER INSERT OR UPDATE ON non_conformities
      FOR EACH ROW
      EXECUTE FUNCTION check_supplier_status();
  END IF;
END $$;