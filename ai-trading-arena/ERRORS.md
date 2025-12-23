# Errors Log - AI Trading Arena

**Purpose:** Document errors encountered and their solutions for future reference.

---

## SQL Errors

### SQL-001: Reserved Keyword "timestamp"

**Error Message:**
```
ERROR: 42601: syntax error at or near "timestamp"
```

**Context:** Running `03_functions.sql` in Supabase SQL Editor

**Root Cause:** `timestamp` is a reserved keyword in PostgreSQL and cannot be used as a column name in RETURNS TABLE without quoting.

**Solution:** Rename the column from `timestamp` to `snapshot_time`:
```sql
RETURNS TABLE (
    snapshot_time TIMESTAMPTZ,  -- Changed from 'timestamp'
    total_value DECIMAL(12, 2),
    daily_return_pct DECIMAL(8, 4)
)
```

**Prevention:** Avoid using reserved SQL keywords as column names. Common ones: `timestamp`, `user`, `order`, `group`, `table`, `index`.

---

## TypeScript Errors

### TS-001: Argument of type 'string | undefined' not assignable

**Error Message:**
```
Type error: Argument of type 'string | undefined' is not assignable to parameter of type '{}'.
Type 'undefined' is not assignable to type '{}'.
```

**Context:** `src/app/(dashboard)/agents/page.tsx` line 20

**Code:**
```typescript
.eq("user_id", user?.id)  // user?.id could be undefined
```

**Root Cause:** TypeScript doesn't know that the parent layout already verified the user exists.

**Solution:** Add explicit null check before using `user.id`:
```typescript
if (!user) {
  return null;
}
// Now user.id is guaranteed to be string
.eq("user_id", user.id)
```

**Prevention:** Always add null checks before accessing potentially undefined properties, even if parent components handle auth.

---

### TS-002: Property does not exist on type 'never'

**Error Message:**
```
Type error: Property 'id' does not exist on type 'never'.
```

**Context:** `src/app/(dashboard)/agents/page.tsx` when mapping over agents

**Root Cause:** Supabase client couldn't infer the return type from the query, defaulting to `never[]`.

**Solution:** Explicitly type the query result:
```typescript
import type { Agent } from "@/types/database";

const { data: agents } = await supabase
  .from("agents")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false }) as { data: Agent[] | null };
```

**Prevention:** Always type Supabase query results explicitly, or ensure the Database type is properly connected to the client.

---

## Next.js Warnings

### NX-001: Middleware Deprecation Warning

**Warning Message:**
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**Context:** Running `bun dev` with Next.js 16

**Root Cause:** Next.js 16 is moving from middleware.ts to a new "proxy" pattern.

**Solution:** Ignore for now - middleware still works. Can migrate to proxy pattern later if needed.

**Impact:** None - warning only, functionality works correctly.

---

*Update this file when encountering and solving errors*
