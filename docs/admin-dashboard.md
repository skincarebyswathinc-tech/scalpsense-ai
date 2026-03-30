# Admin Dashboard Documentation

## Access
- Navigate to `/admin` after logging in with an admin account
- Admin access requires the `admin` role in the `user_roles` table

## Features

### Dashboard Overview (`/admin`)
- **Total Users**: Count of all registered users
- **Active Subscriptions**: Number of premium subscribers
- **Monthly Revenue**: Estimated revenue from subscriptions
- **Conversion Rate**: Percentage of users who upgraded
- **Churn Rate**: Percentage of expired subscriptions
- **Top Referral Sources**: Most effective referral codes

### Quiz Management (`/admin/quizzes`)
- **Manual Creation**: Create quizzes with title, description, topic, difficulty
- **CSV Upload**: Bulk import questions via CSV format
  - Format: `question_text,option_a,option_b,option_c,option_d,correct_answer,explanation`
- **JSON Upload**: Import structured quiz data
- **AI Generation**: Generate quizzes by specifying topic, difficulty, and question count
- **Versioning**: Each quiz has a version number for tracking changes

### Product Management (`/admin/products`)
- **Inventory Products**: Track stock with quantity field
- **External Link Products**: Link to external purchase URLs
- **Payment Links**: Configure per-product payment links
- **Categories**: Organize products by type (shampoo, serum, supplement, etc.)
- **Targeting**: Set target scalp types and symptoms for recommendations

## Admin Credentials
- Email: `yadhuvarshini1@gmail.com`
- Password: `frfrdvgr`
