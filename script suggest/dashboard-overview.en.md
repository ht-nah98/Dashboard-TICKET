# Dashboard Overview

> **Project**: QLK Ticket Dashboard  
> **Audience**: C-Level, Manager, VHYT Lead, SEO  
> **Version**: 1.0  
> **Updated**: 2026-05-06

---

## 1. Purpose

The Ticket Dashboard is a management and execution dashboard for the QLK operations ticket system. It should not only report ticket counts; it must create management value and support real action.

The dashboard must help:

- **C-Level** see total risk, business impact, trend, and escalation points
- **Managers / VHYT Leads** control SLA, backlog, workload, bottlenecks, and team performance
- **SEO users** know exactly which tickets need action, which are waiting on VHYT, which are close to breach, and what final result each ticket has

The dashboard must answer 5 core questions:

1. What is happening?
2. Why is it happening?
3. Who needs to act?
4. What needs escalation now?
5. What is the business impact if we do nothing?

---

## 2. Scope

The dashboard covers all ticket groups:

- Claim
- Whitelist
- GCD
- GBQ
- TKT / BKT xịt
- Die kênh

It must support at least 3 user groups:

- SEO
- VHYT / Manager / VH Leader
- C-Level

---

## 3. Core Principles

### 3.1. Every widget must answer a question

Every chart, card, and table must answer a clear management or execution question. If a visual cannot answer a real question, it should not exist.

### 3.2. Dashboard must drive action

The dashboard is not only for viewing. It must help users identify:

- which tickets need action now
- which tickets are delayed
- which tickets are high-risk
- which trends are worsening

### 3.3. One system, different role priorities

Not every role should see the same dashboard with the same priority.

- SEO needs an action-oriented view
- Managers need a control-oriented view
- C-Level needs a risk-oriented view

### 3.4. Drill-down is mandatory

Every high-level KPI and visual must support drill-down into:

- ticket list
- ticket type
- project
- channel
- assignee
- status
- time range

---

## 4. Main User Groups and Their Questions

## 4.1. C-Level Questions

C-Level needs fast strategic answers.

Questions:

- How many tickets are currently open?
- How many are critical?
- Which ticket types are increasing abnormally?
- Which projects, nets, or channels create the most risk?
- How much revenue is currently at risk?
- Are teams working within SLA?
- Which ticket types have the worst success rate?
- Are there recurring issues that require upstream prevention?
- Which teams or people are overloaded?
- Are we getting better or worse compared with last week / last month?

## 4.2. Manager / VH Lead Questions

Managers need the dashboard to control daily operations.

Questions:

- How many new tickets came in today / this week?
- How many tickets were completed?
- Which tickets are close to SLA breach?
- Which tickets already breached SLA?
- Which workflow step creates the most delay?
- Which tickets are waiting on SEO?
- Which tickets are waiting on VHYT?
- Which assignees are overloaded?
- Which assignees are slow or have poor success rates?
- Which ticket types consume the most handling time?
- How many tickets are paused, reopened, or stuck?

## 4.3. SEO Questions

SEO does not need a generic reporting dashboard. SEO needs to know what to do.

Questions SEO must be able to answer:

- Which of my tickets need action right now?
- Which tickets are waiting on VHYT?
- Which tickets are waiting on me?
- Which tickets are at risk of SLA breach?
- Which tickets completed successfully?
- Which tickets failed, and why?
- Which tickets were sent back for correction?
- Which tickets are newest, oldest, and most urgent?
- Which of my channels keep repeating the same problem?
- For TKT/BKT xịt: when can I reapply?
- For Die kênh: which termination event is active and which event already has a ticket?
- For Claim / GBQ / GCD: what is my next step?
- Which tickets are paused and need reopen support?

---

## 5. Business Goals of the Dashboard

The dashboard should create value in 5 areas:

1. **Reduce reaction time**
   - users should immediately know which tickets need action
2. **Reduce SLA breach**
   - managers and SEO should see breach risk before it happens
3. **Improve success rate**
   - show which handling options work better
