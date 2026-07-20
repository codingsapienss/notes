---
sidebar_label: Deploying Node.js Application
sidebar_position: 3
---


# Deploying Node.js Application

### Overview

In the previous chapter, we prepared our Linux server by:

- Updating Ubuntu
- Configuring SSH
- Setting up the firewall
- Installing Git
- Installing Node.js
- Installing PM2
- Installing Nginx

Now the server is ready to host applications.

The next step is deploying a Node.js application.

Deployment involves much more than simply copying files. A proper deployment includes downloading the latest code, installing dependencies, configuring environment variables, building the application, verifying it works correctly, and preparing it to run continuously.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Clone a Node.js project from Git.
- Organize applications on the server.
- Install project dependencies.
- Configure environment variables.
- Build production applications.
- Test the application.
- Prepare the application for production.

---

## Deployment Architecture

A typical deployment looks like this:

```text id="node01"
Git Repository
      │
      ▼
Ubuntu Server
      │
      ▼
Project Folder
      │
      ▼
npm install
      │
      ▼
Build Application
      │
      ▼
Ready for PM2
```

At this stage, the application is installed but not yet exposed to users.

---

## Application Directory

Suppose we organize applications like this:

```text id="node02"
/home/deploy/
│
├── apps/
│     ├── crm/
│     ├── ecommerce/
│     └── portfolio/
│
└── backups/
```

Move into the applications directory.

```bash id="b3o1gk"
cd ~/apps
```

Keeping projects organized simplifies future maintenance.

---

## Cloning the Project

Most deployments begin by cloning a Git repository.

Example:

```bash id="k3o0ph"
git clone https://github.com/company/project.git
```

Move into the project.

```bash id="q8l7np"
cd project
```

Result:

```text id="node03"
apps/

↓

project/

↓

Application Files
```

---

## Typical Project Structure

A typical Express.js project might look like this:

```text id="node04"
project/
│
├── app.js
├── package.json
├── package-lock.json
├── routes/
├── controllers/
├── middleware/
├── models/
├── config/
├── public/
├── views/
├── .env
└── node_modules/
```

Different frameworks may use different structures, but the deployment process is similar.

---

## Understanding package.json

Every Node.js project contains a `package.json` file.

Example:

```text id="node05"
package.json

↓

Project Information

↓

Dependencies

↓

Scripts
```

It tells npm which packages the application requires.

---

## Installing Dependencies

Install all project dependencies.

```bash id="8w3rfa"
npm install
```

npm downloads every package listed in `package.json`.

Example:

```text id="node06"
package.json

↓

npm install

↓

node_modules/
```

The `node_modules` directory contains all required libraries.

---

## Production Dependencies

Some projects distinguish between:

| Type             | Purpose                          |
| ---------------- | -------------------------------- |
| Dependencies     | Required to run the application  |
| Dev Dependencies | Required only during development |

To install only production dependencies:

```bash id="fw1h6i"
npm install --production
```

Modern npm versions also support:

```bash id="k9x18p"
npm install --omit=dev
```

This reduces disk usage and avoids installing unnecessary development tools on production servers.

---

## Environment Variables

Production applications should not hardcode sensitive information.

Instead, use a `.env` file.

Example:

```text id="node07"
.env

↓

Database URL

API Keys

JWT Secret

Port
```

Example `.env`:

```env id="v9s8ld"
PORT=3000
MONGODB_URI=mongodb://localhost:27017/app
JWT_SECRET=your-secret-key
```

Never commit the `.env` file to version control.

---

## Verifying the Environment

Ensure required environment variables exist before starting the application.

Example:

```text id="node08"
Application

↓

Read .env

↓

Load Configuration
```

Missing variables may prevent the application from starting correctly.

---

## Building the Application

Some frameworks require a production build.

Example:

```bash id="cg3j9r"
npm run build
```

Build workflow:

```text id="node09"
Source Code

↓

Build Process

↓

Production Build
```

Frameworks such as Express.js often do not require a build step unless additional tools (TypeScript, bundlers, etc.) are used.

---

## Running the Application for Testing

