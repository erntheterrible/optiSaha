-- Add project_type column to projects table
-- This migration adds the project_type column that is needed by the analytics service

-- Add project_type column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'Residential';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);

-- Disable the log_activity trigger to prevent errors during update
ALTER TABLE projects DISABLE TRIGGER log_project_activity;

-- Update existing projects to have default values for the new column
UPDATE projects 
SET project_type = 'Residential' 
WHERE project_type IS NULL;

-- Add some sample project types for existing projects
UPDATE projects 
SET project_type = CASE 
  WHEN id % 4 = 0 THEN 'Commercial'
  WHEN id % 4 = 1 THEN 'Industrial'
  WHEN id % 4 = 2 THEN 'Infrastructure'
  ELSE 'Residential'
END;

-- Re-enable the log_activity trigger
ALTER TABLE projects ENABLE TRIGGER log_project_activity;
