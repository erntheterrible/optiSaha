# Field Management System - Database Schema

This directory contains the complete database schema and SQL migrations for the Field Management System.

## 📁 File Structure

```
supabase/
├── migrations/
│   ├── 20240101_complete_schema.sql          # Complete database schema
│   ├── 20240101_analytics_functions.sql      # Analytics and reporting functions
│   ├── 20240101_maintenance_utilities.sql    # Maintenance and utility functions
│   ├── 20240101_create_events_table.sql      # Events and related tables
│   └── 20240101_fix_rls_policies.sql        # Row Level Security policies
└── README.md                                  # This file
```

## 🚀 Quick Start

### 1. Apply the Complete Schema

Run the main schema file in your Supabase SQL editor:

```sql
-- Run this in Supabase SQL Editor
-- File: migrations/20240101_complete_schema.sql
```

This will create:
- All core tables (users, projects, visits, events, leads, regions, notes, activities, gps_logs)
- Indexes for performance
- Sample data
- Functions and triggers
- Row Level Security policies

### 2. Apply Analytics Functions

```sql
-- Run this in Supabase SQL Editor
-- File: migrations/20240101_analytics_functions.sql
```

This adds analytics and reporting functions.

### 3. Apply Maintenance Utilities

```sql
-- Run this in Supabase SQL Editor
-- File: migrations/20240101_maintenance_utilities.sql
```

This adds maintenance and utility functions.

## 📊 Database Schema Overview

### Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `users` | User profiles extending Supabase auth | `id`, `full_name`, `role`, `department` |
| `projects` | Field management projects | `name`, `status`, `budget`, `assigned_to`, `customer_name` |
| `visits` | Site visits and field activities | `project_id`, `user_id`, `visit_type`, `status`, `scheduled_date` |
| `events` | Calendar events and meetings | `title`, `start_time`, `end_time`, `created_by` |
| `leads` | Sales leads and prospects | `name`, `company`, `status`, `assigned_to` |
| `regions` | Geographic regions for field operations | `name`, `coordinates`, `assigned_user_id` |
| `notes` | Project and lead notes | `title`, `content`, `category`, `tags` |
| `activities` | Audit trail for user activities | `user_id`, `activity_type`, `description` |
| `gps_logs` | GPS tracking data | `user_id`, `latitude`, `longitude`, `created_at` |

### Key Relationships

- **Projects** → **Users** (assigned_to, created_by)
- **Visits** → **Projects** (project_id)
- **Visits** → **Users** (user_id)
- **Events** → **Users** (created_by)
- **Events** → **Projects** (project_id)
- **Leads** → **Users** (assigned_to, created_by)
- **Notes** → **Projects** (project_id)
- **Notes** → **Leads** (lead_id)
- **Activities** → **Users** (user_id)
- **GPS Logs** → **Users** (user_id)

## 🔧 Key Functions

### Analytics Functions

```sql
-- Get dashboard statistics
SELECT * FROM get_dashboard_stats();

-- Get team performance
SELECT * FROM get_team_performance();

-- Get sales trends
SELECT * FROM get_sales_trends(12);

-- Get project status distribution
SELECT * FROM get_project_status_distribution();

-- Get KPI summary
SELECT get_kpi_summary();
```

### Maintenance Functions

```sql
-- Clean up old GPS logs (older than 90 days)
SELECT cleanup_old_gps_logs(90);

-- Archive completed projects (older than 12 months)
SELECT archive_completed_projects(12);

-- Update project statuses automatically
SELECT update_project_status();

-- Calculate visit durations
SELECT calculate_visit_duration();

-- Run scheduled maintenance
SELECT run_scheduled_maintenance();
```

### Utility Functions

```sql
-- Get system health report
SELECT get_system_health_report();

-- Validate data integrity
SELECT validate_data_integrity();

-- Export data for date range
SELECT export_data_for_date_range('2024-01-01', '2024-12-31');

-- Get database statistics
SELECT get_database_stats();

-- Reset demo data
SELECT reset_demo_data();
```

## 🔐 Row Level Security (RLS)

The schema includes comprehensive RLS policies:

- **Users**: Can view all users, update own profile
- **Projects**: Can view assigned projects, create/update own projects
- **Visits**: Can view own visits, create/update own visits
- **Events**: Can view all events, create/update own events
- **Leads**: Can view assigned leads, create/update own leads
- **Notes**: Can view project notes, create/update own notes
- **Activities**: Can view own activities (read-only)
- **GPS Logs**: Can view/create own GPS logs

## 📈 Sample Data

The schema includes sample data for:

