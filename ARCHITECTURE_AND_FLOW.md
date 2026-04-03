# Permission System - Architecture & Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PERMISSION SYSTEM ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────────────────┘

                           ┌──────────────────┐
                           │   JWT Token      │
                           │  (localStorage   │
                           │   accessToken)   │
                           └────────┬─────────┘
                                    │
                                    ▼
                    ┌────────────────────────────────┐
                    │  parseJwt()                    │
                    │  Extract role_permission       │
                    └────────────┬───────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────────┐
                    │  PermissionService.js          │
                    │  Core Permission Logic         │
                    │                                │
                    │  - hasPermission()             │
                    │  - getMissingPermissions()     │
                    │  - getFeatureVisibilityMap()   │
                    └────────┬──────────┬────────────┘
                             │          │
             ┌───────────────┼──────────┼──────────────────┐
             │               │          │                  │
             ▼               ▼          ▼                  ▼
        ┌──────────┐   ┌──────────┐ ┌──────────┐   ┌──────────────┐
        │  Hooks   │   │    HOC   │ │   Gates  │   │  Service     │
        │(React    │   │Component │ │Component │   │  Direct Call │
        │built-in) │   │Wrappers  │ │Rendering │   │  (if needed) │
        │          │   │          │ │          │   │              │
        │Multiple  │   │Multiple  │ │Multiple  │   │Logic for     │
        │options   │   │options   │ │options   │   │handlers      │
        └────┬─────┘   └────┬─────┘ └────┬─────┘   └──────┬───────┘
             │              │            │                │
             └──────────────┴────────────┴────────────────┘
                            │
                            ▼
                    ┌─────────────────┐
                    │  Component      │
                    │  Visibility     │
                    │  Determined     │
                    └─────────────────┘
                            │
                ┌───────────┬┴─────────────┐
                ▼           ▼              ▼
            ┌────────┐  ┌────────┐    ┌────────┐
            │  Show  │  │  Hide  │    │ Mixed  │
            │Feature │  │Feature │    │Status  │
            └────────┘  └────────┘    └────────┘
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          PERMISSION DATA FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

USER PERMISSION (From JWT):
───────────────────────────
[
  { c: "Account", a: ["Register", "EditUser"] },
  { c: "FixSession", a: ["ConnectDisconnectFIX"] }
]


COMPLETE PERMISSIONS (rolesAccessesList):
─────────────────────────────────────────
{
  Account: ["Register", "EditUser"],
  FixSession: [
    "ConnectDisconnectFIX",
    "SetSequenceNumber",        ← Missing for user
    "ResetSequenceNumber",       ← Missing for user
    "GetSessionConfiguration",   ← Missing for user
    "EditSessionConfiguration"   ← Missing for user
  ]
}


COMPARISON RESULT:
──────────────────
Missing Permissions: {
  FixSession: [
    "SetSequenceNumber",
    "ResetSequenceNumber",
    "GetSessionConfiguration",
    "EditSessionConfiguration"
  ]
}


VISIBILITY MAP:
────────────────
{
  Account: {
    categoryAccessible: true,
    actions: {
      Register: ✓ (visible),
      EditUser: ✓ (visible)
    }
  },
  FixSession: {
    categoryAccessible: true,
    actions: {
      ConnectDisconnectFIX: ✓ (visible),
      SetSequenceNumber: ✗ (hidden),
      ResetSequenceNumber: ✗ (hidden),
      GetSessionConfiguration: ✗ (hidden),
      EditSessionConfiguration: ✗ (hidden)
    }
  }
}


UI RENDERING DECISION:
──────────────────────
✓ Show: Register button
✓ Show: Edit User button
✓ Show: Connect/Disconnect button
✗ Hide: Set Sequence button
✗ Hide: Reset Sequence button
✗ Hide: Get Config button
✗ Hide: Edit Config button
```

---

## Component Integration Patterns

```
┌─────────────────────────────────────────────────────────────────────┐
│                      INTEGRATION PATTERNS                           │
└─────────────────────────────────────────────────────────────────────┘

