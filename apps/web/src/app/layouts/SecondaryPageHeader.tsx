import {ChevronLeft} from 'lucide-react';
import {Link} from 'react-router-dom';
import {LucideIcon} from '@/shared/ui';

function SecondaryPageHeader() {
  return (
    <nav aria-label="보조 페이지 탐색" className="mb-4 w-full sm:mb-6">
      <Link
        className="text-text-muted hover:text-foreground focus-visible:ring-accent/30 inline-flex items-center gap-1.5 rounded-pill px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
        to="/"
      >
        <LucideIcon icon={ChevronLeft} size={16} strokeWidth={2.25} />
        메인으로
      </Link>
    </nav>
  );
}

export {SecondaryPageHeader};
