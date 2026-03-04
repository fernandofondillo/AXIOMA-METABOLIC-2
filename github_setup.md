# Axioma Metabolic - Deployment & GitHub Setup

This document outlines the steps to initialize the git repository, connect it to the remote, and push the initial v1.0 version.

## 1. Local Git Initialization
Run the following commands in the root directory (`/Users/fernandoruedaparra2/Documents/AXIOMA METABOLIC`) of your project:

```bash
git init
git add .
git commit -m "Axioma Metabolic V1.0"
```

## 2. Connect to Remote Repository
Link your local repository to your remote GitHub repository:

```bash
git remote add origin https://github.com/fernandofondillo/AXIOMA-METABOLIC.git
git branch -M main
```

## 3. Push to GitHub
Push your code to the `main` branch:

```bash
git push -u origin main
```

## 4. Vercel Deployment
Once the code is pushed to GitHub:
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import the `AXIOMA-METABOLIC` repository from your GitHub account.
4. **Environment Variables**: Add the variables from your `.env.local` to the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` (Leave this **blank** or omit it completely if you want to test the safe fallback behavior in production).
5. Click **Deploy**. The `next.config.ts` settings will ensure any non-critical lint/type errors are bypassed, and the app will boot correctly even without the AI keys.
