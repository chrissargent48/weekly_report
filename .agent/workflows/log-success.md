---
description: Log a success or win for learning purposes.
---

# Log Success Workflow

This workflow captures what went _right_ so we can repeat it.

1.  **Identify the Win**: Fast completion, elegant solution, or perfect first-try.
2.  **Interview Phase**:
    - I (the Agent) will use `notify_user` to ask 4-6 questions.
    - Questions will cover:
      - "Why did this work so well?"
      - "What specific prompt triggered this?"
      - "Was it luck or good context?"
3.  **Log Creation**:
    - I will read `logs/metadata.json` to get the next Success ID.
    - I will create `logs/successes/success-[ID]-[short-desc].md`.
    - I will populate it with the Success Log Template.
4.  **Commit**: I will update `logs/metadata.json`.

**To trigger this, just type `/log-success`.**
