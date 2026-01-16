import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CardData {
  title: string;
  description: string;
  trend: string;
  trendUp: boolean;
  footer: string;
  footerSubtext: string;
}

interface SectionCardsProps {
  cardsData?: CardData[];
}

// Default data if no props provided
const defaultCardsData: CardData[] = [
  {
    title: '50,000',
    description: 'Total File Appointments',
    trend: '+75%',
    trendUp: true,
    footer: 'File Count Appointments Increase',
    footerSubtext: 'Pending Appointments',
  },
  {
    title: '10,234',
    description: 'File Complete',
    trend: '+70%',
    trendUp: true,
    footer: 'Up 70% Complete',
    footerSubtext: 'File Successful Complete',
  },
  {
    title: '2,166',
    description: 'Active Schools Accounts',
    trend: '+100%',
    trendUp: true,
    footer: 'All School is Active',
    footerSubtext: 'Still Monitor',
  },
  {
    title: '4.5%',
    description: 'Growth Rate',
    trend: '+4.5%',
    trendUp: true,
    footer: 'Steady performance increase',
    footerSubtext: 'Meets growth projections',
  },
];

export function SectionCards({ cardsData = defaultCardsData }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cardsData.map((card, index) => (
        <Card key={index} className="@container/card">
          <CardHeader>
            <CardDescription>{card.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.title}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {card.trendUp ? <IconTrendingUp /> : <IconTrendingDown />}
                {card.trend}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.footer} {card.trendUp ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
            </div>
            <div className="text-muted-foreground">
              {card.footerSubtext}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
