#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-chat-application-319573/backend_server
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

