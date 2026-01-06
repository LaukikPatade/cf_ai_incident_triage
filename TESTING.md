# 🧪 Testing Guide

This guide provides test scenarios and verification steps for the AI Incident Triage Assistant.

## Quick Verification Checklist

After starting the development servers, verify these basics:

- [ ] Worker starts without errors (`npm run dev`)
- [ ] Frontend loads at `http://localhost:5173`
- [ ] No console errors in browser
- [ ] Initial welcome message appears
- [ ] Can type and send a message
- [ ] Assistant responds within 3 seconds

## Test Scenarios

### Scenario 1: Database Connection Timeout

**Description**: Test the system's ability to triage a database connectivity issue.

**Input Sequence**:

1. Initial message:
   ```
   Our API is timing out when trying to connect to the database
   ```

2. Answer follow-up questions (example answers):
   - Service: `user-api`
   - Scope: `regional` (only us-east)
   - Recent deploy: `yes` (30 minutes ago)
   - Error message: `Connection timeout after 5000ms`

**Expected Behavior**:
- ✅ Stage transitions: INTAKE → DIAGNOSE → RECOMMEND
- ✅ Signals extracted: service, scope, recentDeploy, primaryError
- ✅ Severity: HIGH or CRITICAL
- ✅ Hypothesis includes deployment-related causes
- ✅ Recommendations include rollback steps

**Validation**:
```javascript
// Check signals panel shows:
{
  service: "user-api",
  symptom: "timeout",
  scope: "regional",
  recentDeploy: "yes",
  environment: "prod"
}
```

---

### Scenario 2: Memory Leak

**Description**: Test diagnosis of a gradual performance degradation.

**Input Sequence**:

1. Initial message:
   ```
   Our service memory usage has been climbing steadily over the past 3 hours
   ```

2. Follow-up responses:
   - Current state: `At 85% memory, started at 40%`
   - Traffic patterns: `No traffic spike, normal load`
   - Recent changes: `No deployments today`
   - Symptoms: `Response times increasing, some requests failing`

**Expected Behavior**:
- ✅ Severity: HIGH
- ✅ Hypothesis mentions memory leak
- ✅ Recommendations include restart and heap dump analysis
- ✅ Monitoring suggestions include memory metrics

---

### Scenario 3: API Rate Limiting

**Description**: Test handling of a recent deployment causing rate limit issues.

**Input Sequence**:

1. Initial message:
   ```
   Users getting 429 errors after our deploy 20 minutes ago
   ```

2. Follow-up:
   - Service: `payment-service`
   - Affected users: `All users globally`
   - Recent changes: `Yes, deployed new retry logic`
   - Error rate: `30% of requests`

**Expected Behavior**:
- ✅ Severity: CRITICAL (user-facing)
- ✅ Quick diagnosis (deployment correlation)
- ✅ Immediate action: rollback recommendation
- ✅ Deeper investigation: review retry logic

---

### Scenario 4: Dependency Failure

**Description**: Test diagnosis of third-party service integration issue.

**Input Sequence**:

1. Initial message:
   ```
   Payment processing is completely down, Stripe API returning errors
   ```

2. Follow-up:
   - Service: `checkout-service`
   - Error: `Stripe API connection refused`
   - Scope: `Global`
   - Started: `5 minutes ago`

**Expected Behavior**:
- ✅ Severity: CRITICAL
- ✅ Hypothesis identifies external dependency
- ✅ Recommendations include checking Stripe status
- ✅ Suggests fallback or circuit breaker

---

### Scenario 5: Minimal Information

**Description**: Test behavior with vague initial input.

**Input Sequence**:

1. Initial message:
   ```
   Something is broken
   ```

**Expected Behavior**:
- ✅ Assistant asks specific clarifying questions
- ✅ Questions cover: what service, what symptoms, when started
- ✅ Remains in INTAKE stage until sufficient info
- ✅ No premature diagnosis

---

## Functional Tests

### Test: Stage Transitions

**Steps**:
1. Start new incident
2. Send initial message
3. Observe stage indicator

**Verify**:
- [ ] Starts in INTAKE stage (📝 icon active)
- [ ] Transitions to DIAGNOSE when ready
- [ ] Ends in RECOMMEND stage
- [ ] No backward transitions
- [ ] Visual indicators update correctly

---

### Test: Signal Extraction

**Steps**:
1. Send message: "Our auth-service is down in us-east after a deploy"
2. Check signals panel

**Verify**:
- [ ] `service: "auth-service"` extracted
- [ ] `scope: "regional"` extracted  
- [ ] `recentDeploy: "yes"` extracted
- [ ] Signals persist across messages
- [ ] Signals update as more info provided

---

### Test: Conversation History

**Steps**:
1. Send 3-4 messages
2. Refresh the page
3. Check if conversation reloads

**Verify**:
- [ ] All messages preserved
- [ ] Correct timestamps
- [ ] Correct user/assistant attribution
- [ ] Stage restored correctly
- [ ] Signals restored correctly

---

### Test: Open Questions Display

**Steps**:
1. Start incident with minimal info
2. Check signals panel

**Verify**:
- [ ] "Open Questions" section appears
- [ ] Questions are specific and relevant
- [ ] Questions disappear after answering
- [ ] Questions guide toward diagnosis

---

### Test: Diagnosis Output

**Steps**:
1. Complete a full incident triage
2. Examine diagnosis in signals panel

**Verify**:
- [ ] Severity badge displayed with appropriate color
- [ ] At least 2-3 hypotheses listed
- [ ] Each hypothesis has confidence level
- [ ] Immediate actions listed (2-4 items)
- [ ] Deeper investigation steps listed
- [ ] Metrics to monitor listed

