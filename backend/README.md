# Farm2Market Backend Setup

## Database Initialization

To set up the database with the required tables, run the SQL scripts in the `migrations` directory in order.

## Super Admin Account Setup

To create a default super admin account, run:

```bash
npm run init-super-admin
```

This will create a super admin account with the following credentials:
- Email: superadmin@farm2market.com
- Password PIN: 1234

After running this command, you can log in to the super admin dashboard using these credentials.

## Admin Account Creation

Super admins can create new admin accounts through the Super Admin Dashboard:
1. Navigate to "Register Admin" section
2. Fill in the admin details
3. Select the appropriate role (Admin or Super Admin)
4. Submit the form

The system will automatically hash the password and store it securely in the database.