/**
 * Centralized Query Key Factory for TanStack Query
 * Ensures consistent query key definitions across the application and enables
 * precise or broad cache invalidations.
 */

export const queryKeys = {
  // Admin Incident Reports
  reports: {
    all: ["reports"] as const,
    list: (filters: { page: number; search?: string; status?: string; channel?: string }) =>
      [...queryKeys.reports.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.reports.all, "detail", id] as const,
    stats: () => [...queryKeys.reports.all, "stats"] as const,
  },

  // Security Advisories
  advisories: {
    all: ["advisories"] as const,
    list: (filters: { page: number; category?: string }) =>
      [...queryKeys.advisories.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.advisories.all, "detail", id] as const,
  },

  // Newsletter Subscribers
  subscribers: {
    all: ["subscribers"] as const,
    list: (filters: { page: number; search?: string }) =>
      [...queryKeys.subscribers.all, "list", filters] as const,
  },

  // Public Contact Submissions
  contact: {
    all: ["contact"] as const,
    list: (filters: { page: number; search?: string; status?: string }) =>
      [...queryKeys.contact.all, "list", filters] as const,
  },

  // Admin Audit Logs
  auditLogs: {
    all: ["auditLogs"] as const,
    list: (filters: { page: number; search?: string; actionType?: string }) =>
      [...queryKeys.auditLogs.all, "list", filters] as const,
  },

  // Admin Team Members
  team: {
    all: ["team"] as const,
    list: () => [...queryKeys.team.all, "list"] as const,
  },

  // Annual Defacement Statistics
  statistics: {
    all: ["statistics"] as const,
    list: () => [...queryKeys.statistics.all, "list"] as const,
  },

  // MDA Portal Session
  mdaSession: {
    all: ["mdaSession"] as const,
    current: () => [...queryKeys.mdaSession.all, "current"] as const,
  },

  // MDA Portal Incidents & Cases
  mdaIncidents: {
    all: ["mdaIncidents"] as const,
    list: (filters: { page: number; search?: string; status?: string }) =>
      [...queryKeys.mdaIncidents.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.mdaIncidents.all, "detail", id] as const,
    dashboardStats: () => [...queryKeys.mdaIncidents.all, "dashboardStats"] as const,
  },

  // MDA Registrations & Organizations Directory
  mdaRegistrations: {
    all: ["mdaRegistrations"] as const,
    list: (filters: { page: number; search?: string; status?: string }) =>
      [...queryKeys.mdaRegistrations.all, "list", filters] as const,
  },

  mdaOrganizations: {
    all: ["mdaOrganizations"] as const,
    list: (filters: { page: number; search?: string }) =>
      [...queryKeys.mdaOrganizations.all, "list", filters] as const,
  },

  // Admin Auth Session
  adminSession: {
    all: ["adminSession"] as const,
    current: () => [...queryKeys.adminSession.all, "current"] as const,
  },

  // Personal Reporter Access
  personalCases: {
    all: ["personalCases"] as const,
    list: (filters: { page: number }) =>
      [...queryKeys.personalCases.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.personalCases.all, "detail", id] as const,
  },

  // Public Widgets
  publicAdvisories: {
    all: ["publicAdvisories"] as const,
    list: (category?: string) => [...queryKeys.publicAdvisories.all, category || "all"] as const,
  },
  publicStats: {
    all: ["publicStats"] as const,
  },
};
