# Dashboard Stats Function Fix

## Issue
The `get_dashboard_stats` function was not properly implementing Row Level Security (RLS) and was not using `auth.uid()` to get the current authenticated user ID. This caused the function to return incorrect results (zeros) for authenticated users in the mobile app.

## Solution
1. Updated the `get_dashboard_stats` function to properly use `auth.uid()` when no `user_id` parameter is provided
2. Implemented proper RLS checks similar to other functions in the system
3. Added EXECUTE permissions for authenticated users

## Changes Made
- Created `20240812_fix_dashboard_stats_function.sql` migration file
- Fixed the function to use `COALESCE(user_id, auth.uid())` pattern
- Added proper RLS checks for projects, visits, and leads tables
- Added EXECUTE permissions for the authenticated role

## How to Apply
1. Run the SQL commands in `20240812_fix_dashboard_stats_function.sql` in your Supabase SQL editor
2. Test the function with an authenticated user

## Testing
After applying the migration, test the function by calling it from the mobile app or using the Supabase SQL editor:

```sql
SELECT get_dashboard_stats();
```

This should return the correct dashboard statistics for the currently authenticated user.
