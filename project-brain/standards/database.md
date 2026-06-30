# Database Standards

- Choose PostgreSQL for relational data.
- Use migration tool (e.g., Prisma, Flyway) for schema changes.
- Follow snake_case naming for tables/columns.
- Define primary keys as `id` with UUID.
- Add indexes on frequently queried fields.
- Write comprehensive README for each schema.
- Enforce NOT NULL and appropriate data types.
- Use transactions for multi‑step updates.
