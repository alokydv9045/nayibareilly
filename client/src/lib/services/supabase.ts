// Deprecated: Supabase has been removed from this project.
// This placeholder exists to prevent import errors during migration.
export const supabase = null as unknown as {
    from: (...args: unknown[]) => never;
};

export function assertSupabaseRemoved(): never {
    throw new Error('Supabase client is removed. Please use the REST API client instead.');
}
