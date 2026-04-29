import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In GitHub Actions, GITHUB_REPOSITORY is set to "username/repo-name".
// We use the repo name as the base so assets load from the correct subdirectory.
// For a user/org page (repo ending in .github.io) the base stays '/'.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isUserPage = repo?.endsWith('.github.io')
const base = repo && !isUserPage ? `/${repo}/` : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
