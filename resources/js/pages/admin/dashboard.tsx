import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DashboardActivityTable, type DashboardActivityData } from "@/components/dashboard-activity-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard().url,
  },

];

interface CardData {
  title: string;
  description: string;
  trend: string;
  trendUp: boolean;
  footer: string;
  footerSubtext: string;
}

interface ChartDataPoint {
  date: string;
  messages: number;
  appointments: number;
}

interface DashboardProps {
  cardsData?: CardData[];
  chartData?: ChartDataPoint[];
  activityData?: DashboardActivityData[];
}

export default function Dashboard() {
  const { props } = usePage<SharedData & DashboardProps>();
  const cardsData = props.cardsData;
  const chartData = props.chartData;
  const activityData = props.activityData || [];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards cardsData={cardsData} />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive chartData={chartData} />
            </div>
            <div className="px-4 lg:px-6">
              <DashboardActivityTable data={activityData} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