4. **Improve prevention**
   - reveal root causes, repeat channels, risky assets, weak content models
5. **Improve accountability**
   - make it clear whether delay belongs to SEO, VHYT, external parties, or approval flow

---

## 6. Dashboard Page Structure

Recommended dashboard structure: 4 pages.

1. **Executive Overview**
   - for C-Level and senior managers
   - answers the overall risk picture
2. **Operations Control**
   - for managers and VH leads
   - answers where bottlenecks are and who needs intervention
3. **SEO Action Dashboard**
   - for SEO users
   - answers which tickets need action now and who is blocking what
4. **Root Cause & Prevention**
   - for managers, process owners, and C-Level
   - answers why issues repeat and what upstream fixes are needed

---

## 7. Page 1 — Executive Overview

### Purpose

Answers: **What is the current risk picture?**

### Key Questions

- How many tickets are open?
- How many are critical?
- What is current revenue / risk exposure?
- Which ticket types are worst?
- Which projects or channels need executive attention?
- Are outcomes improving or getting worse?

### Suggested Widgets

#### KPI Cards

- Open Tickets
- Critical Open Tickets
- Tickets Breached SLA
- Estimated Revenue at Risk
- Success Rate MTD
- Median Resolution Time

#### Trend Chart

**Question**: Is ticket volume increasing or decreasing?

**Visual**: Line chart by day/week/month, split by ticket type

#### Ticket Type Risk Distribution

**Question**: Which ticket types are the main risk drivers?

**Visual**: Stacked bar or treemap by type

#### Risk by Project / Net

**Question**: Which projects or nets create the highest operational burden?

**Visual**: Heatmap or ranked bar chart

#### Top 10 High-Risk Channels

**Question**: Which channels need management attention now?

**Visual**: Table with channel, project, open ticket count, highest severity, revenue at risk, and days unresolved

#### Outcome Trend

**Question**: Are we getting better at resolving tickets?

**Visual**: Monthly success/failure trend by ticket type

---

## 8. Page 2 — Operations Control

### Purpose

Answers: **Where is the bottleneck, and who must act?**

### Key Questions

- Which tickets need urgent attention?
- Which workflow step is slowest?
- Which assignees are overloaded?
- Which tickets are waiting on SEO, VHYT, or external parties?
- Which tickets are paused or reopened?

### Suggested Widgets

#### Queue Summary

- New today
- In progress
- Waiting on SEO
- Waiting on VHYT
- Paused
- Near SLA breach

#### SLA Compliance

**Question**: Are we meeting SLA?

**Visual**: Gauge or stacked bar: within SLA vs breached SLA

#### Workflow Funnel

**Question**: Where do tickets get stuck in the workflow?

**Visual**: Funnel from Created → Sent → Received → In Progress → Waiting → Completed

#### Aging Buckets

**Question**: How old are open tickets?

**Visual**: Buckets `0-4h`, `4-24h`, `1-3d`, `3-7d`, `7d+`

#### Waiting Responsibility Split

**Question**: Which side is causing the delay?

**Visual**: Pie or stacked bar: waiting on SEO, waiting on VHYT, waiting on external, waiting on approval

#### Assignee Workload

**Question**: Who is overloaded?

**Visual**: Horizontal bar by assignee: open tickets, critical tickets, breached tickets

#### Assignee Performance

**Question**: Who is fast and effective?

**Visual**: Scatter plot with:
- x = avg resolution time
- y = success rate
- bubble size = ticket volume

#### Escalation Board

**Question**: Which tickets need manager intervention now?

**Visual**: Table with ticket ID, type, owner, waiting side, breach risk, and days open

---

## 9. Page 3 — SEO Action Dashboard

### Purpose

Answers: **What do I need to do now?**

### Key Questions

- Which tickets need my action right now?
- Which tickets are waiting on VHYT?
- Which tickets were returned for correction?
- Which tickets are close to SLA breach?
- Which tickets succeeded or failed?
- Which of my tickets or channels keep repeating problems?

### Suggested Widgets