PATTERN 1: HOOKS (Most Common)
───────────────────────────────
Component
    ↓
usePermission("Cat", "Act")
    ↓
{ hasAccess, isLoading }
    ↓
Conditional Render
    ↓
UI Update


PATTERN 2: HOC (Class Components or Static Wrapping)
─────────────────────────────────────────────────────
Original Component
    ↓
WithPermission(Comp, "Cat", "Act")
    ↓
Wrapped Component (checks permission)
    ↓
Render or Fallback
    ↓
UI Update


PATTERN 3: GATES (Inline Conditional)
──────────────────────────────────────
JSX Content
    ↓
<PermissionGate category="Cat" action="Act">
    ↓
Check Permission
    ↓
Render children or fallback
    ↓
UI Update


PATTERN 4: SERVICE (Direct Logic)
──────────────────────────────────
Event Handler / Logic
    ↓
PermissionService.hasPermission()
    ↓
Boolean result
    ↓
Execute or Block
    ↓
Outcome
```

---

## Method Selection Decision Tree

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HOW TO CHECK PERMISSIONS?                        │
└─────────────────────────────────────────────────────────────────────┘

                          START HERE
                              │
                              ▼
                    "Need permission check?"
                         /            \
                       YES             NO → End
                       /
                      ▼
              "In Component Render?"
                    /        \
                  YES         NO
                  /             \
                 ▼               ▼
           "Simple inline    "In event
            condition?"       handler?"
             /     \           /    \
           YES     NO        YES    NO
           /         \        /      \
          ▼          ▼       ▼        ▼
        GATE       HOOK  SERVICE   NEED
       Use:        Use:    Use:     MORE
    Permission   usePermission Directly Check   INFO
      Gate         Hook      Per.
                            Service


GATE
────
• Simple inline rendering
• Pass children & fallback
• Stateless

    <PermissionGate category="X" action="Y">
      <Component />
    </PermissionGate>


HOOK
────
• Need state management
• Want loading indicator
• Multiple permission checks

    const { hasAccess, isLoading } = usePermission("X", "Y");


SERVICE
───────
• Pre-action checks
• Complex logic
• Non-render context

    if (PermissionService.hasPermission("X", "Y")) { }


HOC
────
• Wrapping entire component
• Reusable wrapper

    export default WithPermission(Component, "X", "Y");
```

---

## Feature Hiding Logic Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FEATURE HIDING DECISION FLOW                     │
└─────────────────────────────────────────────────────────────────────┘

FEATURE VISIBILITY CHECK
────────────────────────

Feature A requires Category="Account", Action="Register"
                              │
                              ▼
         "Is 'Account' in user permissions?"
                         /        \
                       NO          YES
                       /             \
                      ▼               ▼
    HIDE           "Is 'Register'
  FEATURE         in user's Account?"
                      /        \
                    NO          YES
                    /             \
                   ▼               ▼
               HIDE            SHOW
             FEATURE         FEATURE


CASCADING LOGIC
───────────────

Level 1: Category Missing
  → Hide ALL actions in category
  → Hide entire feature sections
  → Hide menu items
  Example: No "GitHub" category → All GitHub features hidden


Level 2: Category Exists but Action Missing
  → Hide specific action
  → Keep other category actions visible
  → Partial feature access
  Example: User has "FixSession" but not "ResetSequenceNumber"
           → Show Connect, hide Reset button


Level 3: Category Exists with All Actions
  → Show all features in category
  → Full feature access
  Example: User has all "Account" actions
           → Show all Account features


Level 4: Mixed Access
  → Show accessible features
  → Hide restricted features
  → Selective UI rendering
  Example: User has some but not all Role actions
           → Show allowed role operations only
