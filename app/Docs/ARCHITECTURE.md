# Architecture

GafBrain is split into three zones.

## Raw/

Immutable user-owned exports. The compiler reads this folder but never deletes it.

## Brain/

Generated AI-facing memory. This folder is reproducible and can be rebuilt from Raw.

## app/

Replaceable public framework code and docs.

## Update principle

Future releases should update `app/`, `templates/`, and docs.

They should not ship or modify user data in `Raw/`.
