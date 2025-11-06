# Documentation Organization Guide

**Purpose**: This document explains how project documentation is organized and where to find specific information.

---

## 📁 Main Directory (`/`) - Essential Files Only

**Keep these in root for Phase 3/4 orchestrator context:**

### Phase Completion Reports (Critical Handoffs)
- `PHASE1_COMPLETION_REPORT.md` - Smart contract deployment details
- `PHASE2A_COMPLETION_REPORT.md` - Backend API completion
- `PHASE2B_COMPLETE_FINAL_REPORT.md` - Indexer completion

### Project Foundations
- `PRD_PRODUCT.md` - Product requirements
- `PRD_TECHNICAL.md` - Technical specifications
- `TECHNICAL_DECISIONS.md` - Architecture decisions
- `DEMO_VIDEO.md` - Demo script and scenarios

### Configuration & Credentials
- `wallet-addresses.txt` - **CRITICAL** - All addresses, keys, database URLs
- `setup-implemented.md` - Setup completion summary
- `RAILWAY_DATABASE_URLS.txt` - Database connection strings
- `RAILWAY_ARCHITECTURE.md` - Railway deployment architecture overview

### Navigation & Prompts
- `PROJECT_INDEX.md` - Master navigation document
- `ORCHESTRATOR_PROMPT.md` - Main orchestrator instructions
- `PROMPT_FOR_ORCHESTRATOR.md` - Quick reference

### Memory Bank (Persistent Knowledge)
- `memory-bank/` - Complete project knowledge base
  - `projectbrief.md` - Project overview
  - `productContext.md` - User experience
  - `systemPatterns.md` - Architecture
  - `techContext.md` - Tech stack
  - `progress.md` - Phase status
  - `activeContext.md` - Current focus

---

## 📂 Documentation Directory (`/docs/`) - Reference & Guides

### `/docs/phases/` - Phase Implementation Prompts
- `PHASE1_CONTRACT_SPECIALIST_PROMPT.md`
- `PHASE2A_BACKEND_SPECIALIST_PROMPT.md`
- `PHASE2B_INDEXER_SPECIALIST_PROMPT.md`
- *Future: Phase 3 & 4 prompts*

### `/docs/testing/` - Testing Guides
- `TEST_PHASE2A_2B_INTEGRATION.md` - Complete integration testing guide
- `TESTING_SUMMARY.md` - Test results summary
- `PHASE2A_2B_TEST_RESULTS.md` - Detailed test results
- `PHASE2A_STATUS_SUMMARY.md` - Phase 2A status
- `PHASE2A_READY_TO_START.md` - Quick start guide
- `PHASE2A_AGENT_INTRO.md` - Agent introduction

### `/docs/deployment/` - Deployment Guides
- `PHASE2B_MANUAL_DEPLOYMENT.md` - Indexer deployment
- `PHASE2B_RAILWAY_DEPLOYMENT_COMPLETE.md` - Indexer completion
- `/backend/` - Backend-specific deployment docs
  - `DEPLOYMENT_SUCCESS.md`
  - `RAILWAY_DEPLOYMENT.md`
  - `SET_BACKEND_ROOT.md`
  - `SET_VARIABLES_DASHBOARD.md`
  - etc.

### `/docs/troubleshooting/` - Issue Resolution
- `DATABASE_CREDENTIALS_UPDATE.md` - Credential changes
- `RAILWAY_DB_INITIALIZATION_ISSUE.md` - Database init problems
- `RAILWAY_DB_VERIFICATION.md` - Verification guide
- `RAILWAY_DEPLOYMENT_SUCCESS.md` - Success documentation
- `RAILWAY_DOCKERFILE_ISSUE_SUMMARY.md` - Dockerfile issues
- `RAILWAY_SERVICES.md` - Service configuration
- `DEPLOYMENT_ARCHITECTURE.md` - Architecture details

### `/docs/` - General Reference
- `MANUAL_SETUP.md` - Setup instructions
- `Manual_Setup_Summary.md` - Setup summary
- `MEMORY_BANK_COMPLETE.md` - Memory bank guide
- `README_DOCS.md` - Documentation overview
- `KNOWN_LIMITATIONS.md` - Project limitations
- `STATUS_SUMMARY.md` - Overall status

### `/docs/railway/` - Railway-Specific Documentation
- `ORCHESTRATOR_SUMMARY.md` - Deployment summary
- `COMPLETE_SOLUTION.md` - Complete deployment guide
- `DEPLOYMENT_SUCCESS.md` - Success report
- `/reports/` - Phase reports
- `/history/` - Historical troubleshooting
- `/troubleshooting/` - Railway-specific fixes

---

## 🗂️ Service-Specific Directories

### `/backend/` - Backend Code & Local Docs
- `README.md` - API documentation
- `test-integration.sh` - Integration test script
- `deploy-to-railway.sh` - Deployment script
- **Code**: `src/` directory

### `/indexer/` - Indexer Code & Local Docs
- `README.md` - Indexer documentation
- **Code**: `src/` directory
- **Deployment**: Dockerfile, deployment scripts

### `/contracts/` - Smart Contracts
- `README.md` - Contract documentation
- **Code**: `src/` directory
- **ABI**: `out/GatedToken.sol/GatedToken.json`

---

## 📋 Quick Reference

### For Phase 3 Frontend Development
**Start Here**: `ORCHESTRATOR_PROMPT.md`  
**Check**: `PHASE2A_COMPLETION_REPORT.md` (backend endpoints)  
**Reference**: `RAILWAY_ARCHITECTURE.md` (deployment context)  
**Backend URL**: https://tender-achievement-production-3aa5.up.railway.app/api

### For Troubleshooting Deployment
**Start Here**: `RAILWAY_ARCHITECTURE.md`  
**Detailed Guides**: `/docs/troubleshooting/`  
**Railway-Specific**: `/docs/railway/`

### For Understanding Project
**Start Here**: `PROJECT_INDEX.md`  
**Full Context**: `memory-bank/` directory  
**Requirements**: `PRD_PRODUCT.md`, `PRD_TECHNICAL.md`

### For Testing Integration
**Start Here**: `/docs/testing/TEST_PHASE2A_2B_INTEGRATION.md`  
**Quick Test**: `backend/test-integration.sh`

---

## 🎯 File Organization Philosophy

**Main Directory** (`/`):
- Essential for Phase 3/4 orchestrator
- Phase completion reports (handoffs)
- Configuration files (credentials)
- Navigation documents
- Memory bank (persistent knowledge)

**Docs Directory** (`/docs/`):
- Detailed guides and references
- Testing documentation
- Deployment guides
- Troubleshooting guides
- Historical context

**Service Directories** (`/backend/`, `/indexer/`):
- Code and README files
- Service-specific deployment scripts
- Local development guides

---

**Last Updated**: November 6, 2025  
**Status**: Organized and ready for Phase 3