```

---

## Hook Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                      HOOK LIFECYCLE                                 │
└─────────────────────────────────────────────────────────────────────┘

usePermission("Category", "Action") lifetycle:
───────────────────────────────────────────────

Component Mounts
    │
    ▼
Hook Called with (category, action)
    │
    ▼
Initial State: { hasAccess: false, isLoading: true }
    │
    ▼
useEffect runs (once per category/action change)
    │
    ┌──────────────────────────────────┐
    │                                  │
    ▼                                  ▼
TRY BLOCK                         CATCH BLOCK
    │                                  │
    ▼                                  ▼
getUserPermissions()             Log Error
    │                                  │
    ▼                                  ▼
parseJwt() from                  hasAccess = false
localStorage
    │
    ▼
hasPermission() check
    │
    ▼
setHasAccess(result)
    │
    ▼
setIsLoading(false)
    │
    ▼
Return { hasAccess, isLoading }
    │
    ▼
Component Re-renders with new state
    │
    ▼
UI Updates (show/hide based on hasAccess)


Category/Action Changes
    │
    ▼
useEffect dependency array triggers
    │
    ▼
Process repeats with new values


Component Unmounts
    │
    ▼
Cleanup (hooks automatically cleaned by React)
```

---

## Service Function Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICE FUNCTION HIERARCHY                       │
└─────────────────────────────────────────────────────────────────────┘

                    Data Retrieval Layer
                    ─────────────────────
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
    getUserPermissions()  rolesAccessesList  localStorage
    (from JWT)            (complete list)    (accessToken)
         │                  │                  │
         └──────────────────┴──────────────────┘
                    │
                    ▼
            Basic Check Layer
            ─────────────────
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    hasPermission() hasCategoryAccess() hasFullCategoryAccess()
    (single)       (any in cat)        (all in cat)
        │           │           │
        └───────────┴───────────┘
                    │
                    ▼
        Aggregate Layer
        ──────────────
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
getFeatureVisibility  getAccessibleCategories  getMissingPermissions
Map()                                          ()
    │               │               │
    └───────────────┴───────────────┘
                    │
                    ▼
        Multiple Permission Layer
        ──────────────────────────
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
    hasAnyPermission()  hasAllPermissions()


CALL HIERARCHY (Most to Least Used):
────────────────────────────────────
Frequency:  High  →  Medium  →  Low
            ├─────┤
             │
             ▼
1. hasPermission() - Single permission checks (MOST COMMON)
2. hasCategoryAccess() - Category checks
3. getCategoryPermissions() - Get list of actions
4. hasAnyPermission() - Multiple OR logic
5. hasAllPermissions() - Multiple AND logic
6. getFeatureVisibilityMap() - Get entire visibility map (COMPREHENSIVE)
7. getMissingPermissions() - Comparison results
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

Permission Check Called
        │
        ▼
    Try Block
        │
        ├─────────────────────────────────────┐
        │                                     │
        ▼                                     ▼
   Parse JWT                             Execute Check
        │                                     │
        ▼                                     ▼
   ┌─────────┐                          ┌─────────┐
   │SUCCESS? │                          │SUCCESS? │
   └────┬────┘                          └────┬────┘
        │                                     │
    ┌───┴───┐                            ┌───┴───┐
    ▼       ▼                            ▼       ▼
   YES     NO                           YES     NO
    │       │                            │       │
    │       ▼                            │       ▼
    │    Error!                          │    Error!
    │       │                            │       │
    │       ▼                            │       ▼
    │    CATCH BLOCK                     │    CATCH BLOCK
    │                                    │
    ▼                                    ▼
  Return Result                    Log Error to Console
        │                                │
        ├────────────────────────────────┤
                    │
                    ▼
             FINALLY BLOCK
                    │
                    ▼
         Return Safe Default:
         - false (permission denied)
         - [] (empty array)
         - {} (empty object)
                    │
                    ▼
           Application Continues
          (Features Hidden)
