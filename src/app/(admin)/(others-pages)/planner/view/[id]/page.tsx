import ViewPlan from "@/components/planner/view-plan";

interface ViewPlanPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ViewPlanPage({ params }: ViewPlanPageProps) {
  const { id } = await params;
  return <ViewPlan planId={id} />;
}
