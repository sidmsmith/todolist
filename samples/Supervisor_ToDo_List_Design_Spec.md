# Supervisor To-Do List – Full Design Specification  
**Product**: Warehouse Management System (WMS)  
**Feature**: Supervisor Action Center (persistent top-right dropdown + mobile version)  
**Date**: November 2025  
**Status**: Ready for development

## 1. Global Style Guide
- Font: Inter (or system sans-serif)
- Body: 14px / line-height 20px
- Headers: 16px medium
- Radius: 8px
- Primary: #007BFF (blue)
- Critical: #DC3545 (red)
- Warning/Overdue: #FD7E14 (orange)
- Success: #28A745 (green)
- Snoozed/Muted: #6C757D (gray)
- Icons: Google Material Symbols (outlined)

## 2. Entry Point (All Screens)
Top-right corner of every WMS screen
[ Main WMS content … ]                                            [Clipboard Icon]🔴12
text- Icon: clipboard_all_outlined (24px)
- Badge: red circle with white number (total visible To-Dos)
- Click → opens dropdown (desktop) or full-screen sheet (mobile <768px)

## 3. Desktop Dropdown (≥768px) – Default State (Snoozed Hidden)
┌────────────────────────────────────────────────────────────────────────────┐
│ Supervisor To-Do List                                      [X] close      │
├────────────────────────────────────────────────────────────────────────────┤
│ CRITICAL (always pinned top)                                               │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ 🌡️ Temperature Excursion – Reefer Zone 3                27 min overdue │ │
│ │     [Dismiss]  [Snooze ▼]                                                      │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│ HIGH PRIORITY                                                              │
│ ┌─ Observations (5) ▼                                     2 overdue      │
│ │  ☐ Observe Sarah                  Due 10:12 AM                       │
│ │  ☐ Observe Mike                   Overdue 18 min ►                  │
│ │  ☐ Observe Parker                Due 11:45 AM                       │
│ │  ☐ Observe Jenna                 Overdue 5 min                      │
│ │  ☐ Observe Tyler                 Due 2:30 PM                        │
│ └─ Observations (5) ▲                                                      │
│                                                                            │
│ ┌─ At-Risk Orders (3) ▼                                                    │
│ │  → ON12345678         Cutoff in 11 min                                 │
│ │  → ON12345679         Cutoff in 27 min                                 │
│ │  → ON12345680         Cutoff in 41 min                                 │
│ └─ At-Risk Orders (3) ▲                                                    │
│                                                                            │
│ MEDIUM PRIORITY                                                            │
│ ┌─ Team Meeting (1) ▼     Scheduled 10:00 AM                              │
│ │  Daily stand-up                                               ✓ Complete │
│ │                                                               [Snooze ▼] [Dismiss] │
│ └─ Team Meeting (1) ▲                                                      │
│                                                                            │
│ ┌─ Restroom Inspection (1) ▼   Overdue 2h 14m                             │
│ │  Weekly cleanliness check                                     ✓ Complete │
│ │                                                               [Snooze ▼] [Dismiss] │
│ └─ Restroom Inspection (1) ▲                                              │
│                                                                            │
│ ☐ Show snoozed items   (default unchecked)                                │
│                                                                            │
│ Today: 12 open  •  3 overdue  •  Last updated 10:15 AM                     │
└────────────────────────────────────────────────────────────────────────────┘
text### When “Show snoozed items” is checked → adds muted section at bottom
│ SNOOZED (will re-appear automatically)                                    │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ Safety Walk                     Reappears at 2:30 PM                │ │
│ │                                      [Un-snooze] [Dismiss]               │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
text## 4. Completion Modal – Static Tasks (example: Restroom Inspection)
┌───────────────────── Complete: Restroom Inspection ─────────────────────┐
│                                                                          │
│ Due: Overdue 2h 14m   |   Assigned to: All Supervisors                │
│                                                                          │
│ Cleanliness Score      ○ 1 ○ 2 ○ 3 ○ 4 ○ 5                               │
│ Comments (optional)                                                    │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │                                                                    │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ [📷 Attach Photo]                                                        │
│                                                                          │
│                   [Cancel]                 [Complete] (green)           │
└──────────────────────────────────────────────────────────────────────────┘
textTeam Meeting = auto-complete → only “Confirm completed? Yes/No”

## 5. Swipe / Right-click Menu (any item)
Snooze
├ 15 minutes
├ 30 minutes
├ 1 hour
├ 4 hours
├ Until end of shift (calculates automatically)
└ Custom → time picker
────────────────────────────────
Dismiss Forever
Reason (quick pick)
├ Looks okay
├ Handled verbally
├ False alert
└ Other → [small text box]
text## 6. Mobile / Handheld Version (<768px)
Full-screen sheet instead of dropdown
┌─────────────────────────────────────────────────────────────────┐
│ 📋🔴 12  Supervisor To-Do List                         [Close] │
├─────────────────────────────────────────────────────────────────┤
│ 🔴 CRITICAL                                                     │
│ • Temperature Excursion (Reefer 3)   [Dismiss] [Snooze ▼]       │
│                                                                 │
│ 🟠 HIGH                                                         │
│ • Observations (5)    2 overdue    →                           │
│ • At-Risk Orders (3)            →                               │
│                                                                 │
│ 🟡 MEDIUM                                                       │
│ • Team Meeting                 [Complete] [Snooze] [Dismiss]    │
│ • Restroom Inspection  OVERDUE [Complete] [Snooze] [Dismiss]    │
│                                                                 │
│ ☐ Show snoozed items                                           │
│ [View History]                                                  │
└─────────────────────────────────────────────────────────────────┘
textTapping any “→” header opens a simple bullet list screen with the items.

## 7. Sorting & Escalation Logic (must be implemented)
1. Critical (current priority = 1 after escalation) → always top
2. Then sort by current priority (descending)
3. Within same priority → overdue static first → then by due time
4. Dynamic items → sorted by how long condition has been true
5. Snoozed items → hidden until snooze expires (unless toggle checked)

## 8. Badge Count Logic
Only counts items the current supervisor can see AND that are NOT snoozed/dismissed/completed.

## 9. Responsiveness
- ≥ 768px → dropdown (as section 3)
- < 768px → full-screen sheet (as section 6)