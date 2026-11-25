# Abba Grace E-book Store

## One-time setup (about 20 minutes)

### 1. Supabase
1. Create a free project at supabase.com.
2. Open SQL Editor, paste the whole file supabase/migrations/0001_initial.sql and press Run.
3. Authentication > Sign In / Providers > Email: turn OFF "Allow new users to sign up".
4. Authentication > Users > Add user: enter YOUR email and a strong password you choose. Tick auto-confirm.
5. Back in SQL Editor run this once, with your own email:
   update public.profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';
6. Project Settings > API: copy the Project URL and the anon public key.

### 2. Netlify
1. Push this folder to GitHub, then in Netlify choose Add new site > Import from Git.
2. Site configuration > Environment variables: add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (values from step 6).
3. Deploy. Visit /admin/login, sign in, and add your book with its cover and PDF.

Never put the service_role key in VITE_ variables or in code. It is not needed yet.

## Status
Done: storefront, splash, live book data, admin login, book and file upload.
Not built yet: checkout, PayFast, receipts, downloads for customers, discounts, orders.
Nothing here has been compiled or tested.
