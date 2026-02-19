---
description: Vault self-knowledge — derivation rationale, configuration state, and operational evolution
type: moc
---

# methodology

This folder records what the system knows about its own operation — why it was configured this way, what the current state is, and how it has evolved.

## Derivation Rationale
- [[derivation-rationale]] — why each configuration dimension was set the way it was

## Configuration State
(Populated by /retrospect, /arscontexta:architect)

## Evolution History
(Populated by /retrospect, /arscontexta:architect, /arscontexta:reseed)

## How to Use This Folder

```bash
# List all methodology notes
ls memory/ops/methodology/

# Search by category
rg '^category:' memory/ops/methodology/

# Find active directives
rg '^status: active' memory/ops/methodology/

# Ask the research graph
# /arscontexta:ask [question about your system]
```

Meta-skills (/retrospect, /arscontexta:architect) read from and write to this folder.
/remember captures operational corrections here.
