#!/bin/bash
# Launch the CSPD data pipeline
# Run from anywhere — paths are absolute in the pipeline CLAUDE.md

cd "P:/Projects2/sg-general-agents"

claude -p "Read projects/prospector/data-sources/cspd/pipeline/CLAUDE.md and execute the full pipeline for CSPD. Check pipeline/status.json for resumability — skip any phase whose outputs already exist. Write progress to pipeline/log.md as you go." \
  --dangerously-skip-permissions