---

### Test: Error Handling

**Steps**:
1. Stop the Worker (Ctrl+C in terminal)
2. Try sending a message
3. Restart Worker

**Verify**:
- [ ] Error message displayed to user
- [ ] No crash or white screen
- [ ] Can retry after Worker restarts
- [ ] Conversation state preserved

---

## Performance Tests

### Test: Response Latency

**Measure**: Time from sending message to receiving response

**Method**:
```javascript
// In browser console
const start = Date.now();
// Send message
// When response arrives:
const latency = Date.now() - start;
console.log(`Latency: ${latency}ms`);
```

**Target**: < 3000ms for most responses

**Verify**:
- [ ] INTAKE responses: 1-2 seconds
- [ ] DIAGNOSE responses: 2-3 seconds
- [ ] Consistent performance across messages

---

### Test: Concurrent Incidents

**Steps**:
1. Open 3 browser tabs
2. Start incident in each
3. Alternate sending messages

**Verify**:
- [ ] Each incident independent
- [ ] No cross-contamination of state
- [ ] All conversations work correctly
- [ ] No performance degradation

---

## UI/UX Tests

### Test: Chat Interface

**Verify**:
- [ ] Messages auto-scroll to bottom
- [ ] User messages align right
- [ ] Assistant messages align left
- [ ] Timestamps displayed
- [ ] Loading indicator shows while waiting
- [ ] Input disabled during loading
- [ ] Messages formatted correctly (headers, lists, etc.)

---

### Test: Responsive Design

**Steps**:
1. Resize browser window
2. Test on mobile viewport (DevTools)

**Verify**:
- [ ] Layout adapts to narrow screens
- [ ] Sidebar moves below chat on mobile
- [ ] All content accessible
- [ ] No horizontal scrolling
- [ ] Touch-friendly buttons

---

### Test: New Incident Flow

**Steps**:
1. Complete an incident
2. Click "New Incident" button
3. Confirm dialog

**Verify**:
- [ ] Confirmation dialog appears
- [ ] State clears after confirmation
- [ ] New incident ID generated
- [ ] Fresh welcome message
- [ ] Old incident not accessible (expected)

---

## Integration Tests

### Test: Worker ↔ Durable Object Communication

**Method**: Check Worker logs (`wrangler tail`)

**Verify**:
- [ ] Durable Object created on first message
- [ ] Subsequent messages use same instance
- [ ] State persists across messages
- [ ] No errors in DO operations

---

### Test: Workers AI Integration

**Method**: Monitor logs and responses

**Verify**:
- [ ] LLM responses arrive correctly
- [ ] JSON parsing succeeds
- [ ] Fallback works if parsing fails
- [ ] Reasonable inference time (<3s)

---

## Regression Tests

After making changes, verify:

- [ ] All previous scenarios still work
- [ ] No new console errors
- [ ] TypeScript compiles without errors
- [ ] Worker starts successfully
- [ ] Frontend builds successfully

---

## Load Testing (Optional)

For production readiness:

### Simple Load Test

```bash
# Install artillery
npm install -g artillery

# Create test script (artillery.yml):
# config:
#   target: 'http://localhost:8787'
#   phases:
#     - duration: 60
#       arrivalRate: 10
# scenarios:
#   - flow:
#     - post:
#         url: '/api/incident'
#     - post:
#         url: '/api/message'
#         json:
#           incidentId: '{{ incidentId }}'
#           message: 'Test message'

# Run test
artillery run artillery.yml
```

---

## Debugging Checklist

If something isn't working:

1. **Check Worker Logs**:
   ```bash
   npx wrangler tail
   ```

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for red errors
   - Check Network tab for failed requests

3. **Verify Environment**:
   - [ ] Node.js 18+ installed
   - [ ] Wrangler authenticated
   - [ ] Both servers running
   - [ ] Correct ports (8787, 5173)

4. **Clear State**:
   - Clear localStorage
   - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
   - Stop and restart servers

5. **Check Configuration**:
   - [ ] `wrangler.toml` syntax correct
   - [ ] Bindings configured
   - [ ] CORS origins set

---

## Manual Test Script

Run through this sequence to verify everything works:

```
✅ 1. Start Worker (npm run dev)
✅ 2. Start Frontend (npm run dev:frontend)
✅ 3. Open http://localhost:5173
✅ 4. Verify welcome message appears
✅ 5. Send: "Our API is returning 500 errors"
✅ 6. Answer all questions asked
✅ 7. Verify stage transitions occur
✅ 8. Verify diagnosis appears
✅ 9. Check signals panel populated
✅ 10. Refresh page, verify state restored
✅ 11. Click "New Incident"
✅ 12. Verify fresh state
```

---

## Success Criteria

The application is ready for demo/submission when:

- ✅ All quick verification items pass
- ✅ At least 3 test scenarios work correctly
- ✅ No critical bugs in core workflow
- ✅ UI is responsive and polished
- ✅ State persists across page refreshes
- ✅ Documentation is complete

---

## Reporting Issues

When reporting issues, include:

1. Steps to reproduce
2. Expected vs actual behavior
3. Browser and version
4. Console errors (screenshot)
5. Worker logs (if applicable)

Example:
```
Issue: Diagnosis not showing

Steps:
1. Started incident
2. Answered all questions
3. Stage transitioned to RECOMMEND
4. But diagnosis panel is empty

Expected: Diagnosis should show severity and hypotheses
Actual: Panel is blank

Browser: Chrome 120
Console errors: None
Worker logs: "Failed to parse diagnosis response"
```

---

Happy testing! 🎉

