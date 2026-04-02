/**
 * Search Type Definitions
 */

export interface SearchIssue {
  id: string;
  reportId: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  category?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
}

export interface SearchDepartment {
  id: string;
  name: string;
  description?: string;
  _count?: {
    issues?: number;
    staff?: number;
  };
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters?: Record<string, unknown>;
  createdAt: string;
}

export interface GlobalSearchResults {
  issues: SearchIssue[];
  users: SearchUser[];
  departments: SearchDepartment[];
}

export interface SearchCounts {
  issues: number;
  users: number;
  departments: number;
}