Before using PM2, test the application manually.

Example:

```bash id="e7j3af"
npm start
```

or

```bash id="qm4v7n"
node app.js
```

Testing verifies that:

- Dependencies are installed.
- Environment variables are correct.
- Database connections work.
- The application starts successfully.

---

## Testing the Application

Once running, open:

```text id="node10"
http://SERVER_IP:3000
```

Example architecture:

```text id="node11"
Browser

↓

Server IP:3000

↓

Node.js Application
```

If the application responds correctly, deployment is progressing successfully.

---

## Common Deployment Files

| File                | Purpose                           |
| ------------------- | --------------------------------- |
| `package.json`      | Project metadata                  |
| `package-lock.json` | Locked dependency versions        |
| `.env`              | Environment variables             |
| `app.js`            | Application entry point (example) |
| `node_modules/`     | Installed packages                |

---

## Using Git for Updates

When a new version is released:

```bash id="g2p6ks"
git pull
```

Workflow:

```text id="node12"
Developer

↓

Git Push

↓

Server

↓

Git Pull
```

This downloads the latest application code.

---

## Handling Dependency Updates

If `package.json` changes after pulling new code:

```bash id="q8n3cw"
npm install
```

This installs any newly added packages.

---

## File Permissions

Ensure the deployment user owns the project.

Example:

```bash id="z7v0qx"
sudo chown -R deploy:deploy /home/deploy/apps/project
```

Correct ownership helps avoid permission-related deployment issues.

---

## Typical Deployment Workflow

```text id="node13"
SSH

↓

cd ~/apps

↓

git clone / git pull

↓

npm install

↓

Configure .env

↓

npm run build (if required)

↓

npm start (Testing)

↓

Ready for PM2
```

---

## Preparing for Production

Before moving to PM2, verify:

| Item                             | Status |
| -------------------------------- | ------ |
| Repository Cloned                | ✓      |
| Dependencies Installed           | ✓      |
| Environment Variables Configured | ✓      |
| Build Completed (if required)    | ✓      |
| Application Starts Successfully  | ✓      |
| Database Connection Verified     | ✓      |

Once these checks pass, the application is ready to be managed by PM2.

---

## Real-World Example

Suppose a company deploys an Express.js application to an Ubuntu Virtual Machine.

The deployment engineer:

1. Connects to the server using SSH.
2. Navigates to the `~/apps` directory.
3. Clones the Git repository.
4. Runs `npm install` to install dependencies.
5. Creates a production `.env` file containing database credentials and API keys.
6. Starts the application manually using `npm start`.
7. Verifies the application is accessible on port **3000**.
8. Confirms database connectivity and application logs.

At this point, the application is running correctly and is ready to be managed by PM2 and exposed through Nginx.

---

## Best Practices

- Store projects in a consistent directory structure.
- Keep the `.env` file outside version control.
- Test the application before configuring PM2.
- Use production-only dependencies where appropriate.
- Verify database connectivity before going live.
- Review application logs after startup.
- Keep repositories synchronized with version control.

---

## Common Mistakes

#### Skipping `npm install`

Running the application without installing dependencies results in missing module errors.

---

#### Committing the `.env` File

Sensitive information such as database passwords and API keys should never be stored in the Git repository.

---

#### Forgetting to Reinstall Dependencies After Updates

If new packages are added to `package.json`, running only `git pull` is insufficient.

---

#### Assuming Every Framework Requires a Build

Frameworks like Express.js usually run directly, while frameworks such as Next.js or TypeScript projects often require a build step.

---

#### Deploying Without Testing

Always verify the application starts successfully before introducing PM2 or Nginx into the deployment process.

---

## Summary

Deploying a Node.js application begins by organizing the server, cloning the project from a Git repository, installing dependencies, configuring environment variables, and building the application if necessary. Before moving to production, the application should be tested manually to confirm that it starts correctly, connects to required services, and functions as expected. Completing these steps ensures the application is ready for process management with PM2 and exposure through Nginx.

---

### Next Chapter

➡️ **04 - Configuring Nginx**
