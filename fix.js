const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'client', 'src', 'app', 'page.tsx');
let content = fs.readFileSync(file, 'utf8');

// conflict 1
content = content.replace(
/<<<<<<< HEAD\r?\nimport \{ usePublicStats, usePublicReports \} from '@\/hooks\/api\/usePublic'\r?\n=======\r?\nimport \{ ISSUE_CATEGORIES \} from '@\/lib\/validations\/reportForm'\r?\nimport \{ toast \} from 'react-hot-toast'\r?\nimport \{ usePublicStats, usePublicReports, usePublicCategories, useRecentActivity \} from '@\/hooks\/api\/usePublic'\r?\n>>>>>>> [a-f0-9]+/,
`import { ISSUE_CATEGORIES } from '@/lib/validations/reportForm'
import { toast } from 'react-hot-toast'
import { usePublicStats, usePublicReports, usePublicCategories, useRecentActivity } from '@/hooks/api/usePublic'`
);

// conflict 2
content = content.replace(
/<<<<<<< HEAD\r?\n=======\r?\n  const \{ data: categories \} = usePublicCategories\(\)\r?\n  const \{ data: recentActivity \} = useRecentActivity\(5\)\r?\n  const \{ data: topVotedReportsResponse \} = usePublicReports\(\{ sort: 'votes', limit: 3, status: 'all' \}\)\r?\n>>>>>>> [a-f0-9]+/,
`  const { data: categories } = usePublicCategories()
  const { data: recentActivity } = useRecentActivity(5)
  const { data: topVotedReportsResponse } = usePublicReports({ sort: 'votes', limit: 3, status: 'all' })`
);

// conflict 3
content = content.replace(
/<<<<<<< HEAD\r?\n                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">[\s\S]*?>>>>>>> [a-f0-9]+/,
`                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Active Citizens</span>
                    <span className="font-extrabold text-slate-900 text-xl">{statsLoading ? '...' : stats?.activeUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Avg. Resolution</span>
                    <span className="font-extrabold text-emerald-600 text-xl">48 Hrs</span>`
);

fs.writeFileSync(file, content);
console.log('Done');
