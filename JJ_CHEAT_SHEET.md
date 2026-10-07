# Jujutsu (JJ) Version Control Cheat Sheet

A voice-friendly, rapid-reference guide for Jujutsu (`jj`) with Git colocation.

---

## 0. Universal One-Command Sync (`jj-sync`)

Automatically initializes Git and colocated JJ if missing, commits your changes, advances active bookmarks, and prepares a fresh working copy in one step. Works from any directory.

### Quick Commit Any Directory
```bash
jj-sync "your commit message here"
```

### Quick Status Check
```bash
jj-sync --status
```

### Quick Log Check
```bash
jj-sync --log
```

---

## 1. Daily Essentials

Every change you make in the directory is automatically tracked in your working copy (`@`). You never need to run `git add`.

### Check Working Status
```bash
jj status
```

### View Recent Commit Tree
```bash
jj log -n 5
```

### View Full History Graph
```bash
jj log
```

### Inspect File Diffs
```bash
jj diff
```

### Describe Current Change (Commit Message)
```bash
jj describe -m "feat: your change summary here"
```

### Start Next Change
Creates a new empty working-copy commit on top of the current one.
```bash
jj new
```

---

## 2. Bookmarks & Git Branches

In Jujutsu, Git branches are called **bookmarks**.

### Create a Bookmark on Current Change
```bash
jj bookmark create my-feature
```

### Move an Existing Bookmark to Current Change
```bash
jj bookmark set my-feature -r @
```

### List All Bookmarks
```bash
jj bookmark list
```

### Track a Remote Branch
```bash
jj bookmark track my-feature@origin
```

---

## 3. Pushing & Fetching with Git

### Push a Bookmark to GitHub / Origin
```bash
jj git push --bookmark my-feature
```

### Push All Tracked Bookmarks
```bash
jj git push
```

### Fetch Remote Updates from GitHub
```bash
jj git fetch
```

---

## 4. Time Travel & Safety Net

Jujutsu records every operation. You can undo any command at any time.

### Undo Last Action
Undoes the previous operation completely.
```bash
jj undo
```

### View Operation History
```bash
jj op log -n 10
```

### Restore to a Specific Operation
```bash
jj op restore <operation-id>
```

### Abandon Current Change (Discard)
Safely throws away the working copy changes and moves to a clean state.
```bash
jj abandon
```

---

## 5. Modifying History

### Squash Current Changes into Parent Commit
```bash
jj squash
```

### Jump Back into an Old Commit to Edit It
```bash
jj edit <change-id>
```

### Rebase Current Change onto Another Revision
```bash
jj rebase -d <target-change-id>
```

---

## 6. Setting Up JJ on Any Project

### Colocate in an Existing Git Repository (Recommended)
Run inside the project root directory where `.git` already exists:
```bash
jj git init --colocate
```

### Disable Pager Freezes in Terminal
```bash
jj config set --repo ui.paginate "never"
```

### Set User Identity for the Repository
```bash
jj config set --repo user.name "imgt511"
```
```bash
jj config set --repo user.email "imusta@gmail.com"
```

---

## 7. Git to JJ Rosetta Stone

| What You Want To Do | Git Command | Jujutsu Command |
|---|---|---|
| See modified files | `git status` | `jj status` |
| View commit log | `git log --oneline --graph` | `jj log` |
| Save commit with message | `git commit -m "..."` | `jj describe -m "..."` |
| Start new branch / commit | `git checkout -b new-branch` | `jj new` |
| Switch branch | `git checkout branch-name` | `jj new branch-name` |
| Push to remote | `git push origin branch-name` | `jj git push --bookmark branch-name` |
| Pull from remote | `git pull` | `jj git fetch` |
| Discard work | `git reset --hard HEAD` | `jj abandon` |
| Undo last command | *(Very difficult in git)* | `jj undo` |
| Amend previous commit | `git commit --amend` | `jj squash` |