```

---

## Permission Comparison Matrix

```
┌─────────────────────────────────────────────────────────────────────┐
│              PERMISSION COMPARISON MATRIX                           │
└─────────────────────────────────────────────────────────────────────┘

                    Complete List Has Permission
                           YES        NO
                         ┌──────┬──────┐
User Has Permission:  YES│ ✓OK  │ ✗ERR │ → Show Feature
                         ├──────┼──────┤
                       NO │ ✗HID │ ✗HID │ → Hide Feature
                         └──────┴──────┘

Legend:
✓OK  = User has permission, it exists in complete list → SHOW
✗ERR = User has permission, but it doesn't exist in system → IGNORE (safety)
✗HID = User doesn't have permission → HIDE
✗HID = Permission doesn't exist in complete list → HIDE (safety)


RESULT STATES:
──────────────

State 1: Full Access
  Consumer has: {Category: All Actions}
  Complete has: {Category: All Actions}
  Result: ✓ SHOW ALL FEATURES

State 2: Partial Access
  Consumer has: {Category: [Action1, Action2]}
  Complete has: {Category: [Action1, Action2, Action3, Action4]}
  Result: ✓ SHOW Action1, Action2 | ✗ HIDE Action3, Action4

State 3: No Access
  Consumer has: {} (missing Category)
  Complete has: {Category: All Actions}
  Result: ✗ HIDE ENTIRE CATEGORY

State 4: Mixed Categories
  Consumer has: {Cat1: Full, Cat2: Partial, Cat3: None}
  Complete has: {Cat1: All, Cat2: All, Cat3: All}
  Result: ✓ CAT1, ✓ PARTIAL CAT2, ✗ CAT3
```

---

## Usage Frequency vs Complexity

```
┌─────────────────────────────────────────────────────────────────────┐
│            IMPLEMENTATION METHOD COMPARISON CHART                   │
└─────────────────────────────────────────────────────────────────────┘

COMPLEXITY ▲
           │
      High │                      ✓ SERVICE
           │              (Complex Logic)
           │
           │        ✓ HOC            ✓ HOOK
           │  (Component Wrapper)  (Flexible)
           │
       Med │
           │
           │
      Low  │              ✓ GATE
           │          (Simple Render)
           │
           └─────────────────────────────────────────► FREQUENCY OF USE
               Low         Medium        High


USE PATTERN:
────────────

High Frequency,   → Use GATE or HOOK
Low Complexity      (Quick & Simple)

High Frequency,   → Use HOOK
Medium Complexity   (With State)

Low Frequency,    → Use HOC or SERVICE
High Complexity     (One-time Wrapper or Special Logic)


RECOMMENDATION:
───────────────
For 80% of cases:  Use HOOK
For 15% of cases:  Use GATE
For 5% of cases:   Use HOC or SERVICE
```

---

## Summary Table: All Methods Side-by-Side

| Feature | Hook | Gate | HOC | Service |
|---------|------|------|-----|---------|
| **Use Case** | Most common | Simple inline | Component wrapper | Event handlers |
| **Complexity** | Medium | Low | High | High |
| **State** | Yes | No | Partial | No |
| **Loading State** | Yes | No | No | No |
| **Learning Curve** | Easy | Very Easy | Medium | Easy |
| **Performance** | Optimal | Optimal | Good | Optimal |
| **Maintenance** | Easy | Easy | Medium | Hard |
| **Testing** | Easy | Easy | Hard | Easy |
| **Reusability** | Per component | Per instance | Very High | Shared |
| **TypeScript Support** | Full | Full | Full | Full |

---

## Examples Summary

See [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md) for full code examples of:
- MenuBar permission filtering
- Grid action visibility
- Role form with permission tree
- Route protection
- Dashboard widget visibility
- Form field visibility
- Event handler permission checks

See [PERMISSION_QUICK_REF.md](./PERMISSION_QUICK_REF.md) for cheat sheets and quick lookups.
