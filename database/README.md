# Database Setup Files

This folder contains all SQL scripts for setting up the WombGuard database on Supabase (PostgreSQL).

## Files Overview

### Core Setup
- **`supabase_complete_setup.sql`**
  - Creates all tables (users, predictions, chat_history, etc.)
  - Sets up initial structure

### Schema Migrations
- **`add_jwt_email_phone_columns.sql`** 
- **`add_is_blocked_column.sql`** 
- **`add_contact_messages_table.sql`** 
- **`add_health_assessments_table.sql`** 

### Security
- **`fix_rls_policies.sql`** - Row-Level Security (RLS) policies for data protection

## Setup Instructions

### First-Time Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and service role key

2. **Run the Complete Setup Script**
   ```sql
   -- In Supabase SQL Editor, run:
   -- Copy and paste contents of supabase_complete_setup.sql
   ```

3. **Apply Migrations (in order)**
   ```sql
   -- Run each migration file in this order:
   1. add_jwt_email_phone_columns.sql
   2. add_is_blocked_column.sql
   3. add_contact_messages_table.sql
   4. add_health_assessments_table.sql
   5. fix_rls_policies.sql
   ```

### Updating Existing Database

If you already have a database and need to apply updates:

1. Check which migrations you've already applied
2. Run only the new migration files
3. Always run `fix_rls_policies.sql` last to ensure security

## Database Schema

### Tables Created

1. **users** - User accounts (pregnant women, healthcare providers, admins)
2. **predictions** - AI risk prediction results
3. **chat_history** - Chatbot conversation history
4. **contact_messages** - Contact form submissions
5. **health_assessments** - Health tracking data

### Key Features

- Row-Level Security (RLS) enabled
- JWT authentication support
- Email verification system
- Role-based access control
- Audit timestamps (created_at, updated_at)

## Security Notes

- All tables have RLS policies enabled
- Service role key required for admin operations
- User data is isolated by user_id
- Passwords are hashed (never stored in plain text)

## Environment Variables Required

After database setup, configure these in your backend `.env`:

```env
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### Issue: "relation already exists"
- **Solution:** Table already created, skip that migration

### Issue: "permission denied"
- **Solution:** Use service role key, not anon key

### Issue: RLS blocking queries
- **Solution:** Check RLS policies in `fix_rls_policies.sql`

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