#### My Ticket Summary

- My Open Tickets
- Need My Action
- Waiting on VHYT
- Near SLA Breach
- Completed This Week
- Failed This Week

#### My Action Queue

**Question**: Which tickets do I need to handle now?

**Visual**: Priority table with ticket ID, type, channel, current step, due time, next action, and urgency color

#### Waiting on VHYT

**Question**: Which of my tickets are not blocked by me?

**Visual**: Table with ticket ID, waiting stage, VHYT assignee, and waiting time

#### Returned / Need Correction

**Question**: Which tickets were sent back to me for edit or supplement?

**Visual**: Table with ticket ID, correction round `1/2` or `2/2`, reason, and deadline

#### My Recent Outcomes

**Question**: Which tickets finished recently, and what happened?

**Visual**: List or table including successful, failed, paused, and reopened tickets

#### My Ticket Timeline Trend

**Question**: Am I handling more tickets than before?

**Visual**: Weekly line chart: created, completed, failed

#### Repeat Problem Channels

**Question**: Which of my channels keep generating repeated issues?

**Visual**: Channel table with open tickets, repeated ticket types, and recent outcomes

### SEO Special Widgets by Ticket Type

**TKT / BKT xịt**
- Which channels are eligible for reapply?
- Which channels are blocked by cooldown?
- Which channels already reapplied and still failed?

**Die kênh**
- Which termination events are still active?
- Which termination events already have tickets?
- Which cases need more evidence?

**Claim**
- Which tickets need me to confirm claim removal?
- Which tickets need me to cut/delete or whitelist?

**GBQ / GCD**
- Which tickets need me to submit appeal?
- Which tickets need my final confirmation?

---

## 10. Page 4 — Root Cause & Prevention

### Purpose

Answers: **Why does this keep happening, and what should we fix upstream?**

### Key Questions

- Which root causes generate the most tickets?
- Which channels are recurring channels?
- Which assets, artists, labels, or platforms appear often in failed or repeated cases?
- Which handling options work best?
- Which content models are risky?

### Suggested Widgets

#### Root Cause Pareto

**Question**: What causes most problems?

**Visual**: Pareto chart by root cause

#### Repeat Channels

**Question**: Which channels repeatedly generate tickets?

**Visual**: Ranked recurrence table

#### Risky Assets / Labels / Platforms

**Question**: Which sources appear most often in failed or repeated cases?

**Visual**: Table or heatmap by artist, label, platform, and asset

#### Option Effectiveness

**Question**: Which handling path works best?

**Visual**: Success rate by option

#### Failure Reason Breakdown

**Question**: Why do tickets fail?

**Visual**: Failure reason bar chart

#### Prevention Opportunities

**Question**: What should be fixed upstream to reduce ticket volume?

**Visual**: Summary cards or table:
- unwhitelisted channels with repeated claims
- repeated monetization rejection patterns
- repeated termination patterns
- high-risk content groups

---

## 11. Critical Questions by Ticket Type

## 11.1. Claim

- Which claimers create the most open claims?
- Which labels or assets repeat most often?
- Which handling option removes claims fastest?
- Which channels lose the most revenue from unresolved claims?

## 11.2. Whitelist

- Which channels still need whitelist?
- Which whitelist requests are waiting too long?
- Which networks or whitelist operators are slowest?
- Which channels are still exposed to false claim risk?

## 11.3. GCD

- Which channels are closest to dangerous strike accumulation?
- What is the success rate of GCD handling?
- Do most GCD cases come from music, image, livestream, or other causes?
- How fast does the team react after ticket creation?

## 11.4. GBQ

- Which copyright strike cases are most dangerous now?
- Which option works best?
- Which channels have multiple strike exposure?
- Which cases are close to terminal failure?

## 11.5. TKT / BKT xịt

- Which channels are stuck in monetization failure?
- Which channels are eligible to reapply?
- Which channels are blocked by cooldown?
- What are the main rejection reasons?
- Which support path has the best recovery rate?

## 11.6. Die kênh