- **4 Users**: Admin, 2 field agents, 1 manager
- **4 Projects**: Different statuses and locations
- **4 Visits**: Various types and statuses
- **3 Events**: Meetings and site visits
- **3 Leads**: Different statuses and companies
- **3 Regions**: Geographic areas
- **3 Notes**: Project-related notes
- **4 Activities**: User activity log

## 🎯 Common Queries

### Dashboard Queries

```sql
-- Get project summary
SELECT * FROM project_summary;

-- Get user performance
SELECT * FROM user_performance;

-- Get upcoming visits
SELECT * FROM upcoming_visits;
```

### Project Management

```sql
-- Get projects by status
SELECT * FROM projects WHERE status = 'in_progress';

-- Get projects assigned to user
SELECT * FROM projects WHERE assigned_to = 'user-uuid';

-- Get project timeline
SELECT * FROM get_project_timeline(1);
```

### Visit Management

```sql
-- Get visits for today
SELECT * FROM visits WHERE DATE(scheduled_date) = CURRENT_DATE;

-- Get completed visits
SELECT * FROM visits WHERE status = 'completed';

-- Get visit analytics
SELECT * FROM get_visit_analytics(30);
```

### Lead Management

```sql
-- Get qualified leads
SELECT * FROM leads WHERE status = 'qualified';

-- Get lead conversion metrics
SELECT * FROM get_lead_conversion_metrics();
```

## 🔄 Data Flow

1. **User Registration**: Users are created in Supabase auth, then synced to `users` table
2. **Project Creation**: Projects are created with assigned users and customer information
3. **Visit Scheduling**: Visits are scheduled for projects with location and timing
4. **Field Activities**: GPS tracking and visit completion are logged
5. **Lead Management**: Leads are tracked through the sales pipeline
6. **Reporting**: Analytics functions provide insights and KPIs

## 🛠️ Maintenance

### Scheduled Tasks

The system includes automated maintenance functions:

- **Daily**: Update project statuses, calculate visit durations
- **Weekly**: Clean up old GPS logs, optimize database
- **Monthly**: Archive completed projects, validate data integrity

### Manual Maintenance

```sql
-- Run all maintenance tasks
SELECT run_scheduled_maintenance();

-- Check system health
SELECT get_system_health_report();

-- Validate data integrity
SELECT validate_data_integrity();
```

## 📊 Performance Optimization

### Indexes

The schema includes comprehensive indexes for:

- User lookups (email, role, manager)
- Project queries (status, assigned_to, dates)
- Visit tracking (project_id, user_id, dates)
- Event scheduling (start_time, created_by)
- Lead management (status, assigned_to)
- GPS tracking (user_id, created_at)

### Views

Pre-built views for common queries:

- `project_summary`: Project statistics with visit counts
- `user_performance`: User performance metrics
- `upcoming_visits`: Scheduled visits with details

## 🔒 Security Features

### Authentication
- Integrates with Supabase Auth
- UUID-based user identification
- Role-based access control

### Data Protection
- Row Level Security (RLS) on all tables
- User-specific data access
- Audit trail for all activities

### Backup & Recovery
- Automated backup functions
- Data export capabilities
- Integrity validation

## 🚨 Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Ensure user is authenticated and has proper permissions
2. **Foreign Key Errors**: Check that referenced records exist
3. **Performance Issues**: Run `optimize_database()` function
4. **Data Integrity**: Run `validate_data_integrity()` function

### Debug Queries

```sql
-- Check user permissions
SELECT * FROM users WHERE id = auth.uid();

-- Check project assignments
SELECT p.*, u.full_name 
FROM projects p 
JOIN users u ON p.assigned_to = u.id;

-- Check visit status
SELECT v.*, p.name as project_name 
FROM visits v 
JOIN projects p ON v.project_id = p.id;
```

## 📝 Migration Notes

### Version History

- **v1.0**: Initial schema with core tables
- **v1.1**: Added analytics functions
- **v1.2**: Added maintenance utilities
- **v1.3**: Enhanced RLS policies

### Breaking Changes

- None in current version
- All changes are backward compatible

## 🤝 Contributing

When adding new features:

1. Create new migration file with timestamp
2. Add appropriate indexes
3. Update RLS policies
4. Add sample data if needed
5. Update this README

## 📞 Support

For database-related issues:

1. Check the troubleshooting section
2. Run system health report
3. Validate data integrity
4. Check Supabase logs

---

**Last Updated**: January 2024  
**Version**: 1.3  
**Compatibility**: Supabase, PostgreSQL 14+ 