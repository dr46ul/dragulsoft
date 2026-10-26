export const SERVICES = [
  {
    id: 'web-app',
    detail: 'A',
    title: 'Web apps & SaaS',
    promise: 'The product your business runs on.',
    description: 'Customer portals, internal tools, dashboards and SaaS products, from the first usable version to the one that scales.',
    scope: [
      'Accounts, roles & billing',
      'Dashboards & reporting',
      'Integrations with your tools',
      'Admin & back office',
    ],
    demo: 'board',
  },
  {
    id: 'website',
    detail: 'B',
    title: 'Websites & landing pages',
    promise: 'Sites that load fast and sell clearly.',
    description: 'Marketing sites and landing pages that are quick on any connection, easy for your team to edit, and easy to find.',
    scope: [
      'Content you edit yourself',
      'Several languages',
      'SEO & analytics',
      'Forms that reach you',
    ],
    demo: 'page',
  },
  {
    id: 'ai-integration',
    detail: 'C',
    title: 'AI integrations',
    promise: 'AI wired into the work you already do.',
    description: 'Assistants, document search and automations connected to your own data and tools, with guardrails and costs kept in check.',
    scope: [
      'Assistants on your data',
      'Document extraction',
      'Workflow automation',
      'Evaluation & guardrails',
    ],
    demo: 'flow',
  },
] as const