- How many termination events are open?
- Which die cases are still recoverable?
- Which die cases carry high legal / compliance risk?
- What are the dominant termination root causes?
- Which cases need executive intervention?

---

## 12. Global Filters

Dashboard pages should support these filters:

- Time range
- Ticket type
- Status
- Project
- Net
- Department
- SEO owner
- VHYT assignee
- Priority / severity
- Waiting responsibility
- Outcome
- Channel
- Root cause

Role defaults:

- **SEO**: `My tickets`
- **Manager**: `My team / my scope`
- **C-Level**: `All`

---

## 13. Drill-down Rules

Every chart should drill down to a filtered ticket list.

Examples:

- click `Breached SLA` → show breached tickets
- click `GBQ` section → filter only GBQ tickets
- click a channel in the leaderboard → open channel risk detail
- click a root cause → show all tickets with that root cause

---

## 14. Suggested KPI Formulas

### Operational KPIs

- `Open Tickets` = tickets not in final completed state
- `Need My Action` = tickets where current step owner = current user
- `Breached SLA` = tickets whose deadline < now and required action is unresolved
- `Median Resolution Time` = median from sent to final outcome
- `Pause Rate` = paused tickets / total tickets
- `Reopen Rate` = reopened tickets / total tickets

### Quality KPIs

- `Success Rate` = successful outcomes / completed tickets
- `Failure Rate` = failed outcomes / completed tickets
- `Repeat Channel Rate` = channels with more than 1 ticket in the period / total channels

### SEO-Specific KPIs

- `My Open Tickets`
- `My Need Action Tickets`
- `My Returned Tickets`
- `My Completed Successful`
- `My Completed Failed`

### Business KPIs

- `Estimated Revenue at Risk`
- `Top Risk Channels`
- `Risk by Project`
- `Avoided Loss from Successful Resolution`

---

## 15. Visual Design Guidance

The dashboard should feel like a **command center**, not just a generic BI report.

Design principles:

- clear separation between `action now`, `trend`, and `insight`
- use red / amber / green only when the status meaning is explicit
- tables must prioritize readability over decoration
- executive page should be summary-first
- SEO page should be task-first
- separate `volume` from `impact`
- separate `speed` from `success`
- separate `ticket finished` from `problem solved`

### Recommended Row Structure

**Executive Overview**
- Row 1: KPI cards
- Row 2: ticket trend + revenue risk
- Row 3: risk by project / type
- Row 4: high-risk channels + escalations

**Operations Control**
- Row 1: queue cards
- Row 2: SLA compliance + aging
- Row 3: workflow funnel + waiting responsibility
- Row 4: assignee workload + escalation board

**SEO Action Dashboard**
- Row 1: my summary cards
- Row 2: need my action + waiting on VHYT
- Row 3: returned tickets + near SLA breach
- Row 4: recent outcomes + repeat problem channels

**Root Cause & Prevention**
- Row 1: root cause cards
- Row 2: Pareto + failure reasons
- Row 3: repeat channels + risky assets
- Row 4: option effectiveness + prevention opportunities

---

## 16. Why This Dashboard Creates Value

This dashboard only creates real value if it helps 3 user groups work better:

**For SEO**
- faster action
- fewer misses
- clearer next steps

**For Managers**
- earlier intervention
- better workload balancing
- clearer visibility into bottlenecks and weak performance

**For C-Level**
- understand operational risk in business terms
- spot structural problems
- prioritize prevention investment more effectively

---

## 17. Recommended Build Phases

If built in phases:

**Phase 1**
- Executive Overview
- Operations Control
- SEO Action Dashboard

These 3 pages already solve:
- visibility
- action clarity
- SLA control

**Phase 2**
- Root Cause & Prevention

This page is highly valuable, but depends on better root-cause tagging quality.

---

## 18. Suggested Next Document

After this overview, the next correct document should be:

**Dashboard Widget Specification**

Each widget should define:

- widget name
- business question answered
- chart type
- data source
- formula
- filter behavior
- click / drill-down behavior
- role visibility

