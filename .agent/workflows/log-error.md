---
description: Log an error or failure pattern for learning purposes.
---

# Log Error Workflow

This workflow is designed to capture failures, hallucinations, or anti-patterns to improve our agentic coding skills.

1.  **Stop and Reflect**: Do not proceed with fixing the code immediately.
2.  **Interview Phase**:
    - I (the Agent) will use `notify_user` to ask you 5-8 specific questions about what went wrong.
    - I will focus on **User Error** (Prompting, Context, Harnessing) rather than just blaming the model.
    - Questions will cover:
      - "What was the exact prompt?"
      - "What did you expect vs what happened?"
      - "Did you specify constraints?"
      - "Was context too full?"
3.  **Analysis**: I will analyze your answers.
4.  **Log Creation**:
    - I will read `logs/metadata.json` to get the next Error ID.
    - I will create a file `logs/errors/error-[ID]-[short-desc].md`.
    - I will populate it with the standard Error Log Template (What Happened, User Error Category, Triggering Prompt, Impact, Prevention).
5.  **Commit**: I will update `logs/metadata.json` with the new ID.
6.  **Rewind (Optional)**: You can then decide to rewind the chat or continue.

**To trigger this, just type `/log-error`.**
